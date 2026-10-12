import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath,pathToFileURL} from 'node:url';
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const assets=path.join(project,'web/public/assets/overview');
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE||'C:/Users/yun68/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'));
const content=JSON.parse(await fs.readFile(path.join(assets,'overview-content.json'),'utf8'));
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--disable-gpu','--no-proxy-server']});
try{
  const page=await browser.newPage({viewport:{width:content.width,height:content.height},deviceScaleFactor:1.5});
  const svg=await fs.readFile(path.join(assets,'overview.svg'),'utf8');
  await page.setContent(`<html lang="zh-CN"><head><meta charset="utf-8"><style>html,body{margin:0;background:#090f16}svg{display:block}</style></head><body>${svg}</body></html>`);
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForFunction(()=>Array.from(document.querySelectorAll('image')).every(image=>!!image.getAttribute('href')));
  const geometry=await page.evaluate(()=>{
    const svg=document.querySelector('svg'),texts=Array.from(svg.querySelectorAll('text'));
    const boxes=texts.map(t=>{const b=t.getBBox();return {text:t.textContent,x:b.x,y:b.y,width:b.width,height:b.height};});
    const outside=boxes.filter(b=>b.x<0||b.y<0||b.x+b.width>svg.width.baseVal.value||b.y+b.height>svg.height.baseVal.value);
    const collisions=[];
    for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){
      const a=boxes[i],b=boxes[j],x=Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x),y=Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y);
      if(x>5&&y>4)collisions.push([a.text,b.text]);
    }
    return {outside,collisions,textCount:texts.length,width:svg.width.baseVal.value,height:svg.height.baseVal.value};
  });
  await fs.writeFile(path.join(project,'assets/overview-layout-verification.json'),JSON.stringify(geometry,null,2)+'\n');
  await page.locator('svg').screenshot({path:path.join(assets,'overview.png')});
  for(const [name,y,height] of [['top',0,1220],['data',1700,980],['bottom',3100,1430]]){
    await page.screenshot({path:path.join(project,`assets/overview-proof-${name}.png`),clip:{x:0,y,width:content.width,height},scale:'css'});
  }
  assert.equal(geometry.outside.length,0,'文字超出图边界：'+JSON.stringify(geometry.outside));
  assert.equal(geometry.collisions.length,0,'文字重叠：'+JSON.stringify(geometry.collisions));
  console.log(`总览导出：${content.width*1.5}×${content.height*1.5} PNG、自包含 SVG；${geometry.textCount} 条文字无重叠或裁切。`);
}finally{await browser.close();}
