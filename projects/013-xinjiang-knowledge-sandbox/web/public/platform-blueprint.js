// R34 design specification. This page previews the plan; it does not drive the 3D runtime.
export const topics = [
  {id:'water',name:'山地、盆地与水',question:'地形与水的分布、运动有什么关系？',domains:['自然','地理'],objects:['区域地形','冰谷案例','吐鲁番案例','坎儿井机制'],questions:['怎样读出山地与盆地的空间关系？','真实影像能告诉我们什么，变化试验又能说明什么？','怎样从地表进入地下结构，再回到地点背景？'],scenes:[['terrain','新疆立体地图'],['glacier','冰谷观测'],['karez','坎儿井剖面']],gap:'已有地形、影像与示意模型；待补具体流域及地下水资料、对象关联和统一返回状态。',priority:'首个完整专题'},
  {id:'routes',name:'道路与交流',question:'人们怎样穿越和连接这些地区？',domains:['地理','历史','经济'],objects:['地点','山口与道路','历史事件','路线资料'],questions:['同一地区有哪些可比较的通道？','不同年代的路线依据分别是什么？','沿途地点如何与事件、交换活动关联？'],scenes:[['history','绿洲廊道'],['terrain','区域地图']],gap:'已有廊道示意；待核实分段路线、年代和事件资料。先验证平台复用，再扩展内容。',priority:'第二个复用专题'},
  {id:'livelihood',name:'聚落与生计',question:'人们怎样利用当地条件组织生活与生产？',domains:['地理','文化','经济'],objects:['聚落地点','水利设施','生产活动','生活资料'],questions:['设施、土地与生活活动怎样联系？','生产、使用、交换有哪些有依据的例子？','哪些是现实资料，哪些是帮助理解的教学情境？'],scenes:[['oasis','用水情境'],['market','集市情境']],gap:'已有原创生活情境；待补具体聚落、生产方式与实物材料，不能以通用人物动画概括当地生活。',priority:'资料完善后扩展'},
  {id:'culture',name:'人群与文化',question:'迁徙、交流与日常实践怎样留下文化记忆？',domains:['历史','文化','民族'],objects:['历史事件','相关地点','文化实践','影像与文献'],questions:['事件发生在何时、何地，材料支持到什么程度？','文化实践与哪些具体社区和历史背景关联？','同一主题有哪些不同案例可以比较？'],scenes:[['migration','西迁方向'],['people','家庭情境'],['culture','庭院练习']],gap:'已有西迁与文化资料入口；人物、服饰和练习是原创示意。不同年代、社区保持独立。',priority:'逐案例建立依据'},
  {id:'governance',name:'城市与治理',question:'制度、基础设施与公共安排怎样影响地区联系和日常生活？',domains:['地理','历史','经济','政治'],objects:['城市与关口','具体制度','基础设施','统计与文献'],questions:['一个具体制度适用于哪个时期和范围？','交通、生产和公共服务分别有哪些可查资料？','哪些比较有数据依据，哪些仍是研究问题？'],scenes:[['logistics','关口协作情境']],gap:'已有原创协作场景与方案资料；待补具体制度、统计与时间范围，当前情境不能验证政策成效。',priority:'先资料，后表达'},
];

export const relationRules = [
  ['位于／包含','地点与空间范围','记录坐标、范围、定位精度；示意定位明确标注。'],
  ['经过／发生于','路线、事件与地点','附年代、路线依据与复原程度。'],
  ['先于','已核实时间的事件','记录时间范围及确定程度；先后顺序不等于因果。'],
  ['解释机制','模型与观察问题','说明变量、假设、适用条件与示意性质。'],
  ['提供依据','照片、文献、数据与具体陈述','记录出处、日期、许可，以及材料支持哪一条说明。'],
  ['可比较','共享问题下的不同案例','分别保留地点、年代与参数，不画成连续水系或同一经历。'],
  ['有证据的影响','已获得依据的因果关系','必须附支持材料与适用范围；缺少依据时保留为待研究问题。'],
];

