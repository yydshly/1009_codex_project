import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { styles } = JSON.parse(await fs.readFile(path.join(root,'web/data/catalog.json'),'utf8'));
const items = [...styles.map(style => ({slug:style.slug,url:style.video})), {slug:'opuscar98',url:'https://lemomo-ai.github.io/lemo-opuscar/films/opuscar98.mp4'}];
const results = []; let position = 0;
await Promise.all(Array.from({length:6}, async () => {
  while (position < items.length) {
    const item = items[position++];
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch(item.url,{method:'HEAD',signal:AbortSignal.timeout(20000)});
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        results.push({...item,status:response.status,type:response.headers.get('content-type'),bytes:Number(response.headers.get('content-length')),range:response.headers.get('accept-ranges')}); break;
      } catch (error) { if(attempt === 2) results.push({...item,error:error.message}); }
    }
  }
}));
results.sort((a,b)=>a.slug.localeCompare(b.slug));
await fs.writeFile(path.join(root,'assets/media-link-verification.json'),JSON.stringify({date:'2026-10-09',method:'HEAD，无本地视频下载',results},null,2)+'\n');
console.log(`视频地址 ${results.filter(item=>item.status === 200 && item.type?.includes('video/mp4')).length}/${items.length} 返回有效MP4；${results.filter(item=>item.error).length} 个请求失败。`);
for (const item of results.filter(item=>item.error)) console.log(item.slug,item.error);
