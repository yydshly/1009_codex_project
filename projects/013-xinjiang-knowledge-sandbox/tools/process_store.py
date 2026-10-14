"""Immutable, content-addressed process records. Python 3.10+, standard library only."""
import argparse
import collections
import datetime as dt
import hashlib
import io
import json
import os
from pathlib import Path, PurePosixPath
import shutil
import stat
import tempfile
import zipfile
import zlib

PROJECT = Path(__file__).resolve().parents[1]
EXTERNAL = Path(r'D:\codex\home\visualizations\2026\10\09\01a1212d-d384-7f03-b5af-6df833913d8b')
CHUNK = 4 * 1024 * 1024


def now():
    return dt.datetime.now(dt.timezone.utc).isoformat()


def read_json(path):
    return json.loads(Path(path).read_text(encoding='utf-8-sig'))


def write_json(path, value):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        raise FileExistsError(path)
    with path.open('x', encoding='utf-8', newline='\n') as f:
        json.dump(value, f, ensure_ascii=False, indent=2)
        f.write('\n')


def safe_name(value):
    value = value.replace('\\', '/')
    p = PurePosixPath(value)
    if not value or p.is_absolute() or '..' in p.parts or ':' in value or '\x00' in value:
        raise ValueError(f'Unsafe record path: {value!r}')
    return p.as_posix()


def within(path, root):
    return Path(path).resolve().is_relative_to(Path(root).resolve())


def digest(path):
    h, crc = hashlib.sha256(), 0
    with Path(path).open('rb') as f:
        while block := f.read(CHUNK):
            h.update(block)
            crc = zlib.crc32(block, crc)
    return h.hexdigest(), crc & 0xffffffff


def readonly(path):
    os.chmod(path, stat.S_IREAD)


