const upstream='https://github.com/oil-oil/oil-ui/blob/7987bb38afeea1ff8e96641b3ffebb5601fe67d2/';
const layers=[
  ['输入与边界','用户任务 / 品牌 / 参考 / 设备','先确定主任务与交付形式，区分探索、润色、还原和评审。用户已锁定的要求优先。','SKILL.md · 选择范围'],
  ['设计协议','路由 / 方向 / 视觉 / 动效','主 Skill 根据任务读取相关参考，用产品依据组织设计选择。不同阶段留下设计说明、方向卡与用户选择。','SKILL.md\nreferences/design-direction.md\nreferences/visual-language.md'],
  ['宿主执行','模型 / 文件 / 浏览器 / 看图能力','模型解释文本规则、制作页面和处理反馈。视觉验收需要看图，交互验收需要运行环境；独立评审需要隔离上下文。','宿主 Agent 与项目技术栈'],
  ['产物与检查','卡片 / 对比页 / 截图 / 报告','Python 生成器校验结构并组装对比页。Node 工具通过 CDP 操作临时浏览器、取证并报告基础问题。','scripts/build_style_cards.py\nscripts/build_explorer.py\nscripts/shoot.mjs'],
  ['评审与反馈','用户选择 / 视觉诊断 / 修正','评审者看当前画面、任务和约束，不看实现者的辩护或旧分数。建议映射成具体修改，并保留用户硬性要求。','references/visual-review.md\nreferences/reviewer-manual.md']
];
const rules=[
 ['限制任务范围','文本协议','先判断新设计、已有项目润色、截图还原或小改动。只要求评审时保持只读；还原任务不重新探索风格。','避免把任务擅自升级成改版，先确定允许变化的空间。','SKILL.md','选择范围'],
 ['限制没有依据的风格选择','文本协议','说出产品品类与标杆，拆解其中一家可观察的要素，并写出保留与改变的理由。模糊形容词必须翻译为具体设计选择。','选择必须能追溯到产品、用户、内容或使用环境。','references/design-direction.md','认品类、拆标杆 / 模糊词翻译'],
 ['限制只换颜色的方案','文本协议','未锁定风格时，首屏骨架、字体、色彩、主视觉四项，任意两个方向至多一项相同。选定风格后字体和配色固定，结构与主视觉仍需不同。','比较线框和实际画面，不只比较方案的文字描述。','references/design-direction.md','差异检验'],
 ['限制过早完整实现','文本协议','新界面默认先出 4–6 张风格卡片，用户挑选后再出 2–3 个版式方案，版式确定后制作完整页面。已有参考、单方向或授权直接做时按例外执行。','每轮产物限定范围，通过选择收窄下一轮自由度。','SKILL.md','探索并收敛方向'],
 ['限制自证“已经很好”','文本协议','在目标视口实际查看页面。新界面提供操作反馈、状态切换和出场动效证据；没有看图能力不能编造视觉分数。','把结论绑定当前版本的画面与操作证据。','SKILL.md','制作取证 / 能力边界'],
 ['限制评审上下文','文本协议','评审者收到当前截图或录屏、任务和硬约束；不收到源代码、实现者的心路辩护和此前评分。','减少沿着实现理由认可设计的倾向；没有隔离评审时说明自检。','references/visual-review.md','交接清单'],
 ['限制对比页输入与资源','程序限制','卡片生成器强制要求 4–6 张卡片、共用内容和合法控件参数。对比页生成器校验必填字段、候选 ID、十六进制色值和文件范围；实时地址仅允许本机，静态 HTML 默认禁脚本和提交。','不符合结构或资源要求时抛出异常并拒绝生成。对审美质量没有自动保证。','scripts/build_explorer.py','卡片 load / 对比页 load_manifest / prepare_html'],
 ['报告可观察的基础问题','程序检查','截图工具检查控制台错误、横向溢出、图片加载和部分动画变化，输出 report.json。','工具报告问题；主 Agent 仍需读取报告并看画面。发现页面问题不一定使进程返回非零退出码。','scripts/shoot.mjs','check / motion / 报告输出']
];
const steps=[
 ['确定任务','用户请求、仓库现状、参考与设备','本次是内容型研究工作台：找到项目、看来源、记录笔记。保持项目编号和上游链接。','任务说明：用户、主动作、关键状态、设备、范围','确认交付可运行本地页面；保存范围是浏览器本机，未接服务端。'],
 ['品类与标杆','研究资料和项目元数据','先理解“处理对象”的界面，首屏直接展示项目。标杆拆解要有真实可见依据，不把通用形容词当结论。','品类分析、保留与改变的理由','本实验未声称完成外部竞品视觉拆解；首屏依据来自上游内容型界面规则和真实仓库任务。'],
 ['选择风格','真实文案、品牌约束、调性','配色、字体、圆角、密度与控件共同变化，生成 4 张卡片。','上游 build_style_cards.py 生成的风格对比页','本次自主选定“档案纸张”，记录理由；不是伪造用户选择。'],
 ['选择版式','选定字体、色彩、主任务','风格保持一致，制作队列与详情、目录网格、单列档案三种结构，核心内容相同。','3 个代表性版式与上游生成的对比页','选择队列与详情：项目与主操作就近；手机转换为纵向列表与详情。'],
 ['记录设计约定','选择结果、必要状态、设备约束','将本次配色、字号角色、状态、动效和例外写入文档，后续修改使用这份依据。','design-contract.json / decision-log.json','约定包含默认、编辑、成功、失败与空结果状态；不把审美判断伪装成脚本可量化指标。'],
 ['实现代表页面','设计约定、真实项目数据','先实现查找 → 选择 → 编辑 → 保存 → 刷新读回；保留主动作与来源。','可操作工作台，原生 HTML / CSS / JS','默认状态和异常状态成立后再交付；不引入无关业务、登录或后端。'],
 ['取证与检查','当前页面、390px 手机和桌面视口','查看实际画面，检查长标题、换行、溢出；记录主操作反馈、详情变化和首次出场。','截图、状态录屏或三帧、report.json','读报告并查看截图，不能仅凭截图成功或进程退出码判断通过。'],
 ['评审与交付','当前画面、原始任务、硬约束','独立评审只看必要上下文；无独立评审时自检并注明。做减法，保留对象、依据、状态与主动作。','问题记录、验证结果、产物路径、已知边界','本地未给独立审美评分；报告真实验证结果，并说明哪些流程仍由文本协议维持。']
];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function bindSources(){document.querySelectorAll('[data-source]').forEach(a=>{a.href=upstream+a.dataset.source;a.target='_blank';a.rel='noopener';});}
function route(){let id=location.hash.slice(1)||'overview';if(!document.querySelector(`[data-page="${CSS.escape(id)}"]`))id='overview';document.querySelectorAll('[data-page]').forEach(s=>s.hidden=s.dataset.page!==id);document.querySelectorAll('#nav a').forEach(a=>{if(a.hash==='#'+id)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});document.title=`${document.querySelector('#nav a[aria-current]').textContent.trim()} · Oil UI 研究`;window.scrollTo({top:0});}
function layer(i){document.querySelectorAll('#arch-stack button').forEach((b,n)=>b.setAttribute('aria-pressed',n===i));const l=layers[i];document.querySelector('#arch-detail').innerHTML=`<span class="label">LAYER ${i+1}</span><h2>${l[0]}</h2><p>${l[2]}</p><code>${l[3].replaceAll('\n','<br>')}</code>`;}
document.querySelector('#arch-stack').innerHTML=layers.map((l,i)=>`<button type="button" data-layer="${i}"><b>0${i+1}</b><span>${l[0]}<small>${l[1]}</small></span></button>`).join('');
document.querySelector('#arch-stack').addEventListener('click',e=>{const b=e.target.closest('button');if(b)layer(+b.dataset.layer);});layer(1);
document.querySelector('#constraint-list').innerHTML=rules.map((r,i)=>`<details><summary><span>0${i+1}</span>${r[0]}</summary><div class="rule-body"><span class="tag">${r[1]}</span><p>${r[2]}</p><p class="muted">作用：${r[3]}</p><a data-source="${r[4]}">${r[4]} / ${r[5]} ↗</a></div></details>`).join('');
function step(i){document.querySelectorAll('#step-nav button').forEach((b,n)=>{if(n===i)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});const s=steps[i];document.querySelector('#step-detail').innerHTML=`<span class="label">STAGE ${i+1} / 8</span><h2>${s[0]}</h2>${['输入','约束','产物','检查点'].map((k,n)=>`<div class="step-field"><strong>${k}</strong><p>${s[n+1]}</p></div>`).join('')}`;}
document.querySelector('#step-nav').innerHTML=steps.map((s,i)=>`<button type="button" data-step="${i}"><span>0${i+1}</span>${s[0]}</button>`).join('');document.querySelector('#step-nav').addEventListener('click',e=>{const b=e.target.closest('button');if(b)step(+b.dataset.step);});step(0);
bindSources();route();window.addEventListener('hashchange',route);
fetch('assets/verification.json').then(r=>{if(!r.ok)throw Error();return r.json();}).then(v=>{document.querySelector('#verification-result').innerHTML=`<span class="label">${esc(v.date)} / 本地验证</span><p>${esc(v.summary)}</p><ul>${v.checks.map(c=>`<li><b>${esc(c.name)}</b>：${esc(c.result)}</li>`).join('')}</ul><p class="muted">${esc(v.limitations)}</p>`;}).catch(()=>document.querySelector('#verification-result').textContent='验证记录尚未生成。请查看项目 research.md 的实际验证范围。');
fetch('assets/publication.json').then(r=>{if(!r.ok)throw Error();return r.json();}).then(p=>{document.querySelector('#publication-result').innerHTML=`<span class="label">${esc(p.date)} / ${esc(p.statusLabel)}</span><p>${esc(p.summary)}</p><ul>${p.checks.map(c=>`<li><b>${esc(c.name)}</b>：${esc(c.result)}</li>`).join('')}</ul><p class="muted">${esc(p.boundary)}</p>`;}).catch(()=>document.querySelector('#publication-result').textContent='发布记录暂不可用，可查看 GitHub Pages 工作流的实际状态。');
