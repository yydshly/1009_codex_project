import {traditions,civicVoices,civicPlans} from './social-model.js';
export function mountSocialControls(stage,inputs,{settings,choose,say}){
 const wrap=document.createElement('div');wrap.className='social-choices';
 if(stage==='people'){
  wrap.innerHTML='<label>打开行囊，看记忆怎样留下<select id="family-memory" aria-label="家庭行囊中的记忆"><option value="letter">家书与来时的路</option><option value="tools">工具与新的日常</option></select></label><p class="social-note">家庭与家书为创作；迁移年代依据史料。</p>';
  wrap.querySelector('select').addEventListener('change',e=>choose('memory',e.target.value));
 }else if(stage==='culture'){
  wrap.innerHTML=`<label>查阅不同传统<select id="tradition-select" aria-label="木卡姆传统资料">${traditions.map(t=>`<option value="${t.id}">${t.name}</option>`).join('')}</select></label><p id="tradition-note" class="social-note"></p>`;
  wrap.querySelector('select').addEventListener('change',e=>choose('tradition',e.target.value));
 }else if(stage==='logistics'){
  wrap.innerHTML=`<p class="social-label">先听需求，再安排空间</p><div class="lived-button-row social-voices">${Object.entries(civicVoices).map(([id,v])=>`<button data-voice="${id}">${v.name}</button>`).join('')}</div><label>选择协作方案<select id="civic-plan" aria-label="三方协作方案">${Object.entries(civicPlans).map(([id,p])=>`<option value="${id}">${p.name}</option>`).join('')}</select></label><p id="civic-plan-note" class="social-note"></p>`;
  wrap.querySelectorAll('[data-voice]').forEach(b=>b.addEventListener('click',()=>{choose('civicVoice',b.dataset.voice);say('civic-'+b.dataset.voice);}));
  wrap.querySelector('select').addEventListener('change',e=>{choose('civicPlan',e.target.value);say('civic-'+e.target.value);});
 }
 inputs.prepend(wrap);refreshSocialControls(inputs,stage,settings);
}
export function refreshSocialControls(panel,stage,settings){
 const memory=panel.querySelector('#family-memory');if(memory)memory.value=settings.memory;
 const traditional=panel.querySelector('#tradition-select');if(traditional)traditional.value=settings.tradition;
 const note=panel.querySelector('#tradition-note');if(note)note.textContent=traditions.find(t=>t.id===settings.tradition).note;
 const plan=panel.querySelector('#civic-plan');if(plan)plan.value=settings.civicPlan;
 const planNote=panel.querySelector('#civic-plan-note');if(planNote)planNote.textContent=civicPlans[settings.civicPlan].summary;
 panel.querySelectorAll('[data-voice]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.voice===settings.civicVoice)));
}