class Store:
    def __init__(self, project=PROJECT):
        self.project = Path(project).resolve()
        self.process = self.project / 'process'
        self.root = self.process / '.store'
        self.objects = self.root / 'objects' / 'sha256'
        self.signatures = collections.defaultdict(set)
        self.raw = []
        self.archives = []

    def object(self, sha):
        if len(sha) != 64 or any(c not in '0123456789abcdef' for c in sha):
            raise ValueError('Invalid SHA-256')
        return self.objects / sha[:2] / sha

    def put_file(self, path, may_link=False):
        path = Path(path)
        sha, crc = digest(path)
        size = path.stat().st_size
        dest = self.object(sha)
        if not dest.exists():
            dest.parent.mkdir(parents=True, exist_ok=True)
            if may_link and path.stat().st_dev == dest.parent.stat().st_dev:
                os.link(path, dest)
            else:
                # Live files are copied: future live edits must never change history.
                with path.open('rb') as source, dest.open('xb') as target:
                    shutil.copyfileobj(source, target, CHUNK)
                if digest(dest)[0] != sha:
                    raise ValueError(f'Source changed while copying: {path}')
        elif dest.stat().st_size != size:
            raise ValueError('Content store size mismatch')
        self.signatures[(size, crc)].add(sha)
        return {'sha256': sha, 'bytes': size, 'crc32': crc}

    def put_member(self, archive, info):
        safe_name(info.filename)
        if info.flag_bits & 1:
            raise ValueError('Encrypted archives are not supported')
        if self.signatures.get((info.file_size, info.CRC)):
            h = hashlib.sha256()
            with archive.open(info) as f:
                while block := f.read(CHUNK):
                    h.update(block)
            sha = h.hexdigest()  # Reading to EOF also verifies the ZIP CRC.
            dest = self.object(sha)
            if dest.exists():
                return {'sha256': sha, 'bytes': info.file_size, 'crc32': info.CRC}
        incoming = self.root / '.incoming'
        incoming.mkdir(parents=True, exist_ok=True)
        fd, temp = tempfile.mkstemp(dir=incoming, suffix='.part')
        temp = Path(temp)
        h = hashlib.sha256()
        try:
            with os.fdopen(fd, 'wb') as target, archive.open(info) as source:
                while block := source.read(CHUNK):
                    h.update(block)
                    target.write(block)
            sha = h.hexdigest()
            dest = self.object(sha)
            dest.parent.mkdir(parents=True, exist_ok=True)
            if not dest.exists():
                assert within(temp, incoming) and within(dest, self.objects)
                os.replace(temp, dest)
            else:
                temp.unlink()
            self.signatures[(info.file_size, info.CRC)].add(sha)
            return {'sha256': sha, 'bytes': info.file_size, 'crc32': info.CRC}
        finally:
            if temp.exists():
                assert within(temp, incoming)
                temp.unlink()

    def import_archive(self, record):
        path = Path(record['physical'])
        sha, _ = digest(path)
        manifest = self.root / 'archives' / f'{sha}.json'
        members = []
        with zipfile.ZipFile(path) as archive:
            names = [i.filename for i in archive.infolist()]
            if len(names) != len(set(names)):
                raise ValueError(f'Duplicate ZIP member names: {path}')
            for i in archive.infolist():
                name = safe_name(i.filename)
                member = {'path': name, 'kind': 'directory' if i.is_dir() else 'file',
                          'zipDate': list(i.date_time), 'externalAttr': i.external_attr,
                          'createSystem': i.create_system, 'commentHex': i.comment.hex(),
                          'extraHex': i.extra.hex(), 'compression': i.compress_type}
                if not i.is_dir():
                    member.update(self.put_member(archive, i))
                members.append(member)
            report = {'schemaVersion': 1, 'kind': 'shared-archive', 'originalPath': record['path'],
                      'originalZIP': {'bytes': record['bytes'], 'sha256': sha},
                      'storage': 'ZIP retired after verified import; member bytes retained once by SHA-256. Export recreates equivalent member contents, not the original compressed ZIP bytes.',
                      'commentHex': archive.comment.hex(), 'members': members}
        if not manifest.exists():
            write_json(manifest, report)
        result = {**record, 'sha256': sha, 'manifest': manifest.relative_to(self.process).as_posix(),
                  'sidecar': str(PurePosixPath(record['path']).with_suffix('.archive.json')),
                  'members': len(members)}
        self.archives.append(result)
        return result

    def inventory(self):
        allowed = [self.process.resolve(), EXTERNAL / 'xinjiang-retained-process',
                   EXTERNAL / 'xinjiang-retained-checkpoints']
        records, junctions = [], []
        stack = [(self.process, self.process.resolve())]
        while stack:
            logical, physical = stack.pop()
            if not any(within(physical, root) for root in allowed):
                raise ValueError(f'Unexpected external path: {physical}')
            with os.scandir(physical) as entries:
                for e in entries:
                    if e.name in {'.store', '__pycache__'}:
                        continue
                    p = Path(e.path)
                    lp = logical / e.name
                    st = e.stat(follow_symlinks=False)
                    reparse = e.is_symlink() or bool(getattr(st, 'st_file_attributes', 0) & 0x400)
                    if e.is_dir():
                        target = p.resolve()
                        if reparse:
                            if not any(within(target, root) for root in allowed):
                                raise ValueError(f'Unapproved junction: {p}')
                            junctions.append({'logical': lp.relative_to(self.process).as_posix(),
                                              'physical': str(target)})
                        stack.append((lp, target))
                    elif e.is_file() and not reparse:
                        s = p.stat()
                        records.append({'path': lp.relative_to(self.process).as_posix(),
                                        'physical': str(p), 'bytes': s.st_size, 'mtimeNs': s.st_mtime_ns})
                    else:
                        raise ValueError(f'Unsupported process entry: {p}')
        return sorted(records, key=lambda x: x['path']), junctions

    def migrate_prepare(self, audit):
        audit = Path(audit)
        if (self.root / 'catalog.json').exists():
            raise FileExistsError('Migration already prepared; use verify/apply, not re-import')
        records, junctions = self.inventory()
        write_json(audit / 'inventory-complete-before.json', {'files': records, 'junctions': junctions,
                   'bytes': sum(f['bytes'] for f in records), 'FBytes': sum(f['bytes'] for f in records if Path(f['physical']).drive.upper() == self.process.drive.upper())})
        print(f'Importing {len(records)} files; originals remain in place.', flush=True)
        for record in records:
            if record['path'].lower().endswith('.zip'):
                continue
            source = Path(record['physical'])
            may_link = within(source, self.process) and '/' in record['path']
            self.raw.append({**record, **self.put_file(source, may_link=may_link)})
        print(f'Imported {len(self.raw)} ordinary files; validating ZIP members.', flush=True)
        for record in records:
            if record['path'].lower().endswith('.zip'):
                a = self.import_archive(record)
                print(f"Imported {a['path']}: {a['members']} members", flush=True)
        catalog = {'schemaVersion': 1, 'createdAt': now(), 'project': self.project.name,
                   'files': self.raw, 'archives': self.archives, 'junctions': junctions}
        write_json(self.root / 'catalog.json', catalog)
        groups = sorted({f['path'].split('/')[0] for f in self.raw if '/' in f['path']})
        for group in groups:
            snapshot = {'schemaVersion': 1, 'id': group, 'kind': 'process-snapshot', 'createdAt': now(),
                        'files': [dict((k, f[k]) for k in ('path', 'sha256', 'bytes', 'crc32', 'mtimeNs'))
                                  for f in self.raw if f['path'].startswith(group + '/')],
                        'archives': [a['manifest'] for a in self.archives if a['path'].startswith(group + '/')]}
            write_json(self.root / 'snapshots' / f'{group}.json', snapshot)
        # Construct same-volume views for old cross-volume directory junctions.
        external = []
        for j in junctions:
            if within(j['physical'], self.process):
                continue
            prefix = j['logical'] + '/'
            view = self.root / 'views' / j['logical']
            view.mkdir(parents=True, exist_ok=True)
            expected = []
            for f in self.raw:
                if f['path'].startswith(prefix):
                    relative = f['path'][len(prefix):]
                    target = view / relative
                    target.parent.mkdir(parents=True, exist_ok=True)
                    os.link(self.object(f['sha256']), target)
                    expected.append({'path': relative, 'sha256': f['sha256'], 'bytes': f['bytes']})
            for a in self.archives:
                if a['path'].startswith(prefix):
                    target = view / a['sidecar'][len(prefix):]
                    target.parent.mkdir(parents=True, exist_ok=True)
                    os.link(self.process / a['manifest'], target)
                    h, _ = digest(target)
                    expected.append({'path': target.relative_to(view).as_posix(), 'sha256': h, 'bytes': target.stat().st_size})
            external.append({**j, 'view': str(view), 'expectedFiles': expected,
                             'originalFiles': [f for f in records if f['path'].startswith(prefix)]})
        local_links = []
        for f in self.raw:
            source = Path(f['physical'])
            if '/' not in f['path'] or not within(source, self.process):
                continue
            obj = self.object(f['sha256'])
            if source.stat().st_ino != obj.stat().st_ino:
                local_links.append({**f, 'object': str(obj)})
        local_archives = [a for a in self.archives if within(a['physical'], self.process)]
        plan = {'schemaVersion': 1, 'process': str(self.process), 'store': str(self.root),
                'allowedExternalRoots': [str(EXTERNAL / 'xinjiang-retained-process'), str(EXTERNAL / 'xinjiang-retained-checkpoints')],
                'localLinks': local_links, 'localArchives': local_archives, 'externalViews': external,
                'allOriginalFiles': [{**f, 'sha256': next((x['sha256'] for x in self.raw if x['path'] == f['path']),
                                         next((x['sha256'] for x in self.archives if x['path'] == f['path']), None))} for f in records]}
        write_json(audit / 'apply-plan.json', plan)
        print(json.dumps(self.verify(), ensure_ascii=False), flush=True)

    def verify(self):
        catalog = read_json(self.root / 'catalog.json')
        refs = catalog['files'][:]
        for p in (self.root / 'snapshots').glob('*.json'):
            refs.extend(read_json(p)['files'])
        for a in catalog['archives']:
            refs.extend(m for m in read_json(self.process / a['manifest'])['members'] if m['kind'] == 'file')
        unique = {f['sha256']: f for f in refs}
        for sha, record in unique.items():
            obj = self.object(sha)
            if not obj.is_file() or obj.stat().st_size != record['bytes'] or digest(obj)[0] != sha:
                raise ValueError(f'Missing or corrupt object: {sha}')
        result = {'pass': True, 'uniqueObjects': len(unique), 'uniqueBytes': sum(x['bytes'] for x in unique.values()),
                  'rawFiles': len(catalog['files']), 'archives': len(catalog['archives']),
                  'archiveMembers': sum(a['members'] for a in catalog['archives'])}
        return result

    def freeze(self):
        for p in self.objects.glob('*/*'):
            readonly(p)
        for p in (self.root / 'archives').glob('*.json'):
            readonly(p)
        for p in (self.root / 'snapshots').glob('*.json'):
            readonly(p)
        if (self.root / 'catalog.json').exists():
            readonly(self.root / 'catalog.json')

    def measure(self):
        identities = {}
        logical = 0
        stack = [self.process]
        while stack:
            folder = stack.pop()
            with os.scandir(folder) as entries:
                for entry in entries:
                    st = entry.stat(follow_symlinks=False)
                    if entry.is_symlink() or getattr(st, 'st_file_attributes', 0) & 0x400:
                        continue
                    if entry.is_dir(follow_symlinks=False):
                        stack.append(Path(entry.path))
                    elif entry.is_file(follow_symlinks=False):
                        logical += st.st_size
                        # Windows DirEntry.stat caches WIN32_FIND_DATA, which
                        # reports zero file ids; os.stat queries the real identity.
                        identity = Path(entry.path).stat()
                        identities[(identity.st_dev, identity.st_ino)] = identity.st_size
        actual = sum(identities.values())
        return {'measurement': 'Unique file data by filesystem identity; shared links counted once; junction paths excluded because their active views are inside the store.',
                'uniqueFileBytes': actual, 'uniqueFileGiB': round(actual / 1024**3, 3),
                'logicalEntryBytes': logical, 'logicalEntryGiB': round(logical / 1024**3, 3),
                'uniqueFiles': len(identities)}

    def archive_manifest(self, value):
        if isinstance(value, dict):
            return value
        p = Path(value)
        if p.exists():
            return read_json(p)
        catalog = read_json(self.root / 'catalog.json')
        normalized = str(p).replace('\\', '/')
        for a in catalog['archives']:
            if normalized in (a['path'], a['sidecar']):
                return read_json(self.process / a['manifest'])
        raise FileNotFoundError(value)

    def validate_members(self, manifest):
        checked = set()
        for record in manifest['members']:
            safe_name(record['path'])
            if record['kind'] != 'file' or 'inlineHex' in record or record['sha256'] in checked:
                continue
            obj = self.object(record['sha256'])
            if not obj.is_file() or obj.stat().st_size != record['bytes'] or digest(obj)[0] != record['sha256']:
                raise ValueError(f'Cannot recover corrupt or missing object: {record["sha256"]}')
            checked.add(record['sha256'])

    def snapshot_manifest(self, round_id):
        if '/' in safe_name(round_id):
            raise ValueError('Use a snapshot id')
        snapshot_path = self.root / 'snapshots' / f'{round_id}.json'
        snapshot = read_json(snapshot_path)
        members = []
        for record in snapshot['files']:
            prefix = round_id + '/'
            if not record['path'].startswith(prefix):
                raise ValueError('Snapshot file has the wrong round prefix')
            stamp = dt.datetime.fromtimestamp(record['mtimeNs'] / 1e9, dt.timezone.utc) if record.get('mtimeNs') else dt.datetime.fromisoformat(snapshot['createdAt'])
            zip_date = list(stamp.timetuple()[:6]) if 1980 <= stamp.year <= 2107 else [1980, 1, 1, 0, 0, 0]
            members.append({**record, 'path': record['path'][len(prefix):], 'kind': 'file',
                            'zipDate': zip_date, 'externalAttr': 0,
                            'createSystem': 0, 'commentHex': '', 'extraHex': '',
                            'compression': zipfile.ZIP_DEFLATED})
        stamp = dt.datetime.fromisoformat(snapshot['createdAt'])
        members.append({'path': 'retention.json', 'kind': 'file', 'inlineHex': snapshot_path.read_bytes().hex(),
                        'zipDate': list(stamp.timetuple()[:6]), 'externalAttr': 0, 'createSystem': 0,
                        'commentHex': '', 'extraHex': '', 'compression': zipfile.ZIP_DEFLATED})
        return {'kind': 'process-snapshot-export', 'commentHex': '', 'members': members}

    def export(self, value, output):
        manifest = self.archive_manifest(value)
        output = Path(output).resolve()
        if within(output, self.root):
            raise ValueError('Export outside the immutable store')
        if output.exists():
            raise FileExistsError(output)
        self.validate_members(manifest)
        output.parent.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(output, 'x', compression=zipfile.ZIP_DEFLATED, compresslevel=4) as z:
            z.comment = bytes.fromhex(manifest['commentHex'])
            for record in manifest['members']:
                name = safe_name(record['path'])
                if record['kind'] == 'directory':
                    z.writestr(name.rstrip('/') + '/', b'')
                    continue
                info = zipfile.ZipInfo(name, tuple(record['zipDate']))
                info.external_attr = record['externalAttr']
                info.create_system = record['createSystem']
                info.comment = bytes.fromhex(record['commentHex'])
                info.extra = bytes.fromhex(record['extraHex'])
                info.compress_type = record['compression']
                source = io.BytesIO(bytes.fromhex(record['inlineHex'])) if 'inlineHex' in record else self.object(record['sha256']).open('rb')
                with source, z.open(info, 'w', force_zip64=True) as target:
                    shutil.copyfileobj(source, target, CHUNK)
        return {'path': str(output), 'members': len(manifest['members']), 'bytes': output.stat().st_size}

    def restore(self, value, output):
        manifest = self.archive_manifest(value)
        output = Path(output).resolve()
        if output.exists() or within(output, self.process):
            raise ValueError('Restore into a new directory outside process/')
        self.validate_members(manifest)
        output.mkdir(parents=True)
        for record in manifest['members']:
            target = output / safe_name(record['path'])
            if not within(target, output):
                raise ValueError('Restore target escaped output directory')
            if record['kind'] == 'directory':
                target.mkdir(parents=True, exist_ok=True)
            else:
                target.parent.mkdir(parents=True, exist_ok=True)
                if 'inlineHex' in record:
                    target.write_bytes(bytes.fromhex(record['inlineHex']))
                else:
                    shutil.copyfile(self.object(record['sha256']), target)
                os.chmod(target, stat.S_IREAD | stat.S_IWRITE)
        return {'path': str(output), 'members': len(manifest['members'])}

    def save(self, round_id, base=None, source=None, mount='source-recorded/public'):
        if not round_id.startswith('round-') or '/' in safe_name(round_id):
            raise ValueError('Use a round-NN id')
        snapshot_path = self.root / 'snapshots' / f'{round_id}.json'
        if snapshot_path.exists():
            raise FileExistsError('Snapshot already frozen; choose a new round id')
        if base and ('/' in safe_name(base) or not (self.root / 'snapshots' / f'{base}.json').is_file()):
            raise ValueError('Base snapshot is missing')
        mount = safe_name(mount)
        round_dir = self.process / round_id
        if (round_dir / 'retention.json').exists():
            raise FileExistsError('Round retention manifest already exists')
        if round_dir.is_symlink() or (round_dir.exists() and getattr(round_dir.stat(follow_symlinks=False), 'st_file_attributes', 0) & 0x400):
            raise ValueError('New rounds must be ordinary directories')
        round_dir.mkdir(parents=True, exist_ok=True)
        rows, created_objects = [], []
        existing_objects = {p.name for p in self.objects.glob('*/*')}
        def add(path, relative):
            own_evidence = within(path, round_dir)
            original_mtime = path.stat().st_mtime_ns
            record = self.put_file(path, may_link=own_evidence)
            sha = record['sha256']
            row = {'path': round_id + '/' + safe_name(relative), 'mtimeNs': original_mtime, **record}
            rows.append(row)
            if sha not in existing_objects:
                created_objects.append(sha)
            target = round_dir / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            if target.exists():
                if digest(target)[0] != sha:
                    raise ValueError('Conflicting snapshot file')
                obj = self.object(sha)
                if target.stat().st_ino != obj.stat().st_ino:
                    # Replace only this new round's evidence, after storing and
                    # verifying the original. Live source files stay independent.
                    assert within(target, round_dir) and within(obj, self.objects)
                    temporary = target.with_name(target.name + '.shared-link')
                    if temporary.exists():
                        raise FileExistsError(temporary)
                    os.link(obj, temporary)
                    os.chmod(target, stat.S_IREAD | stat.S_IWRITE)
                    os.replace(temporary, target)
            else:
                os.link(self.object(sha), target)
        for folder, dirs, names in os.walk(round_dir, followlinks=False):
            dirs[:] = [n for n in dirs if n != '__pycache__']
            if any(getattr((Path(folder) / n).stat(follow_symlinks=False), 'st_file_attributes', 0) & 0x400 for n in dirs):
                raise ValueError('Evidence input contains a directory junction')
            for name in names:
                p = Path(folder) / name
                if p.suffix.lower() == '.zip':
                    raise ValueError('Keep incrementally; use export for a standalone ZIP')
                if p.is_symlink() or getattr(p.stat(follow_symlinks=False), 'st_file_attributes', 0) & 0x400:
                    raise ValueError('Snapshot input contains a reparse point')
                add(p, p.relative_to(round_dir).as_posix())
        if source:
            source = Path(source).resolve()
            if not within(source, self.project) or within(source, self.process):
                raise ValueError('Source must be a live project directory outside process/')
            for folder, dirs, names in os.walk(source, followlinks=False):
                dirs[:] = [n for n in dirs if n not in {'node_modules', '__pycache__', '.cache'}]
                if any(getattr((Path(folder) / n).stat(follow_symlinks=False), 'st_file_attributes', 0) & 0x400 for n in dirs):
                    raise ValueError('Live source contains a directory junction')
                for name in names:
                    if name == '.env' or (name.startswith('.env.') and name != '.env.example') or Path(name).suffix.lower() in {'.pem', '.key', '.tmp', '.log'}:
                        continue
                    p = Path(folder) / name
                    if p.is_symlink() or getattr(p.stat(follow_symlinks=False), 'st_file_attributes', 0) & 0x400:
                        raise ValueError('Source input contains a reparse point')
                    add(p, mount + '/' + p.relative_to(source).as_posix())
        previous = read_json(self.root / 'snapshots' / f'{base}.json')['files'] if base else []
        def source_map(records):
            return {f['path'].split('/', 1)[1]: f['sha256'] for f in records
                    if '/' in f['path'] and f['path'].split('/', 1)[1].startswith(mount + '/')}
        prior, current = source_map(previous), source_map(rows)
        delta = {'added': sorted(current.keys() - prior.keys()), 'removed': sorted(prior.keys() - current.keys()),
                 'changed': sorted(k for k in current.keys() & prior.keys() if current[k] != prior[k]),
                 'unchanged': len([k for k in current.keys() & prior.keys() if current[k] == prior[k]])}
        manifest = {'schemaVersion': 1, 'kind': 'process-snapshot', 'id': round_id, 'createdAt': now(),
                    'base': base, 'files': rows, 'archives': [], 'sourceDelta': delta,
                    'newObjects': len(set(created_objects)), 'newBytes': sum(self.object(s).stat().st_size for s in set(created_objects))}
        write_json(snapshot_path, manifest)
        os.link(snapshot_path, round_dir / 'retention.json')
        self.freeze()
        return manifest


