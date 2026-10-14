"""Wire the period-specific set into the existing guide and director."""
from pathlib import Path
project=Path(__file__).resolve().parents[1]
public=project/'web/public'
def edit(name,changes):
    target=public/name
    content=target.read_text(encoding='utf-8')
    for before,after in changes:
        assert content.count(before)==1,(name,before[:90],content.count(before))
        content=content.replace(before,after)
    target.write_text(content,encoding='utf-8')
edit('knowledge-guide.js',[
 ("import {settlementPanel,settlementStages}","import {settlementDetails} from './settlement-period-detail.js';\nimport {settlementPanel,settlementStages}"),
 ("let settlementPhase=['settle'", "let settlementDetail=settlementDetails[new URL(location.href).searchParams.get('settlementDetail')]?new URL(location.href).searchParams.get('settlementDetail'):'overview';\n let settlementPhase=['settle'"),
 ("content=settlementPanel(settlementPhase);", "content=settlementPanel(settlementPhase,settlementDetail);"),
 ("const c=settlementStages.find(x=>x.id===settlementPhase);if(!c)return;", "const c=settlementStages.find(x=>x.id===settlementPhase);if(!c)return;const detail=settlementDetails[settlementDetail]??settlementDetails.overview;const reading=root.querySelector('[data-settlement-detail-reading]');if(reading&&reading.textContent!==detail.text)reading.textContent=detail.text;"),
 ("['[data-hs-caption-title]',c.title],['[data-hs-caption-text]',c.look]", "['[data-hs-caption-title]',settlementDetail==='overview'?c.title:detail.title],['[data-hs-caption-text]',settlementDetail==='overview'?c.look:detail.text]"),
 ("progress:director?.active&&director.shot?.settlement?0:1});adapter.modelOverview();", "progress:director?.active&&director.shot?.settlement?0:1});adapter.settlementView?.(settlementDetail);"),
 ("if(b.dataset.settlementPhase||b.hasAttribute('data-settlement-experiment')", "if(b.dataset.settlementDetail){settlementDetail=b.dataset.settlementDetail;adapter.settlementView?.(settlementDetail);render();build();const address=new URL(location.href);address.searchParams.set('settlementDetail',settlementDetail);history.replaceState(null,'',address);return;}\n  if(b.dataset.settlementPhase||b.hasAttribute('data-settlement-experiment')"),
 ("render();build();adapter.modelOverview();}\n   const address=new URL(location.href);address.searchParams.set('settlement'", "render();build();if(settlementPhase==='experiment')adapter.modelOverview();else adapter.settlementView?.(settlementDetail);}\n   const address=new URL(location.href);address.searchParams.set('settlement'"),
 ("else if(shot.model)adapter.modelOverview();", "else if(shot.settlement)adapter.settlementView?.(shot.detail??'overview');\n  else if(shot.model)adapter.modelOverview();"),
 ("if(shot.settlement){settlementPhase=shot.settlement;settlementReplay=null;}directorHeldView", "if(shot.settlement){settlementPhase=shot.settlement;settlementDetail=shot.detail??'overview';settlementReplay=null;}directorHeldView"),
 ("if(shot.settlement)adapter.settlementTime({phase:shot.settlement,progress:0});adapter.modelOverview();", "if(shot.settlement){adapter.settlementTime({phase:shot.settlement,progress:0});adapter.settlementView?.(settlementDetail);}else adapter.modelOverview();"),
])
edit('sandbox.js',[
 ("import {createEnvoyDesert", "import {settlementCameraPose,setPeriodFocus} from './settlement-period-detail.js';\nimport {createEnvoyDesert"),
 ("familyChoice:priority=>lived?.choosePriority(priority,{record:false}),settlementTime:value=>lived?.setSettlementChronology(value),", "familyChoice:priority=>lived?.choosePriority(priority,{record:false}),settlementTime:value=>lived?.setSettlementChronology(value),\n      settlementView:focus=>{if(lived?.stage!=='people')return;cancelPlatformArrival();setPeriodFocus(lived.group?.userData.chronology?.period,focus);viewport.dataset.settlementDetailFocus=focus;const host=$('canvas-host'),p=settlementCameraPose(focus,stageOrigins.people,host.clientWidth/host.clientHeight,camera.fov);transition={from:camera.position.clone(),to:p.position,oldTarget:orbit.target.clone(),target:p.target,start:performance.now(),duration:reducedMotion?1:1200};orbit.minDistance=p.min;orbit.maxDistance=p.max;orbit.enablePan=true;orbit.maxPolarAngle=Math.PI*.49;},"),
])
edit('exploration-director-paths.js',[
 ("settlement:'settle',title:","settlement:'settle',detail:'home',title:"),
 ("settlement:'dig',title:","settlement:'dig',detail:'water',title:"),
 ("settlement:'flow',title:","settlement:'flow',detail:'overview',title:"),
 ("title:'从家庭，重新读懂河谷',where:'家庭的需要 → 察布查尔 → 伊犁河谷',why:'迁移说明人怎样来到这里；地理帮助理解生活条件；家庭互动让这些需要变得可观察。'", "title:'从屯居与水系，重新读懂河谷',where:'分期水利观察 → 察布查尔 → 伊犁河谷',why:'迁移改变位置，屯居建立初期耕作，后来的新渠支持扩展。把不同年代的变化带回同一个河谷。'"),
])
with (public/'sandbox.css').open('a',encoding='utf-8') as f:
    f.write('\n/* R83: factual detail reading stays beside the object, with sources folded. */\n.settlement-detail-tabs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5px;margin:0 0 8px}.settlement-detail-tabs button{margin:0!important;min-height:32px;font-size:12px}.settlement-detail-tabs button[aria-pressed="true"]{background:#c6cfb5;color:#182d28;border-color:#c6cfb5}.settlement-detail-reading{font-size:12px!important;line-height:1.6!important;border-left:2px solid #b4be98;padding-left:9px}.settlement-evidence{margin:12px 0;font-size:11px;line-height:1.65}.settlement-evidence summary{cursor:pointer;color:#d0d9c2}.settlement-evidence a{display:block;margin:7px 0}\n')
print('R83 guide, free detail views and director camera wiring installed.')
