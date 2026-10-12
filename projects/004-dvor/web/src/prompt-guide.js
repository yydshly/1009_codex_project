import './prompt-guide.css';

export const PROMPT_TEMPLATES = {
  '3d': `独立创建一个 Three.js 风格化庭院网页，从视觉规格实现自己的场景与渲染规则。

【目标画面】
具有手绘动画背景的观感，温暖、安静、有生活痕迹。
使用真实 3D 几何、实时材质和光照实现。

【第一阶段：最小场景】
只搭建地面、一栋住宅、三棵树、一张长椅和一块公告板。
初始相机从庭院入口看向内部，支持拖拽旋转和缩放。
主体形成视觉中心，树木围合画面两侧。

【造型规则】
建筑由简化体块构成，窗户按参数重复排列。
树冠由少量不规则团块组成，保持清晰的整体轮廓。
细节集中在靠近相机的位置，远景保持简洁。
固定布局、随机种子和初始镜头，便于比较每次修改。

【视觉规则】
建筑主色 #D9C39E，植被 #90A85C，阴影 #5B8087，天空 #ECD3AB，点缀色 #B86D49。
使用三档卡通明暗，保持整块色彩。
阳光高度约 30 度，形成温暖高光和较长阴影，暗部保持可读。
轮廓线约 1–2 像素，突出主要轮廓，远处减弱。
添加轻微空气透视，保证前景清楚、远景柔和。

【可控与可复用】
把色带数量、阴影色、太阳高度、描边强度、雾的距离和整体饱和度集中在 styleConfig 中。
提供参数面板，实时修改这些设置。
提供默认风格恢复和 JSON 导出。
使用参数化函数搭建重复物件，布局和内容单独保存为数据。

【验收与下一阶段】
固定初始镜头，提供实际浏览器截图。
检查大块明暗、冷暖关系和轮廓是否符合目标。
确认参数实际改变渲染结果，画布可旋转和缩放，浏览器无运行错误。
先完成这个小场景，再扩展住宅、设施、地点注释和漫游。
每轮修正一个视觉问题，保持其他条件稳定，并提供同一镜头截图。`,
  image: `生成一张风格化庭院画面，用于确定后续 3D 网页的艺术方向。

【场景与构图】
傍晚的住宅庭院，从入口望向中央游乐设施。
住宅围合背景，树木位于两侧，长椅和公告板提供生活痕迹。
主体清楚，前景、中景、远景具有层次。

【形体与风格】
手绘动画背景观感，简化而明确的建筑体块。
树冠用少量团块形成清晰的整体轮廓。
大块三档明暗，细而克制的轮廓线，细节集中在近处。

【配色与光影】
米黄色建筑 #D9C39E，灰绿色植被 #90A85C，蓝绿色阴影 #5B8087。
暖纸色天空 #ECD3AB，少量砖红色 #B86D49 点缀。
低角度暖色阳光与较长投影，暗部保持可读。
轻微远景雾，前景清楚、远景柔和。
颜色值作为视觉参考，以整张画面的冷暖关系为准。

【交付与修正】
输出一张横向 16:9 画面，传达温暖、安静的生活氛围。
后续修改保持镜头和构图，每轮只校准一个问题，例如阴影亮度、轮廓密度或树冠体块。
这张图片用于视觉参考；后续实时 3D 工程需要把视觉规则落实为几何、材质、灯光和参数。`,
};

export function initializePromptGuide() {
  const editor = document.getElementById('prompt-text');
  const status = document.getElementById('prompt-status');
  const styleButton = document.getElementById('prompt-use-style');
  const fallback = document.getElementById('prompt-copy-fallback');
  const manual = document.getElementById('prompt-manual-copy');
  const drafts = new Map(Object.entries(PROMPT_TEMPLATES));
  let mode = '3d';
  const updateLength = () => { document.getElementById('prompt-length').textContent = `${editor.value.length} 字符`; };
  function chooseMode(next) {
    drafts.set(mode, editor.value);
    mode = next; editor.value = drafts.get(mode); editor.scrollTop = 0;
    document.querySelectorAll('[data-prompt-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.promptMode === mode)));
    styleButton.disabled = mode !== '3d';
    updateLength(); fallback.hidden = true;
    status.textContent = mode === '3d' ? '3D 模板已就绪，可直接编辑，或带入当前实验参数。' : '图片模板已就绪，重点校准构图、形体与光影。';
  }
  editor.value = PROMPT_TEMPLATES[mode]; updateLength();
  editor.addEventListener('input', () => { drafts.set(mode, editor.value); updateLength(); });
  document.querySelectorAll('[data-prompt-mode]').forEach(button => button.addEventListener('click', () => chooseMode(button.dataset.promptMode)));
  async function copyText(text, label) {
    if (!text.trim()) { status.textContent = '请先填写提示词，再复制。'; return; }
    try {
      await navigator.clipboard.writeText(text);
      fallback.hidden = true; status.textContent = `已复制${label}，可以粘贴到模型中。`;
    } catch {
      fallback.hidden = false; manual.value = text; manual.focus(); manual.select();
      status.textContent = '自动复制不可用，文本已选中。可按 Ctrl+C，或长按复制。';
    }
  }
  document.getElementById('copy-prompt').addEventListener('click', () => copyText(editor.value, '完整提示词'));
  document.querySelectorAll('[data-copy-revision]').forEach(button => button.addEventListener('click', () => {
    const text = document.querySelector(`[data-revision="${button.dataset.copyRevision}"]`).textContent;
    copyText(text, '修正提示词');
  }));
  document.getElementById('reset-prompt').addEventListener('click', () => {
    editor.value = PROMPT_TEMPLATES[mode]; editor.scrollTop = 0; drafts.set(mode, editor.value); updateLength(); fallback.hidden = true;
    status.textContent = '已恢复当前模板的初始内容。';
  });
  document.getElementById('download-prompt').addEventListener('click', () => {
    if (!editor.value.trim()) { status.textContent = '请先填写提示词，再下载。'; return; }
    const url = URL.createObjectURL(new Blob([editor.value], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = `stylized-scene-${mode}-prompt.txt`;
    link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.textContent = '提示词文本已准备下载。';
  });
  styleButton.addEventListener('click', () => {
    const lab = window.__dvorLab;
    if (!lab?.ready) { status.textContent = '实验区正在初始化，请稍后再带入参数。'; return; }
    const style = lab.style;
    const near = Math.round(90 - style.fog * 0.6), far = Math.round(330 - style.fog * 1.8);
    const appendix = `【当前实验参数，替换上文对应设置】
光照色带：${style.bands} 档。
太阳高度：${style.sun} 度。
阴影色：${style.shadow}。
描边强度参考：${style.ink}%；独立工程需按约 1–2 像素的视觉目标重新标定。
空气透视参考：${style.fog}%${style.fog === 0 ? '，关闭雾' : `，本页对应雾近距 ${near}、远距 ${far}；独立工程按场景尺度换算`}。
整体饱和度参考：${style.saturation}，暖度参考：${style.warmth}。
这些值是本页的风格参考，不依赖本页或任何既有庭院项目的代码。实现自己的材质、光照与后处理，并通过同镜头截图校准。
【实验参数结束】`;
    const body = editor.value.replace(/【当前实验参数，替换上文对应设置】[\s\S]*?【实验参数结束】\s*/g, '').trimEnd();
    editor.value = `${body}\n\n${appendix}`; editor.scrollTop = editor.scrollHeight; drafts.set(mode, editor.value); updateLength();
    status.textContent = '已带入当前实验参数；保留原有正文与自定义编辑。';
  });
}
