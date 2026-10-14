// Original narrative work orders. These timings do not measure real outcomes.
export const decisionScenes={
 'exchange-goods':{stage:'market',title:'先把哪一批货物送到需要的人手中？',need:'家人等着织物，远行者缺少补给，手艺人等器物。',pauseAt:11,replyAt:8,readyAt:14,next:'exchange-city',continue:'沿着这次交换，继续故事 ↗',default:'supplies',choices:[
  {id:'cloth',name:'把织物送给家人',detail:'孩子披上织物，家人接过这份照应',goods:0,voice:'market-cloth',role:'家人',reply:'孩子披上了。这次停留，也留下了照应。',result:'织物到了孩子身上，家人抬头回应来者。'},
  {id:'supplies',name:'把补给送给远行者',detail:'食物与水到手，整理行装继续远行',goods:1,voice:'market-supplies',role:'远行者',reply:'补给接到了。整理好行装，我们沿着道路继续走。',result:'远行者接过补给，重新整理行装，准备走向下一处。'},
  {id:'craft',name:'把器物送给手艺人',detail:'物品放上工作台，接续制作与交流',goods:2,voice:'market-craft',role:'手艺人',reply:'器物送到了。我接着做，也把这道工序讲给同伴。',result:'器物到了工作台，手艺人继续制作，同伴看向双手。'},
 ]},
 'memory-arrival':{stage:'people',title:'抵达之后，先怎样把生活接起来？',need:'田里等着引水，家人需要安顿；行囊里的记忆也要交给下一代。',pauseAt:11,replyAt:8,readyAt:14,next:'memory-muqam',continue:'回到地图，追问下一代怎样接上 ↗',default:'water',choices:[
  {id:'water',name:'先引水，再交接工具',detail:'开闸到田，再安顿家人、一起学着做',priority:'water',memory:'tools',voice:'family-water',role:'孩子',reply:'水引到田里了。工具交给我，我们一起学着做。',result:'水先抵达田地，家人随后安顿，工具交到孩子手中。'},
  {id:'home',name:'先安顿，再讲述家书',detail:'家中先亮灯，再引水，把来时的路讲下去',priority:'home',memory:'letter',voice:'family-home',role:'孩子',reply:'灯亮了，家书也接到了。坐下来，讲讲来时的路。',result:'灯先亮起，渠水随后到田，家书接上代际讲述。'},
 ]},
 'memory-practice':{stage:'culture',title:'示范留出停顿，你怎样接上？',need:'示范者放慢双手，学习者和同伴都在等下一拍。',pauseAt:10,replyAt:6,readyAt:12,next:'modern-hubs',continue:'带着这次回应，走向当代协作 ↗',default:'join',choices:[
  {id:'listen',name:'再看一次，然后回应',detail:'示范者再做一遍，学习者观察后接上',voice:'culture-listen',role:'学习者',reply:'我看清这一次停顿了。现在接上，再慢慢练。',result:'示范者再做一遍，把停顿交给学习者；同伴回应这次接续。'},
  {id:'join',name:'现在接上这一拍',detail:'学习者先参与，同伴回听并回应',voice:'culture-join',role:'学习者',reply:'这一拍接上了。你留出停顿，我就能接着学。',result:'学习者接上这一拍，示范者点头，同伴一起回应。'},
 ]},
 'modern-limit':{stage:'logistics',title:'听过三种需要，怎样安排同一片空间？',need:'居民需要生活缓冲，货运人员需要交接，维护者需要连续绿带。',pauseAt:11,replyAt:5,readyAt:13,next:'future-landscape',continue:'先看谁仍然需要下一步安排 ↗',default:'balanced',choices:[
  {id:'balanced',name:'轮换通行，留出缓冲',detail:'交接分时轮换，记录仍然存在的等待',voice:'civic-balanced',role:'协作回应',reply:'先轮换通行，留出缓冲。等待和维护，都继续记录。',result:'等待区与缓冲带同时留下，三方回应，也继续记录约束。'},
  {id:'freight',name:'集中交接，先回应货运',detail:'货物继续走，生活与生境需求仍待协调',voice:'civic-freight',role:'协作回应',reply:'集中交接让货物继续走。生活与生境的需求，还要接着协调。',result:'车队交接加快，货运人员回应；另外两方仍然提出需求。'},
  {id:'habitat',name:'保留绿带，再安排交接',detail:'维护空间扩大，更多车队进入等待区',voice:'civic-habitat',role:'协作回应',reply:'先把连续的绿带留下。场外等待的车队，也需要下一步安排。',result:'连续绿带扩大，居民与维护者回应；车队的交接还要接着安排。'},
 ]},
};
export function decisionFrame(state,clock){
 if(!state)return null;
 const def=state.def,choice=def.choices.find(c=>c.id===state.choice);
 const age=choice?Math.max(0,clock-state.at):0;
 const phase=!choice?'需求':age<2?'选择':age<def.replyAt?'变化':'回应';
 return {stage:def.stage,title:def.title,need:def.need,carry:def.carry??null,choice:choice?.id??null,choiceName:choice?.name??'',manual:state.manual,replayed:!!state.replayed,age,phase,progress:choice?Math.min(1,age/def.readyAt):0,ready:!!choice&&age>=def.readyAt,next:def.next,continue:def.continue,phrase:!choice?def.need:phase==='选择'?choice.detail:phase==='变化'?choice.detail:choice.result,dialogue:choice&&age>=def.replyAt&&age<def.readyAt?{id:choice.voice,role:choice.role,text:choice.reply,offset:age-def.replyAt}:null};
}
export function mountDecisionUI(panel,state,{choose,continueStory}){
 const def=state.def,inputs=panel.querySelector('#lived-inputs');inputs.hidden=true;
 panel.classList.add('guided-scene');
 panel.querySelector('h2').textContent=def.title;
 const ui=document.createElement('div');ui.className='decision-ui';
 ui.innerHTML=`<p class="decision-need">${def.need}</p><div class="decision-options">${def.choices.map(c=>`<button data-story-choice="${c.id}"><span>${c.name}</span><small>${c.detail}</small></button>`).join('')}</div><div class="decision-sequence" aria-label="需求、选择、变化、回应"><span>需求</span><span>选择</span><span>变化</span><span>回应</span></div><progress class="decision-progress" max="1" value="0" aria-label="选择后的场景回应"></progress><p class="decision-result" role="status"></p><button class="decision-continue" disabled>${def.continue}</button>`;
 if(def.carry){const carry=document.createElement('details');carry.className='decision-carry';const summary=document.createElement('summary');summary.textContent='从上一处带来 · '+def.carry.label;const text=document.createElement('p');text.textContent=def.carry.text;const scope=document.createElement('small');scope.textContent=def.carry.scope;carry.append(summary,text,scope);ui.prepend(carry);ui.querySelector('[data-story-choice='+def.carry.default+']').dataset.carried='true';}
  inputs.before(ui);panel.querySelector('#lived-observation').hidden=true;
 panel.querySelector('#lived-story-state').hidden=true;
 ui.querySelectorAll('[data-story-choice]').forEach(b=>b.addEventListener('click',()=>choose(b.dataset.storyChoice,true)));
 ui.querySelector('.decision-continue').addEventListener('click',continueStory);
 return ui;
}
export function updateDecisionUI(ui,frame,viewport){
 if(!ui||!frame)return;
 ui.querySelectorAll('[data-story-choice]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.storyChoice===frame.choice)));
 const prefix=frame.choice?(frame.replayed?'回看选择':frame.manual?'你的选择':'演示选择')+' · '+frame.choiceName:'等你作出选择';
 const result=ui.querySelector('.decision-result'),text=prefix+'\n'+frame.phase+' · '+frame.phrase;
 if(result.textContent!==text)result.textContent=text;
 const next=ui.querySelector('.decision-continue');next.disabled=!frame.ready;
 next.textContent=frame.ready?frame.continue:frame.choice?'看见人物回应后继续 ↗':'选择之后，看见变化与回应 ↗';
 ui.querySelector('progress').value=frame.progress;
 ui.querySelectorAll('.decision-sequence span').forEach(b=>b.setAttribute('data-current',String(b.textContent===frame.phase)));
 viewport.dataset.decisionStage=frame.stage;viewport.dataset.decisionPhase=frame.phase;
 viewport.dataset.decisionChoice=frame.choice??'pending';viewport.dataset.decisionAge=frame.age.toFixed(2);
 viewport.dataset.decisionReady=String(frame.ready);
}
