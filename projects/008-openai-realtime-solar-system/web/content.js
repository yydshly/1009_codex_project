export const SOURCE_REF = '18025b656a5c7a5e9f52dddfe3981da808ae30bb';
export const SOURCE_BASE = `https://github.com/openai/openai-realtime-solar-system/blob/${SOURCE_REF}/`;
export const presets = [
  { id: 'saturn', text: '看看土星' },
  { id: 'chart', text: '地球陆海比例' },
  { id: 'moons', text: '木星的卫星' },
  { id: 'orbit', text: '俯视行星轨道' },
  { id: 'iss', text: '空间站在哪里' },
  { id: 'reset', text: '回到全景' },
];

export const bodies = [
  { id: 'Sun', label: '太阳', radius: 1.65, orbit: 0, angle: 0, color: '#ffb14c', kind: 'sun' },
  { id: 'Mercury', label: '水星', radius: .32, orbit: 3.1, angle: 2.8, color: '#aaa098', kind: 'rock' },
  { id: 'Earth', label: '地球', radius: .68, orbit: 4.6, angle: .1, color: '#397daa', kind: 'earth' },
  { id: 'Mars', label: '火星', radius: .47, orbit: 6.3, angle: 4.8, color: '#c17a56', kind: 'rock' },
  { id: 'Jupiter', label: '木星', radius: 1.3, orbit: 8.8, angle: 2, color: '#cdb397', kind: 'bands' },
  { id: 'Saturn', label: '土星', radius: 1.02, orbit: 11.7, angle: .6, color: '#d3bf93', kind: 'bands' },
  { id: 'Neptune', label: '海王星', radius: .65, orbit: 14.3, angle: 3.4, color: '#5279d8', kind: 'bands' },
  { id: 'Pluto', label: '冥王星', radius: .26, orbit: 16, angle: 5.35, color: '#b9a99b', kind: 'rock' },
];
export const moonGroups = {
  Jupiter: ['Io', 'Europa', 'Ganymede', 'Callisto'],
  Pluto: ['Charon', 'Nix', 'Hydra', 'Kerberos', 'Styx'],
};
export const earthData = [{ label: '海洋', value: '71' }, { label: '陆地', value: '29' }];

export function interpretCommand(text) {
  const normalized = text.trim().toLowerCase();
  if (!normalized) return null;
  if (/全景|复位|重置|回去|谢谢|结束|reset|thank/.test(normalized)) return {
    preset: 'reset', name: 'reset_camera', args: {}, title: '全景视角',
    reply: '回到初始视角，把所有展示对象重新放进画面。原项目把结束对话的表达映射到镜头复位工具。',
    result: '执行结果：镜头回到全景，清除图表与局部展示。',
  };
  if (/空间站|\biss\b/.test(normalized)) return {
    preset: 'iss', name: 'get_iss_position', args: {}, target: 'Earth', title: 'ISS 展示示意',
    reply: '原项目会查询空间站经纬度并播报，同时播放预设动画。本页只展示固定示例坐标与示意模型，不查询实时位置。',
    result: '执行结果：显示 ISS 示意对象；坐标为预置示例，没有空间定位映射。',
  };
  if (/轨道|俯视|orbit/.test(normalized)) return {
    preset: 'orbit', name: 'show_orbit', args: {}, title: '轨道俯视',
    reply: '镜头切到场景上方，展示对象之间的布局关系。这里的轨道、距离与运动采用简化规则，没有天文历表计算。',
    result: '执行结果：切换到俯视镜头，突出轨道线。',
  };
  if (/卫星|月亮|moons?/.test(normalized)) {
    const target = /冥王|pluto/.test(normalized) ? 'Pluto' : 'Jupiter';
    const label = target === 'Pluto' ? '冥王星' : '木星';
    return {
      preset: 'moons', name: 'show_moons', args: { moons: moonGroups[target] }, target, title: `${label}卫星`,
      reply: target === 'Pluto' ? '依次显示上游配置的五颗冥王星卫星。对象与动画需要提前建立，模型只负责选择要显示的名称。' : '依次显示木卫一、木卫二、木卫三、木卫四。这是上游配置的四颗伽利略卫星，不是木星全部卫星。',
      result: `执行结果：聚焦${label}，依次显示 ${moonGroups[target].length} 个卫星对象。`,
    };
  }
  if (/比例|陆海|海洋|陆地|图表|饼图|柱状|比较|chart|water|land/.test(normalized)) {
    const chart = /柱状|比较|bar/.test(normalized) ? 'bar' : 'pie';
    return {
      preset: 'chart', name: 'display_data', args: { chart, title: '地球表面陆海比例（约）', text: '面积占比，单位：%', data: earthData }, target: 'Earth', title: '地球与数据图表',
      reply: '地球表面约 71% 被海洋覆盖，其余约 29% 为陆地。本页使用固定数据示例；原项目的图表参数由模型提供，并未自动核验来源。',
      result: `执行结果：显示${chart === 'pie' ? '饼图' : '柱状图'}，把回答中的数值转成可视化。`,
    };
  }
  const body = bodies.find((item) => normalized.includes(item.label) || normalized.includes(item.id.toLowerCase()));
  if (body) return {
    preset: body.id === 'Saturn' ? 'saturn' : null, name: 'focus_planet', args: { planet: body.id }, target: body.id, title: `聚焦${body.label}`,
    reply: body.id === 'Saturn' ? '镜头聚焦土星和它的环。上游由 Realtime 模型选择 focus_planet 工具，再触发 Spline 中提前制作的聚焦动画。' : `镜头聚焦${body.label}。自然语言在原项目中被转换为对象名称，场景代码据此执行预设动作。太阳与冥王星也沿用 focus_planet 这个工具名。`,
    result: `执行结果：镜头移动到${body.label}，突出显示选中对象。`,
  };
  return null;
}

