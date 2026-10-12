import http from 'node:http';
import fs from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../public');
const prefix='/1009_codex_project/014-chinese-token-cinema/';
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.mp3':'audio/mpeg','.mp4':'video/mp4'};
const server=http.createServer(async(req,res)=>{
  try{
    let relative=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
    relative=relative.startsWith(prefix)?relative.slice(prefix.length):relative.replace(/^\//,'');
    if(!relative||relative.endsWith('/'))relative+='index.html';
    const file=path.resolve(root,relative),offset=path.relative(root,file);
    if(offset.startsWith('..')||path.isAbsolute(offset)){res.writeHead(403);res.end();return;}
    const stat=await fs.stat(file);if(!stat.isFile())throw new Error('Not a file');
    const size=stat.size,headers={'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','Accept-Ranges':'bytes'};
    let start=0,end=size-1;
    const range=req.headers.range?.match(/^bytes=(\d*)-(\d*)$/);
    if(range){
      start=range[1]?Number(range[1]):Math.max(0,size-Number(range[2]));
      end=range[1]&&range[2]?Math.min(size-1,Number(range[2])):size-1;
      if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>end||start>=size){res.writeHead(416,{...headers,'Content-Range':`bytes */${size}`});res.end();return;}
      res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${size}`,'Content-Length':end-start+1});
    }else res.writeHead(200,{...headers,'Content-Length':size});
    if(req.method==='HEAD'||!size){res.end();return;}
    const stream=createReadStream(file,{start,end});
    stream.on('error',()=>res.destroy());res.on('close',()=>stream.destroy());stream.pipe(res);
  }catch{res.writeHead(404,{'Content-Type':'text/plain'});res.end('Not found');}
});
const port=Number(process.env.TOKEN_CINEMA_PORT||4324);
server.listen(port,'127.0.0.1',()=>console.log('http://127.0.0.1:'+port+prefix));
