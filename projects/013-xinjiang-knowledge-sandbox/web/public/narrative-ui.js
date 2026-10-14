import { domains, relations, questions, sources, mapPoints } from './connections.js';
import {inquiryFrame} from './inquiry-spine.js';
import { cues, chapters } from './journey.js';
const $=id=>document.getElementById(id);
export function installNarrativeUI({onSeek,onExplore,onClose,readObservations=()=>[]}){
 let selection=questions[0];
 let observationSignature='';
 const journal=document.createElement('section');journal.className='observation-journal';journal.setAttribute('aria-label','我的观察足迹');
 journal.innerHTML='<h3>把自己的观察，带回故事。</h3><p>选择一个过程继续探索。本页记录会保留到重新打开页面。</p><div id="observation-cases"></div>';
 $('demo-end').querySelector('.result-footer').before(journal);
 function refreshObservations(){
  const rows=readObservations(),signature=JSON.stringify(rows);if(signature===observationSignature)return;observationSignature=signature;
  journal.querySelector('#observation-cases').replaceChildren(...rows.map(row=>{
   const button=document.createElement('button');button.setAttribute('aria-label','观察回看：'+row.title);button.dataset.observed=String(row.observed);button.dataset.case=row.stage;
   const title=document.createElement('b');title.textContent=(row.observed?'✓ ':'＋ ')+row.title;const detail=document.createElement('span');detail.textContent=row.detail;button.append(title,detail);
   button.addEventListener('click',()=>{const cue=cues.find(c=>c.id===row.cue);onExplore(cue.key,cue.shot,cue,row.stage);});return button;
  }));
 }
 const links=relations.map(([a,b,label])=>{
  const p=domains.find(d=>d.id===a),q=domains.find(d=>d.id===b);
  return `<g data-edge="${a} ${b}"><line x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}"/><text x="${(p.x+q.x)/2}" y="${(p.y+q.y)/2-2}">${label}</text></g>`;
 }).join('');
 $('relation-graph').innerHTML=`<svg viewBox="0 0 100 90" preserveAspectRatio="none" aria-hidden="true">${links}</svg>`;
 for(const domain of domains){
  const button=document.createElement('button');button.textContent=domain.name;button.style.left=`${domain.x}%`;button.style.top=`${domain.y/90*100}%`;button.dataset.domain=domain.id;
  button.setAttribute('aria-label',`关系图：${domain.name}`);button.addEventListener('click',()=>show(domain));$('relation-graph').append(button);
 }
 for(const question of questions){
  const button=document.createElement('button');button.textContent=question.name;button.dataset.question=question.id;button.addEventListener('click',()=>show(question));$('result-questions').append(button);
 }
 function show(item){
  selection=item;const active=item.domains??[item.id],source=sources[item.source];
  $('result-title').textContent=item.title;$('result-text').textContent=item.text;
  $('result-source').textContent=`${source.title} ↗`;$('result-source').href=source.url;
  $('result-scope').textContent=`${source.date} · ${source.scope}`;
  $('relation-graph').dataset.selection=item.id;
  $('relation-graph').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(active.includes(b.dataset.domain))));
  $('relation-graph').querySelectorAll('g').forEach(g=>g.classList.toggle('highlight',g.dataset.edge.split(' ').every(d=>active.includes(d))));
  $('result-questions').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.question===item.id)));
 }
 $('result-return').addEventListener('click',()=>onSeek(cues.find(c=>c.id===selection.cue).start));
 $('result-explore').addEventListener('click',()=>{
  const cue=cues.find(c=>c.id===selection.cue);onExplore(...(selection.explore??[cue.key,cue.shot]),cue);
 });
 $('result-close').addEventListener('click',onClose);show(selection);
 return {refreshObservations,reset:()=>show(questions[0]),update(cue){
  const chapter=chapters[cue.chapter],source=sources[cue.source];
  $('story-question').textContent=inquiryFrame(cue).question;$('story-connection').textContent=cue.connection;
  $('story-domains').replaceChildren(...cue.domains.map(id=>{const span=document.createElement('span');span.textContent=domains.find(d=>d.id===id).name;return span;}));
  $('story-evidence-date').textContent=source.date;$('story-evidence-source').textContent=`${source.title} ↗`;$('story-evidence-source').href=source.url;
  const notes=cue.map==='culture'?['四种区域风格','十二木卡姆 / 刀郎 / 吐鲁番 / 哈密','歌、舞、音乐、诗歌与民间叙事','地图仅定位两个相关城市；表演见 UNESCO 原始记录。']:cue.map==='modern'?['三片区 · 2023 总体方案',...mapPoints.modern.map(p=>`${p.name} · ${p.note.replace('方案：','')}`),'城市定位与联系线为解释示意。']:['这一段连接了什么？',chapter.answer,source.scope];
  $('story-evidence').replaceChildren(...notes.map((text,i)=>{const el=document.createElement(i===0?'h3':'p');el.textContent=text;return el;}));
  $('demo-connection').textContent=cue.connection;
 }};
}
