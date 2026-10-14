from pathlib import Path
project=Path(__file__).resolve().parents[1]
if (project/'process/round-86/retention.json').exists():
    raise SystemExit('R86 is frozen; use a new incremental round.')
p=project/'web/public/knowledge-guide.js'
s=p.read_text(encoding='utf-8')
pairs=[
 ("function stop(navigate=true){envoy.close();", "function stop(navigate=true){viewport.dataset.localNarrative='';localStory.playing=false;viewport.classList.remove('local-narrative-active');envoy.close();"),
 ("modelScene==='people'&&settlementPhase!=='experiment'?'继续变化':'启动场景动作'", "(modelScene==='people'&&settlementPhase!=='experiment'||historyTrails[trail])?'继续变化':'启动场景动作'"),
 ("function restoreDirectorView(shot){", "function restoreDirectorView(shot){\n  if(modelOpen&&modelScene===shot.model&&['market','structure'].includes(modelScene)){localFollow=true;localCameraKey=null;updateLocalReading(0);return;}"),
]
for old,new in pairs:
    assert s.count(old)==1, old
    s=s.replace(old,new)
p.write_text(s,encoding='utf-8')
print('R86 view restoration and leaving-state cleanup complete.')