export const waterSteps = [
  {id:'region',label:'整体位置',place:'新疆 · 区域尺度',question:'山地、盆地与水，应该从哪里看起？',scene:'terrain',sceneName:'新疆立体地图',objects:['山地与盆地','地点索引','区域背景'],operation:'选择山系或盆地；需要宏观背景时展开地球位置。',feedback:'选中范围、名称与观察问题共同高亮；保留比例和方向参照。',camera:'先保持整体，再靠近选中对象；建立返回视角。',next:'从区域选择冰谷案例，继续看真实地表。',evidence:'已有区域DEM与底图；地点边界和水系关联仍需逐项校核。',status:'真实地形基础＋待补专题叠层',links:[['./assets/data-sources.json','查看已有地形与影像清单']]},
  {id:'glacier',label:'冰谷观测',place:'天山冰谷 · 独立观测案例',question:'影像中能观察什么，模型变化又说明什么？',scene:'glacier',sceneName:'冰谷场景',objects:['观测日期','局部影像与DEM','教学变化模型'],operation:'在观测地表与教学叠层之间切换；暂停并比较变化阶段。',feedback:'日期与来源随观测图显示；教学参数、初始轮廓和变化范围明确标记。',camera:'区域定位点先保持可见，再进入局部；用户拖动即可接管。',next:'回到新疆地图，再选择另一个用水案例。',evidence:'已有固定日期影像和DEM；缺少年度实测序列，教学变化不作为现实预测。',status:'观测数据与教学示意分别标明',links:[['./assets/data-sources.json','核对影像日期与数据范围']]},
  {id:'switch-place',label:'切换案例',place:'新疆地图 → 吐鲁番 · 另一个地点',question:'共享一个问题的两个案例，分别位于哪里？',scene:'terrain',sceneName:'区域地图',objects:['冰谷地点','吐鲁番地点','比较关系'],operation:'回到区域地图，对照两个位置，明确选择吐鲁番。',feedback:'两处地名及案例性质分别显示；提示“切换到另一地点案例”。',camera:'恢复区域视角，再定位吐鲁番；不制作连接两地的水流动画。',next:'进入通用坎儿井结构，查看地下输水机制。',evidence:'两处仅建立比较关系；未验证冰谷对吐鲁番的直接补给关系。',status:'比较案例 · 不连通水量或模拟参数',links:[['./assets/records/platform-blueprint-r34.md','查看跨地点关系与状态规则']]},
  {id:'karez',label:'地下结构',place:'吐鲁番主题 · 通用结构示意',question:'怎样看懂井、渠、出口之间的结构关系？',scene:'karez',sceneName:'坎儿井剖面',objects:['地表与地下','竖井与暗渠','坡度与流向'],operation:'展开剖面；依次选择竖井、暗渠和出口，沿流向观察。',feedback:'当前结构、剖切位置、流向及说明相互对应；高差示意明确标出。',camera:'从整体结构进入剖面，保留地表位置参照；支持随时返回。',next:'把工程结构与具体用水、维护材料关联。',evidence:'已有程序结构模型；具体设施、测量高差与流量资料待补，不能表示某条实测坎儿井。',status:'结构示意 · 真实设施资料待补',links:[['./ATTRIBUTION.md','查看现有数据与创作说明']]},
  {id:'life',label:'使用与维护',place:'用水与维护 · 待补具体地点材料',question:'设施怎样被使用和维护，材料能告诉我们什么？',scene:'oasis',sceneName:'现有用水情境',objects:['设施使用','维护活动','照片与访谈等资料'],operation:'选择一个已获得材料支持的活动；查看资料、对应结构与解释。',feedback:'资料说明对象、地点和日期；人物若用于演示，应回应具体活动并标明创作性质。',camera:'从设施转向使用它的活动，保持地点信息；人物近景按解释需要出现。',next:'返回区域，比较案例与依据，再选择道路或生计专题。',evidence:'当前人物与分水情境是教学创作；真实活动资料补齐前，不作为当地生活的事实复原。',status:'已有原创情境 · 真实活动资料待补',links:[['./overview.html#sources','查看资料与创作边界']]},
  {id:'compare',label:'比较与延伸',place:'区域地图 · 两个独立案例',question:'两个案例帮助我们理解了什么，还有哪些问题没有依据？',scene:'terrain',sceneName:'区域地图',objects:['观察记录','证据清单','关联专题'],operation:'并列查看各案例的地点、观察结果与依据；从地图或专题继续探索。',feedback:'观测事实、教学示意和待补问题分别列出；保留选点和各案例自己的状态。',camera:'回到原区域视角；仅在用户选择新对象时移动。',next:'可进入“道路与交流”，也可返回任一案例继续观察。',evidence:'比较帮助理解共同问题，不产生新的水文或历史因果结论。',status:'对照观察 · 资料可追溯',links:[['./assets/records/platform-blueprint-r34.md','查看完整设计与验收标准']]},
];