export const capabilities = [
  { title: '聚焦天体', code: 'focus_planet', description: '提到一个已配置对象，镜头聚焦它。太阳、地球、土星等需要各自的动画。', command: '看看土星' },
  { title: '回答转成图表', code: 'display_data', description: '将模型传入的数值显示为饼图或柱状图。上游没有数据核验环节。', command: '比较地球陆地和海洋面积' },
  { title: '依次显示卫星', code: 'show_moons', description: '显示木星的四颗伽利略卫星，或冥王星的五颗卫星。范围由配置决定。', command: '冥王星的卫星' },
  { title: '切换轨道视角', code: 'show_orbit', description: '触发俯视镜头动画，帮助讲解对象之间的关系。', command: '俯视行星轨道' },
  { title: '外部数据接入', code: 'get_iss_position', description: '查询 ISS 经纬度并交给模型回答。场景中只播放预设 ISS 动画。', command: '空间站在哪里' },
  { title: '镜头复位', code: 'reset_camera', description: '结束话题后返回初始视角，把界面恢复到整体展示状态。', command: '回到全景' },
];

export const scenarios = [
  { id: 'pump', title: '设备与结构教学', subtitle: '接到 002 · Dioramas', example: '“看看叶轮，再演示水怎样流动。”', description: '把已有离心泵场景变成能随提问改变画面的讲解工具。', chain: ['识别部件名称', '聚焦叶轮', '播放流动动画'], reuse: 'WebRTC 会话、工具定义方式、指令到动作的映射。', build: '新增 focus_component 与 play_animation，整理部件 ID 和预设动画；解释内容采用可核对的教材或说明书。', value: '用户用熟悉的部件名称操作画面，减少寻找菜单的成本。', boundary: '讲解和展示不等于流体仿真。流量、压力与故障判断需要另接可信数据或计算模型。' },
  { id: 'community', title: '社区与文化导览', subtitle: '接到 004 · Dvor', example: '“书屋在哪？带我看看今天的服务。”', description: '将已有社区场景中的地点与服务信息，组织成可问可看的导览。', chain: ['选择地点', '切换导览镜头', '显示服务信息'], reuse: '语音输入输出、工具协议与镜头切换模式。', build: '新增 focus_place 与 show_service，建立地点映射，接入实际开放时间与服务信息。', value: '提问直接定位地点，画面和信息一起变化，适合展馆或社区说明。', boundary: '没有实际定位与地图服务时，只能导览示意场景；服务信息需要独立维护。' },
  { id: 'product', title: '产品结构讲解', subtitle: '展厅 / 售前 / 培训', example: '“打开外壳，让我看看内部连接。”', description: '为一组明确的产品模型增加结构拆解与参数说明。', chain: ['确认产品对象', '触发拆解动画', '展示参数'], reuse: '自然语言到受限工具调用的连接方式。', build: '制作拆解动画，新增 explode_model 与 show_spec，按产品版本接入真实规格。', value: '把结构操作与解释连起来，适合需要同时看模型和听说明的展示。', boundary: '它不会自动识别任意 CAD 模型，也不会自动生成拆解关系；这些信息需先准备。' },
  { id: 'research', title: '研究总库导览', subtitle: '接到已有编号项目', example: '“对比 Dioramas 和 Dvor 的交互方式。”', description: '让访客通过提问选择项目、查看原理并比较能力。', chain: ['匹配编号项目', '读取已核验资料', '展示对比'], reuse: '语音会话与工具调用入口，场景可以换成普通网页组件。', build: '新增 select_project、show_comparison，读取 projects.json 与结构化研究证据；限制回答到已有资料。', value: '使分散的研究内容更容易查找，复用已有元数据与证据记录。', boundary: '资料检索、来源展示和事实校验都需新增。当前上游没有知识库或研究总库功能。' },
];

export const sources = [
  ['上游 README', `${SOURCE_BASE}README.md`], ['工具与提示词', `${SOURCE_BASE}lib/config.ts`],
  ['会话处理', `${SOURCE_BASE}components/app.tsx`], ['场景动作', `${SOURCE_BASE}components/scene.tsx`],
  ['短期凭据接口', `${SOURCE_BASE}app/api/session/route.ts`], ['ISS 查询', `${SOURCE_BASE}app/api/iss/route.ts`],
  ['图表组件映射', `${SOURCE_BASE}lib/components-mapping.tsx`], ['会话控制', `${SOURCE_BASE}components/controls.tsx`],
  ['事件日志', `${SOURCE_BASE}components/logs.tsx`], ['模型与端点配置', `${SOURCE_BASE}lib/constants.ts`],
  ['依赖版本', `${SOURCE_BASE}package.json`], ['上游 MIT 许可', `${SOURCE_BASE}LICENSE`],
  ['OpenAI 函数调用', 'https://developers.openai.com/api/docs/guides/realtime-conversations#function-calling'],
  ['WebRTC 官方文档', 'https://developers.openai.com/api/docs/guides/voice-webrtc'],
];
