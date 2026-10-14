"""Integration checks for retention, reconstruction, and incremental snapshots."""
from pathlib import Path
import hashlib
import json
import os
import shutil
import stat
import tempfile
import unittest
import zipfile
from process_store import Store, digest, read_json, safe_name

FIXTURES = Path(__file__).resolve().parents[1] / 'storage' / 'dedupe-2026-10-11' / 'test-fixtures'


class ProcessStoreTests(unittest.TestCase):
    def setUp(self):
        FIXTURES.mkdir(parents=True, exist_ok=True)
        self.root = Path(tempfile.mkdtemp(dir=FIXTURES)).resolve()
        self.store = Store(self.root)
        (self.root / 'process').mkdir()

    def tearDown(self):
        self.assertTrue(self.root.is_relative_to(FIXTURES.resolve()))
        def writable_remove(function, path, error):
            self.assertTrue(Path(path).resolve().is_relative_to(self.root))
            os.chmod(path, stat.S_IREAD | stat.S_IWRITE)
            function(path)
        shutil.rmtree(self.root, onerror=writable_remove)

    def archive(self, name, content):
        path = self.root / name
        with zipfile.ZipFile(path, 'x', compression=zipfile.ZIP_DEFLATED) as z:
            for entry, data in content.items():
                z.writestr(entry, data)
        return self.store.import_archive({'physical': str(path), 'path': name, 'bytes': path.stat().st_size})

    def test_archive_variants_keep_both_versions_and_export_exact_members(self):
        one = self.archive('one.zip', {'source/a.js': b'version 1', 'shot.png': b'same image'})
        two = self.archive('two.zip', {'source/a.js': b'version 2', 'shot.png': b'same image'})
        first = read_json(self.store.process / one['manifest'])
        second = read_json(self.store.process / two['manifest'])
        self.assertNotEqual(first['members'][0]['sha256'], second['members'][0]['sha256'])
        self.assertEqual(first['members'][1]['sha256'], second['members'][1]['sha256'])
        self.assertEqual(len(list(self.store.objects.glob('*/*'))), 3)
        output = self.root / 'export.zip'
        self.store.export(self.store.process / two['manifest'], output)
        with zipfile.ZipFile(output) as z:
            self.assertIsNone(z.testzip())
            self.assertEqual(z.read('source/a.js'), b'version 2')
            self.assertEqual(z.read('shot.png'), b'same image')

    def test_restore_produces_independent_editable_copies(self):
        archive = self.archive('input.zip', {'source.js': b'original'})
        manifest = read_json(self.store.process / archive['manifest'])
        output = self.root / 'restored'
        self.store.freeze()
        self.store.restore(self.store.process / archive['manifest'], output)
        (output / 'source.js').write_bytes(b'edited')
        self.assertEqual(self.store.object(manifest['members'][0]['sha256']).read_bytes(), b'original')

    def test_unchanged_round_saves_zero_new_payloads_live_edits_preserve_history(self):
        source = self.root / 'web' / 'public'; source.mkdir(parents=True)
        (source / 'a.js').write_bytes(b'first'); (source / 'gone.js').write_bytes(b'delete later')
        (source / '.env').write_text('PRIVATE', encoding='utf-8')
        first = self.store.save('round-01', source=source)
        second = self.store.save('round-02', base='round-01', source=source)
        self.assertEqual(second['newObjects'], 0)
        self.assertEqual(second['newBytes'], 0)
        self.assertEqual(second['sourceDelta']['unchanged'], 2)
        self.assertFalse(any(f['path'].endswith('/.env') for f in first['files']))
        (source / 'a.js').write_bytes(b'second'); (source / 'gone.js').unlink(); (source / 'new.js').write_bytes(b'new')
        third = self.store.save('round-03', base='round-02', source=source)
        self.assertEqual(third['sourceDelta']['changed'], ['source-recorded/public/a.js'])
        self.assertEqual(third['sourceDelta']['removed'], ['source-recorded/public/gone.js'])
        self.assertEqual(third['sourceDelta']['added'], ['source-recorded/public/new.js'])
        old = self.root / 'process/round-01/source-recorded/public/a.js'
        self.assertEqual(old.read_bytes(), b'first')
        self.assertNotEqual(old.stat().st_ino, (source / 'a.js').stat().st_ino)
        self.assertEqual(old.stat().st_ino, (self.root / 'process/round-02/source-recorded/public/a.js').stat().st_ino)

    def test_repeated_evidence_uses_one_file_allocation(self):
        for name in ['round-01', 'round-02']:
            folder = self.root / 'process' / name; folder.mkdir()
            (folder / 'frame.png').write_bytes(b'frame')
            self.store.save(name)
        one = self.root / 'process/round-01/frame.png'
        two = self.root / 'process/round-02/frame.png'
        self.assertEqual(one.stat().st_ino, two.stat().st_ino)
        self.assertEqual(len(list(self.store.objects.glob('*/*'))), 1)
        measured = self.store.measure()
        self.assertEqual(measured['uniqueFiles'], 3)  # One frame, two round manifests.
        self.assertGreater(measured['uniqueFileBytes'], 0)
        self.assertGreater(measured['logicalEntryBytes'], measured['uniqueFileBytes'])

    def test_complete_round_can_be_exported_and_restored(self):
        source = self.root / 'web/public'; source.mkdir(parents=True)
        (source / 'a.js').write_bytes(b'recorded source')
        round_dir = self.root / 'process/round-01'; round_dir.mkdir()
        (round_dir / 'frame.png').write_bytes(b'actual frame')
        self.store.save('round-01', source=source)
        manifest = self.store.snapshot_manifest('round-01')
        output = self.root / 'round-export.zip'
        self.store.export(manifest, output)
        with zipfile.ZipFile(output) as z:
            self.assertEqual(z.read('source-recorded/public/a.js'), b'recorded source')
            self.assertEqual(z.read('frame.png'), b'actual frame')
            self.assertEqual(json.loads(z.read('retention.json'))['id'], 'round-01')
        self.store.restore(manifest, self.root / 'round-restored')
        self.assertEqual((self.root / 'round-restored/frame.png').read_bytes(), b'actual frame')

    def test_corrupt_object_blocks_export_before_creating_a_delivery(self):
        archive = self.archive('original.zip', {'a.txt': b'original'})
        manifest = read_json(self.store.process / archive['manifest'])
        obj = self.store.object(manifest['members'][0]['sha256'])
        obj.write_bytes(b'corrupted')
        output = self.root / 'must-not-exist.zip'
        with self.assertRaises(ValueError):
            self.store.export(manifest, output)
        self.assertFalse(output.exists())

    def test_rejects_path_traversal_and_ambiguous_archive_members(self):
        for path in ['../escape', '/absolute', 'C:/drive', 'safe/../../escape']:
            with self.assertRaises(ValueError):
                safe_name(path)
        with self.assertRaises(ValueError):
            self.archive('unsafe.zip', {'../escape': b'x'})
        archive = self.archive('valid.zip', {'a.txt': b'a'})
        existing = self.root / 'exists'; existing.mkdir()
        with self.assertRaises(ValueError):
            self.store.restore(self.store.process / archive['manifest'], existing)


if __name__ == '__main__':
    unittest.main(verbosity=2)
