// Dates and sequence: National Ethnic Affairs Commission, 锡伯族·历史沿革.
// Geometry, anonymous figures and animation duration are explanatory diagrams.
import {settlementStory,settlementStoryFrame} from './settlement-story.js';
export const settlementSource='https://www.neac.gov.cn/seac/ztzl/xbz/lsyg.shtml';
export const settlementStages=[
 {id:'settle',year:'1766年春起',title:'安置与初期耕作',fact:'迁往察布查尔后，利用绰霍尔河等支流水源发展灌溉与耕作。并非等到1808年才有农业。',look:'右侧住处、初期田地和支渠保留；左侧后建大渠尚未出现。',reply:'住处与初期耕作相接'},
 {id:'dig',year:'19世纪初',title:'组织开挖新大渠',fact:'人口与耕地需求增长，图伯特组织开渠，引伊犁河水。工程历时六年；这里不把开工年写死。',look:'左侧干渠槽逐段延伸，劳动者沿渠作业；右侧原有灌溉继续存在。',reply:'干渠槽连到新增耕地'},
 {id:'flow',year:'1808年初',title:'大渠竣工放水',fact:'新渠竣工放水，支持扩大耕种。新渠建设属于安置几十年后的发展。',look:'青色水流沿新渠向前，左侧新增田垄随后变绿；原有田地保持。',reply:'新渠来水，耕作范围扩大'}
];
const clamp=v=>Math.min(1,Math.max(0,Number.isFinite(v)?v:0));
const ease=(v,a,b)=>{const x=clamp((v-a)/(b-a));return x*x*(3-2*x);};
export function settlementFrame(phase='settle',progress=1){
 const stage=settlementStages.find(s=>s.id===phase)??settlementStages[0],p=clamp(progress);
 return {stage,progress:p,initialWater:1,initialFields:1,settled:stage.id==='settle'?ease(p,0,.65):1,
  trench:stage.id==='settle'?0:stage.id==='dig'?ease(p,.25,.88):1,
  newWater:stage.id==='flow'?ease(p,.06,.42):0,
  expansion:stage.id==='flow'?ease(p,.69,.98):0,working:stage.id==='dig',complete:p>=.99};
}
export function settlementPanel(phase,focus='story'){
 const s=settlementStages.find(x=>x.id===phase)??settlementStages[0],story=settlementStory[s.id];
 const play=`<div class="sg-play"><button data-settlement-replay class="sg-primary">播放这段变化 ▷</button><button data-kg-action="run">暂停 / 继续</button><button data-settlement-follow hidden>恢复引导镜头</button></div>`;
 return `<section class="settlement-panel sg-panel"><p class="sg-location">伊犁河谷 / 察布查尔 <span>关系示意</span></p><h2>${story.question}</h2><p class="sg-need">${story.need}</p><div class="settlement-tabs" role="group" aria-label="选择历史年代">${settlementStages.map(x=>`<button data-settlement-phase="${x.id}" aria-pressed="${x.id===s.id}"><strong>${x.year}</strong></button>`).join('')}</div>${play}<ol class="sg-beats" aria-label="这段变化的三个步骤">${story.steps.map((b,i)=>`<li><button data-settlement-beat="${i}" aria-current="${i===0?'step':'false'}"><small>0${i+1}</small>${b.label}</button>`).join('')}</ol><div class="sg-current" aria-live="polite"><b data-settlement-story-title>${story.steps[0].title}</b></div><button data-mt-stop="map" class="sg-return">← 返回伊犁河谷地图</button><details class="sg-more"><summary>近景观察与历史依据</summary><div class="settlement-detail-tabs" role="group" aria-label="近景观察对象">${[['story','跟随故事'],['overview','水系全景'],['home','民居'],['people','服饰'],['water','劳动与渠水']].map(([key,label])=>`<button data-settlement-detail="${key}" aria-pressed="${key===focus}">${label}</button>`).join('')}</div><p class="settlement-detail-reading" data-settlement-detail-reading></p><p>${s.fact}</p><p class="mt-time-note">人物、建筑与渠线为水系和屯居关系示意，不是古村或真实大渠布局复原；田地变绿不表示即时生长或实测增产。</p><a href="${settlementSource}" target="_blank" rel="noopener noreferrer">年代依据 · 国家民委 ↗</a><a href="https://www.neac.gov.cn/seac/ztzl/xbz/fsxg.shtml" target="_blank" rel="noopener noreferrer">民居与服饰形制依据 ↗</a><button data-settlement-experiment>原有生活情境：比较安排 →</button></details></section>`;
}