export const acceptance = [
  '任意节点都能回答：当前地点、专题、观察对象及其与上一层的关系。',
  '至少一次操作产生清楚的画面反馈，静音时也能理解观察重点。',
  '用户接管镜头后导览不抢回控制；可恢复原节点或直接自由探索。',
  '同一地点或模型可从地图与专题进入；返回时恢复选点、视角和阅读位置。',
  '跨案例分别保存参数；待补关系不会显示为已成立的水系、路线或因果。',
  '第二个专题复用地点、标记、资料与状态接口；模型和媒体仅引用一次。',
];

const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tags = values => values.map(v=>`<span>${escape(v)}</span>`).join('');

export function installBlueprint(root) {
  if (!root) return;
  const params = new URL(location.href).searchParams;
  let topic = topics.find(t=>t.id===params.get('bpTopic')) || topics[0];
  let step = waterSteps.find(s=>s.id===params.get('bpStep')) || waterSteps[0];
  let mode = params.get('bpMode')==='explore'?'explore':'guided';
  root.innerHTML = `<div class="bp-promise"><strong>平台目标</strong><p>从地点或问题进入，观察空间与过程，查阅资料，再沿有依据的关联继续探索。</p><span class="bp-badge">R34 设计提案 · 3D关联功能待实施</span></div>
    <div class="bp-topic-layout"><nav class="bp-topics" aria-label="五个专题的设计"><h3>内容怎样组织</h3>${topics.map((t,i)=>`<button type="button" data-bp-topic="${t.id}" aria-pressed="false"><small>0${i+1}</small><span>${t.name}</span></button>`).join('')}</nav><article id="bp-topic-detail" class="bp-topic-detail" aria-label="所选专题设计"></article></div>
    <div class="bp-foundations"><article><span>入口</span><h3>地图、专题、模型</h3><p>围绕同一份地点与内容建立入口。地图提供位置，专题组织问题，模型解释结构和过程。</p></article><article><span>关系</span><h3>地点、事件、机制、资料</h3><p>对象可以被多个专题引用。每条关系有明确类型、时间范围和依据状态。</p></article><article><span>路径</span><h3>跟随导览 / 自由探索</h3><p>共享同一套内容和状态。导览给出推荐顺序，用户可以接管、离开和返回。</p></article></div>
    <div id="bp-water-path" class="bp-water"><div class="bp-water-heading"><div><p class="eyebrow">FIRST TOPIC / 首个专题设计</p><h3>山地、盆地与水</h3><p>切换下方节点，查看它要回答的问题、操作反馈与资料缺口。</p></div><div class="bp-mode" role="group" aria-label="预览两种设计路径"><button type="button" data-bp-mode="guided">导览路径</button><button type="button" data-bp-mode="explore">自由探索路径</button></div></div>
      <p id="bp-path-explanation" class="bp-path-explanation"></p><nav class="bp-steps" aria-label="首个专题的观察节点">${waterSteps.map((s,i)=>`<button type="button" data-bp-step="${s.id}" aria-pressed="false"><small>0${i+1}</small>${s.label}</button>`).join('')}</nav>
      <article id="bp-step-detail" class="bp-step-detail" aria-label="所选节点的设计要求"></article>
      <div class="bp-path-actions"><button type="button" id="bp-previous">← 上一观察点</button><span id="bp-step-counter"></span><button type="button" id="bp-next">下一观察点 →</button></div><p class="bp-boundary">本页预览内容结构和交互要求。打开的3D场景仍是现有R32工作台；统一对象关联、跨层返回与专题导览尚待实施。</p>
    </div>
    <details class="bp-details"><summary>对象与关系怎样记录</summary><p>地点记录位置、范围和定位精度；事件记录时间、相关地点和参与者；机制记录变量、假设与适用条件；资料记录出处、日期、许可和支持的具体陈述。</p><div class="table-wrap"><table><caption class="sr-only">平台关系类型及依据规则</caption><thead><tr><th>关系</th><th>连接对象</th><th>使用规则</th></tr></thead><tbody>${relationRules.map(r=>`<tr>${r.map((v,i)=>`<${i?'td':'th'}${i?'':' scope="row"'}>${escape(v)}</${i?'td':'th'}>`).join('')}</tr>`).join('')}</tbody></table></div></details>
    <details class="bp-details"><summary>视觉与镜头遵循哪些规则</summary><div class="bp-rules"><p><strong>位置持续可读。</strong>进入局部前选中地点；进入后保留名称与区域参照；返回恢复原来的选点和视角。</p><p><strong>一次突出一个观察问题。</strong>标题、标记、动画和资料指向同一个对象，其余内容逐步展开。</p><p><strong>视觉符号含义稳定。</strong>水体用蓝色、路线用赭色、选中对象用明亮轮廓；同时配文字或线型，避免只靠颜色区分。</p><p><strong>现实与示意有标识。</strong>观测日期、比例、显示夸张与模型假设可查；进入剖面保留地表参照。</p><p><strong>动画解释变化。</strong>镜头服务于尺度、对象或结构转换；用户操作后停止自动接管，支持减少动态效果。</p><p><strong>文字和声音共同服务理解。</strong>保留必要说明、字幕与资料入口；静音可理解，朗读和动画可暂停。</p></div></details>
    <details class="bp-details"><summary>实施顺序与验收标准</summary><ol class="bp-delivery"><li><strong>P0 · 首个专题闭环</strong><span>建立对象与证据表、双入口、六节点、操作反馈和返回恢复；验收静音理解与自由接管。</span></li><li><strong>P1 · 第二专题复用</strong><span>接入“道路与交流”，复用地点、标记、资料和导航；历史路线与时间逐项补证。</span></li><li><strong>P2 · 统一表现</strong><span>再提升近景质感、必要人物动作、镜头与声音；按证据扩展其余专题。</span></li></ol><ul class="bp-acceptance">${acceptance.map(a=>`<li>${escape(a)}</li>`).join('')}</ul></details>
    <div class="bp-download"><a class="text-link" href="./assets/records/platform-blueprint-r34.md">阅读完整设计蓝图 ↗</a><a class="text-link" href="./assets/records/round-33.md">原视频观察记录与证据边界 ↗</a><span>专题为我们的设计提案；原应用内部架构尚未取得。</span></div><p class="sr-only" id="bp-announcement" role="status"></p>`;

  function update(writeURL=false) {
    for (const b of root.querySelectorAll('[data-bp-topic]')) b.setAttribute('aria-pressed',String(b.dataset.bpTopic===topic.id));
    root.querySelector('#bp-topic-detail').innerHTML=`<p class="bp-kicker">${escape(topic.priority)}</p><h3>${escape(topic.question)}</h3><div class="bp-tags" aria-label="关联内容维度">${tags(topic.domains)}</div><ol>${topic.questions.map(q=>`<li>${escape(q)}</li>`).join('')}</ol><p><strong>共用对象</strong>　${escape(topic.objects.join(' · '))}</p><p class="bp-gap"><strong>当前基础与缺口</strong><br>${escape(topic.gap)}</p><div class="bp-scene-links">${topic.scenes.map(([id,label])=>`<a href="./?scene=${id}">查看现有${escape(label)} ↗</a>`).join('')}</div>`;
    for(const b of root.querySelectorAll('[data-bp-mode]')) b.setAttribute('aria-pressed',String(b.dataset.bpMode===mode));
    for(const b of root.querySelectorAll('[data-bp-step]')) {b.setAttribute('aria-pressed',String(b.dataset.bpStep===step.id));if(b.dataset.bpStep===step.id)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');}
    root.querySelector('#bp-path-explanation').textContent=mode==='guided'?'推荐顺序：整体位置 → 冰谷观测 → 回区域切换案例 → 地下结构 → 使用与维护 → 比较与延伸。任意节点均可接管或离开。':'按问题任选地点或模型，查看关联资料，再返回原位置。下方节点可直接选择；切换案例时保留各自的观察状态。';
    root.querySelector('#bp-step-detail').innerHTML=`<div class="bp-observation"><p class="bp-kicker">${escape(step.place)}</p><h4>${escape(step.question)}</h4><div class="bp-tags">${tags(step.objects)}</div><p class="bp-evidence">${escape(step.status)}</p><a class="primary" href="./?scene=${step.scene}">查看现有${escape(step.sceneName)} ↗</a><small>现有素材入口，尚未接入本页设计路径。</small></div><dl class="bp-contract"><div><dt>用户操作</dt><dd>${escape(step.operation)}</dd></div><div><dt>画面反馈</dt><dd>${escape(step.feedback)}</dd></div><div><dt>镜头与空间</dt><dd>${escape(step.camera)}</dd></div><div><dt>接续理由</dt><dd>${escape(step.next)}</dd></div><div><dt>依据与缺口</dt><dd>${escape(step.evidence)}<div class="bp-scene-links">${step.links.map(([url,label])=>`<a href="${escape(url)}">${escape(label)} ↗</a>`).join('')}</div></dd></div></dl>`;
    const index=waterSteps.indexOf(step);root.querySelector('#bp-previous').disabled=index===0;root.querySelector('#bp-next').disabled=index===waterSteps.length-1;
    root.querySelector('.bp-path-actions').hidden=mode==='explore';root.querySelector('#bp-step-counter').textContent=`${index+1} / ${waterSteps.length} · 设计节点`;
    root.querySelector('#bp-announcement').textContent=`专题：${topic.name}。${mode==='guided'?'导览':'自由探索'}路径，当前设计节点：${step.label}。`;
    if(writeURL){const u=new URL(location.href);u.searchParams.set('bpTopic',topic.id);u.searchParams.set('bpMode',mode);u.searchParams.set('bpStep',step.id);history.replaceState(null,'',u);}
  }
  root.addEventListener('click',event=>{
    const b=event.target.closest('button');if(!b||!root.contains(b))return;
    if(b.dataset.bpTopic)topic=topics.find(t=>t.id===b.dataset.bpTopic);
    else if(b.dataset.bpMode)mode=b.dataset.bpMode;
    else if(b.dataset.bpStep)step=waterSteps.find(s=>s.id===b.dataset.bpStep);
    else if(b.id==='bp-previous')step=waterSteps[Math.max(0,waterSteps.indexOf(step)-1)];
    else if(b.id==='bp-next')step=waterSteps[Math.min(waterSteps.length-1,waterSteps.indexOf(step)+1)];
    else return;update(true);
  });
  update();
}
