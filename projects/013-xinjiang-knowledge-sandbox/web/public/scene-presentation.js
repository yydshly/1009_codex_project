// The same attention policy drives the live player and the actual film.
export function presentationFrame({elapsed=0,live=null,flight=false,ended=false,captionsReady=true}={}){
 const choice=live?.decision,reply=!!live?.dialogue;
 const phase=ended?'ending':flight||!captionsReady?'travel':reply?'reply':choice&&!choice.choice||live?.stage==='oasis'&&live.mode==='choice'&&!live.waterPlan?'choice':choice?.choice?(choice.ready?'observe':'action'):live?.waterPlan?(live.waterAge>=15?'observe':'action'):elapsed<4.5?'arrival':'observe';
 return {phase,map:phase==='travel',title:phase==='arrival'||phase==='ending',annotation:['observe','action'].includes(phase),dialogue:phase==='reply',choice:phase==='choice',status:phase==='action',quiet:['reply','action','observe'].includes(phase)};
}
export function briefCaption(text){return String(text??'').split(/(?<=[。！？])/u).find(s=>s.trim())?.trim().slice(0,70)??'';}
export function installSceneReading(viewport,{onPause=()=>{}}={}){
 const player=document.getElementById('demo-player'),button=document.createElement('button');
 button.id='scene-reading-toggle';button.textContent='讲解与记录';button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls','scene-reading');
 document.querySelector('.demo-header-actions').append(button);
 const panel=document.createElement('aside');panel.id='scene-reading';panel.hidden=true;panel.setAttribute('aria-label','本段讲解与旅程记录');
 panel.innerHTML='<button aria-label="关闭讲解与记录">×</button><small></small><h2></h2><p class="reading-text"></p><p class="reading-scope"></p><div class="reading-records"></div>';
 player.append(panel);let open=false;
 function toggle(value){open=value;panel.hidden=!open;button.setAttribute('aria-expanded',String(open));viewport.dataset.readingOpen=String(open);if(open)onPause();}
 button.addEventListener('click',()=>toggle(!open));panel.querySelector('button').addEventListener('click',()=>toggle(false));
 panel.addEventListener('keydown',e=>{if(e.key==='Escape'){toggle(false);button.focus();}});
 let signature='';
 return {update(frame){
  const p=frame.presentation??presentationFrame(frame);viewport.dataset.readingPhase=p.phase;
  const key=[frame.id,frame.inquiry?.rows.map(r=>r.answer+'/'+r.complete).join('/')].join(':');
  if(signature!==key){signature=key;panel.querySelector('small').textContent=frame.kicker;panel.querySelector('h2').textContent=frame.heading;panel.querySelector('.reading-text').textContent=frame.text;panel.querySelector('.reading-scope').textContent=frame.inquiry?.scope??frame.credit;
   panel.querySelector('.reading-records').replaceChildren(...(frame.inquiry?.rows??[]).map(r=>{const article=document.createElement('article'),title=document.createElement('strong'),text=document.createElement('p');title.textContent=r.place+' · '+(r.complete?'已观察回应':'尚在进行');text.textContent=r.answer+'。下一步：'+r.open;article.append(title,text);return article;}));
  }
  document.getElementById('demo-caption').dataset.brief=briefCaption(frame.text);
  if(p.phase==='travel'&&open)toggle(false);
 },get open(){return open;}};
}
