const steps = [
  { kicker: '客户端 → Relay → Connector', title: '先发现获准的实例和原生方法', description: '助手调用 search。Relay 检查 OAuth 授权；Connector 根据运行时类型、方法名和描述做关键词匹配。默认给出方法摘要，需要参数时用 includeSchema: true。', code: 'search({ query: "thread/start", includeSchema: true })', note: 'search 是不区分大小写的关键词 AND 匹配，并非语义检索。空 query 只列实例。' },
  { kicker: '助手选择配置与原生会话', title: '先选实例，再取得真实 threadId', description: '选中 deviceId + instanceId，例如服务器上的 coding 实例。创建会话时 call thread/start，保留原生返回的 threadId；继续旧会话则查询并按需 resume。实例 context 帮助选择，不是权限保证。', code: 'const target = { deviceId: "server-codex", instanceId: "coding" };\nconst r = await call(target, "thread/start", { cwd: "/repo" });\nreturn r; // 保留确认与原生 thread ID', note: '这里的 ID 与目录是示意数据；具体参数以 search 获取的当前原生 schema 为准。' },
  { kicker: '客户端 → HTTPS /mcp → Relay', title: 'Relay 按 Connector 身份找到当前 WSS', description: 'execute 在独立 QuickJS context 运行短脚本。call 进入 Relay：检查 grant、获准范围、在线连接与原生可用性，生成 requestId，记录 pending 和当前 epoch，再经该 Connector 的 WSS 发送。', code: 'return await call(target, "turn/start", {\n  threadId: "thr_NATIVE_ID",\n  input: [{ type: "text", text: "修复失败的测试" }]\n});', note: 'Relay 维护授权、连接和请求关联；它不扫描操作系统进程来猜测哪个 Agent 对应任务。' },
  { kicker: 'Relay → 目标侧 Connector', title: 'instanceId 精确选中内置 Adapter', description: 'Connector 校验消息、重复 requestId、实例范围指纹与可用性。它在启动时已为每项实例配置创建 Adapter，现在通过 adapters.get(instanceId) 调用 adapter.call(method, params)。', code: 'const adapter = adapters.get(packet.instanceId);\n// 检查 instance.fingerprint === packet.fingerprint\nreturn await adapter.call(packet.method, packet.params);', note: '这是源码逻辑的简化示意。Adapter 是 Connector 内的对象，不是一层另行部署的服务。' },
  { kicker: 'Codex Adapter → 独立 app-server', title: '原生 threadId 把输入送到具体会话', description: 'Codex Adapter 校验原生 schema、应用执行参数，并通过已初始化的本机 WebSocket / Unix socket 发送 JSON-RPC。原生 threadId 定位会话，RPC id 匹配应答；返回 turnId 用于观察本轮执行。', code: '{\n  id: 17, method: "turn/start",\n  params: { threadId: "thr_NATIVE_ID", input: [...] }\n}\n// 对应应答以 id: 17 返回 result 或 error', note: '当前实现附着独立服务，不启动 Codex 进程。初始化核对 codexHome；不自动共享桌面 stdio 聊天。' },
  { kicker: '原生结果 → Connector → Relay → 助手', title: '收到接受确认后，再观察结果与业务证据', description: '原生应答按 RPC id 回到 Adapter，再以 requestId 回到 Relay pending；交付前再次检查授权与连接代次。execute 正常交付脚本返回内容。助手等待或收事件后，用新调用读状态、输出和测试结果。', code: '提交：accepted + threadId / turnId\n↓ 调用方等待，或订阅 runtime.changed\n再读：thread/read / 原生历史 / notifications.list\n↓ 检查测试与产物，决定是否继续', note: 'accepted 只确认输入，不等于修复成功。unknown 时先对账；断线重连不自动重放写操作。' }
];
let current = 0;
const buttons = [...document.querySelectorAll('[data-step]')];
function showStep(index) {
  current = index;
  const step = steps[index];
  const serial = String(index + 1).padStart(2, '0');
  document.getElementById('step-kicker').textContent = `STEP ${serial} / ${step.kicker}`;
  document.getElementById('step-title').textContent = step.title;
  document.getElementById('step-description').textContent = step.description;
  document.getElementById('step-code').textContent = step.code;
  document.getElementById('step-note').textContent = step.note;
  document.getElementById('step-count').textContent = `${serial} / 06`;
  document.getElementById('next-step').textContent = index === 5 ? '重新看一遍 ↻' : '下一步 →';
  buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
}
buttons.forEach(button => button.addEventListener('click', () => showStep(Number(button.dataset.step))));
document.getElementById('next-step').addEventListener('click', () => showStep((current + 1) % steps.length));

const tabs = [...document.querySelectorAll('[role="tab"]')];
function selectTab(tab) {
  tabs.forEach(item => {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
    document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
  });
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', event => {
    let target;
    if (event.key === 'ArrowRight') target = tabs[(index + 1) % tabs.length];
    if (event.key === 'ArrowLeft') target = tabs[(index + tabs.length - 1) % tabs.length];
    if (event.key === 'Home') target = tabs[0];
    if (event.key === 'End') target = tabs[tabs.length - 1];
    if (target) { event.preventDefault(); selectTab(target); target.focus(); }
  });
});

const dialog = document.getElementById('guide-dialog');
document.getElementById('open-guide').addEventListener('click', () => dialog.showModal());
document.getElementById('close-guide').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
const toc = [...document.querySelectorAll('.toc a')];
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    const active = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
    if (active) toc.forEach(link => {
      const selected = link.hash === `#${active.target.id}`;
      if (selected) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-110px 0px -65% 0px' });
  document.querySelectorAll('.section[id]').forEach(section => observer.observe(section));
}
