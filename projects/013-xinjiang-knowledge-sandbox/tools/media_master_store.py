"""Retain a byte-exact recording master using the delivered video's shared packets.

The normalized movie already holds the unchanged AVC packets. Keep only the
master's original audio/container/tail bytes and their reconstruction map.
"""
from pathlib import Path
import argparse,gzip,hashlib,json,subprocess,os

PROJECT=Path(__file__).resolve().parents[1]
PROBE='D:/26project/26audio_and_video_project/ffmpeg-n6.1.3-win64-gpl-shared-6.1/bin/ffprobe.exe'
def digest(path):
 h=hashlib.sha256()
 with path.open('rb') as f:
  for b in iter(lambda:f.read(4*1024*1024),b''):h.update(b)
 return h.hexdigest()
def packets(path):
 data=json.loads(subprocess.check_output([PROBE,'-v','error','-select_streams','v:0','-show_packets','-show_entries','packet=pos,size,data_hash','-show_data_hash','sha256','-of','json',str(path)],text=True,encoding='utf-8'))
 return [(int(p['pos']),int(p['size']),p['data_hash']) for p in data['packets']]
def assemble(manifest,output=None):
 m=json.loads(manifest.read_text('utf-8'));video=(manifest.parent/m['video']).resolve(strict=True);gaps=(manifest.parent/m['gaps']).resolve(strict=True)
 if not video.is_relative_to(PROJECT) or not gaps.is_relative_to(PROJECT):raise ValueError('Media dependency outside this project')
 assert digest(video)==m['videoSHA256'] and digest(gaps)==m['gapsSHA256']
 payload=gzip.open(gaps,'rb').read();pieces=sorted(m['pieces'],key=lambda p:p[0]);h=hashlib.sha256();position=0
 target=output.open('xb') if output else None
 try:
  with video.open('rb') as f:
   for at,size,kind,offset in pieces:
    assert at==position
    if kind=='v':f.seek(offset);b=f.read(size)
    else:b=payload[offset:offset+size]
    assert len(b)==size;h.update(b)
    if target:target.write(b)
    position+=size
 finally:
  if target:target.close()
 assert position==m['originalBytes'] and h.hexdigest()==m['originalSHA256']
 return {'pass':True,'restoredBytes':position,'originalSHA256':h.hexdigest(),'written':str(output) if output else None}
def archive(source,video,remove_original):
 source=source.resolve(strict=True);video=video.resolve(strict=True)
 assert source.parent==video.parent and source.is_relative_to(PROJECT/'process') and source!=video
 round_dir=next((p for p in source.parents if p.parent==PROJECT/'process' and p.name.startswith('round-')),None)
 assert round_dir and not (round_dir/'retention.json').exists(),'Only an unfrozen, newly captured round may be compacted'
 assert source.stat().st_nlink==1,'Do not remove shared or historical master aliases'
 manifest=source.with_suffix('.media.json');gap_file=source.with_suffix('.nonvideo.gz')
 assert not manifest.exists() and not gap_file.exists()
 original=packets(source);delivered=packets(video)
 by={}
 for pos,size,sha in delivered:by.setdefault((size,sha),pos)
 shared=sorted([(pos,size,by[(size,sha)]) for pos,size,sha in original if (size,sha) in by])
 assert sum(p[1] for p in shared)>source.stat().st_size*.8,'Video payload did not remain identical; keep the full master'
 pieces=[];cursor=0;gap_offset=0
 with source.open('rb') as f,gzip.open(gap_file,'xb',compresslevel=6) as g:
  for pos,size,other in shared:
   assert pos>=cursor
   if pos>cursor:
    f.seek(cursor);data=f.read(pos-cursor);g.write(data);pieces.append([cursor,len(data),'g',gap_offset]);gap_offset+=len(data)
   pieces.append([pos,size,'v',other]);cursor=pos+size
  if cursor<source.stat().st_size:
   f.seek(cursor);data=f.read();g.write(data);pieces.append([cursor,len(data),'g',gap_offset])
 data={'schemaVersion':1,'kind':'lossless-media-master','originalName':source.name,'originalBytes':source.stat().st_size,'originalSHA256':digest(source),'video':video.name,'videoSHA256':digest(video),'gaps':gap_file.name,'gapsSHA256':digest(gap_file),'sharedVideoPackets':len(shared),'sharedVideoBytes':sum(p[1] for p in shared),'newMasterBytes':gap_file.stat().st_size,'pieces':pieces,'policy':'Original master restores byte for byte; original AAC, MP4 boxes and any tail not in delivery retained; normalized film owns the unchanged video packet bytes.'}
 manifest.write_text(json.dumps(data,separators=(',',':'))+'\n',encoding='utf-8')
 report=assemble(manifest)
 # Verification above reconstructs the exact original bytes before any removal.
 if remove_original:source.unlink()
 report.update({'manifest':str(manifest),'sharedVideoBytes':data['sharedVideoBytes'],'retainedMasterBytes':gap_file.stat().st_size+manifest.stat().st_size,'duplicateBytesAvoided':data['originalBytes']-gap_file.stat().st_size-manifest.stat().st_size if remove_original else 0,'fullMasterRemoved':remove_original})
 return report
def main():
 p=argparse.ArgumentParser();sub=p.add_subparsers(dest='mode',required=True)
 a=sub.add_parser('archive');a.add_argument('--master',required=True);a.add_argument('--video',required=True);a.add_argument('--remove-original',action='store_true')
 r=sub.add_parser('restore');r.add_argument('--manifest',required=True);r.add_argument('--output',required=True)
 v=sub.add_parser('verify');v.add_argument('--manifest',required=True)
 args=p.parse_args()
 if args.mode=='archive':result=archive(Path(args.master),Path(args.video),args.remove_original)
 elif args.mode=='verify':result=assemble(Path(args.manifest).resolve(strict=True))
 else:
  output=Path(args.output).resolve();assert not output.exists();output.parent.mkdir(parents=True,exist_ok=True);result=assemble(Path(args.manifest).resolve(strict=True),output)
 print(json.dumps(result,ensure_ascii=False,indent=2))
if __name__=='__main__':main()
