export const glacierNarration={
 regional:'先在完整新疆范围里找到天山。我们要观察的乌鲁木齐一号冰川，就位于这片山地中。地图先交代山地与盆地的相对位置，随后靠近冰川标记。区域地图回答在哪里，下一层的局部地形回答看到了什么。',
 place:'保留一号冰川的位置，沿同一个地点靠近冰谷。下一层使用已有的卫星影像和高程样本，展示山脊、谷地与冰雪分布。进入近景以后，先看真实地表，再开启教学叠层；两种画面有不同的用途。',
 surface:'现在显示的是二〇二三年八月三十一日的观测影像，贴合已有高程样本。请对照山脊、谷地和明亮的冰雪区域。这个日期属于影像，不能把画面当作今天的实时冰况。你可以转动或缩放；下一幕会在同一地形上开启流动示意。',
 flow:'真实山地留在原位，青色流线与浅色冰体逐步出现。流线帮助辨认上游和下游的方向，它们是教学叠层，没有标定真实流速，也不是实测河道。请对照叠层与谷地的位置，再进入变化试验。',
 experiment:'现在保留浅色初始轮廓，蓝色教学冰体在它内部逐步收缩。这里设定消融强于积累，只观察模型怎样响应条件。滑块没有物理单位，变化时间也不对应真实年份；这不是冰川预测。接管后可以修改条件、暂停或重播，再回地图看冰谷位于哪里。',
 return:'回到完整新疆地图，重新找到天山与一号冰川。刚才分开观察了真实地表、流动方向和变化试验。真实资料建立地点背景，教学模型帮助理解问题，两者不能混成一条实测历史。你可以重新进入冰谷，自由修改条件，或选择其他地理与历史线索。'
};
export const glacierShots=[
 {id:'regional',label:'天山定位',natureRegion:true,title:'在天山中，找到一号冰川',where:'新疆全域 → 天山 → 一号冰川',targets:['tianshan','glacier']},
 {id:'place',label:'靠近冰谷',naturePlace:true,title:'从地图位置，走近真实冰谷',where:'一号冰川 → 局部影像与高程',targets:['glacier']},
 {id:'surface',label:'真实地表',model:'glacier',glacierMode:'observation',title:'先看影像与高程，辨认山脊和谷地',where:'2023-08-31 · 真实地表'},
 {id:'flow',label:'流动示意',model:'glacier',glacierMode:'flow',title:'地形保留，教学叠层在谷地中出现',where:'同一地形 · 非实测流速'},
 {id:'experiment',label:'变化试验',model:'glacier',glacierMode:'experiment',title:'初始轮廓与变化冰体，同屏比较',where:'无单位条件 · 非真实年份预测'},
 {id:'return',label:'回到地图',natureReturn:true,title:'把局部观察放回天山与新疆',where:'冰谷 → 天山 → 新疆全域'}
].map(s=>({...s,speech:glacierNarration[s.id],audio:{event:'glacier',beat:s.id},duration:26,why:glacierNarration[s.id],next:s.id==='return'?'接管地图，继续地理与历史探索。':'保留当前对象，继续下一层观察。'}));
export function glacierDirectorFrame(shot,fraction){
 const p=Math.max(0,Math.min(1,Number(fraction)||0));
 return {mode:shot.glacierMode??'observation',reveal:Math.min(1,p/.38),retreat:shot.glacierMode==='experiment'?Math.round(42*Math.min(1,p/.82)):0,accumulation:40,ablation:80,
  targets:shot.glacierMode==='observation'?['山脊','谷地','冰雪区域']:shot.glacierMode==='flow'?['上游冰雪','下游方向']:['初始轮廓','变化冰体']};
}
