import{readFile,writeFile,mkdir,copyFile,readdir,cp}from'node:fs/promises';
import{fileURLToPath}from'node:url';import path from'node:path';
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),root=path.resolve(project,'../..');
const assetDir=path.join(project,'web/assets');await mkdir(assetDir,{recursive:true});
const data=JSON.parse(await readFile(path.join(root,'projects.json'),'utf8'));
const snapshotDate=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
await writeFile(path.join(assetDir,'projects-snapshot.json'),JSON.stringify({schemaVersion:1,snapshotDate,source:'发布版本根目录 projects.json，构建时快照',projects:data.projects.sort((a,b)=>+a.id-+b.id)},null,2)+'\n');
for(const e of await readdir(path.join(project,'assets'),{withFileTypes:true})){if(e.isFile()&&!['README.md','preview.svg'].includes(e.name))await copyFile(path.join(project,'assets',e.name),path.join(assetDir,e.name));}
await cp(path.join(project,'assets/captures'),path.join(assetDir,'captures'),{recursive:true});
for(const name of ['design-contract.json','decision-log.json'])await copyFile(path.join(project,'experiment',name),path.join(assetDir,name));
console.log(`Oil UI：已同步 ${data.projects.length} 个真实项目与研究素材。纯静态网页无需安装依赖。`);