def main():
    p = argparse.ArgumentParser(description=__doc__)
    sub = p.add_subparsers(dest='command', required=True)
    m = sub.add_parser('prepare'); m.add_argument('--audit', type=Path, required=True)
    sub.add_parser('verify'); sub.add_parser('freeze'); sub.add_parser('measure')
    for command in ('export', 'restore'):
        c = sub.add_parser(command)
        selection = c.add_mutually_exclusive_group(required=True)
        selection.add_argument('--archive'); selection.add_argument('--round')
        c.add_argument('--output', required=True)
    c = sub.add_parser('save'); c.add_argument('--round', required=True); c.add_argument('--base'); c.add_argument('--source', type=Path); c.add_argument('--mount', default='source-recorded/public')
    args = p.parse_args(); store = Store()
    if args.command == 'prepare':
        store.migrate_prepare(args.audit)
    elif args.command == 'verify':
        print(json.dumps(store.verify(), ensure_ascii=False, indent=2))
    elif args.command == 'freeze':
        store.freeze()
    elif args.command == 'measure':
        print(json.dumps(store.measure(), ensure_ascii=False, indent=2))
    elif args.command in ('export', 'restore'):
        selection = store.snapshot_manifest(args.round) if args.round else args.archive
        print(json.dumps(getattr(store, args.command)(selection, args.output), ensure_ascii=False, indent=2))
    else:
        result = store.save(args.round, args.base, args.source, args.mount)
        print(json.dumps({k: v for k, v in result.items() if k != 'files'}, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
