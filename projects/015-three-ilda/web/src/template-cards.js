import { STAGE_TEMPLATES, createTemplateStage } from './stage-templates.js';
const ns = 'http://www.w3.org/2000/svg';
function svgNode(tag, attributes) {
  const node = document.createElementNS(ns, tag);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, String(value));
  return node;
}
// 从配置绘制构件平面示意；不冒充实际 GPU 预览。
function plan(stage, color) {
  const svg = svgNode('svg', { viewBox: '0 0 240 150', 'aria-hidden': 'true' });
  for (const element of [...stage.objects].sort((a,b) => (a.type === 'platform' ? -1 : 1) - (b.type === 'platform' ? -1 : 1))) {
    const [x,,z] = element.position, [width,,depth] = element.size;
    const group = svgNode('g', { transform: `translate(${120+x*8} ${72+z*6}) rotate(${-element.rotationY})` });
    if (element.type === 'platform') group.append(svgNode(element.shape === 'round' ? 'ellipse' : 'rect', element.shape === 'round' ? { cx:0,cy:0,rx:width*4,ry:depth*3,fill:element.color,stroke:color,'stroke-width':.7 } : { x:-width*4,y:-depth*3,width:width*8,height:depth*6,fill:element.color,stroke:color,'stroke-width':.7 }));
    if (element.type === 'screen') group.append(svgNode('rect',{x:-width*4,y:-2,width:width*8,height:4,fill:color}));
    if (element.type === 'slot') group.append(svgNode('rect',{x:-width*4,y:-depth*3,width:width*8,height:depth*6,fill:'none',stroke:'#ebbd83','stroke-dasharray':'3 2'}));
    if (element.type === 'laser') group.append(svgNode('path',{d:'M -4 -4 L 4 -4 L 0 4 Z',fill:'#7faee7'}));
    if (element.type === 'truss') group.append(svgNode('circle',{r:2.5,fill:'#a2b7c6'}));
    svg.append(group);
  }
  return svg;
}
export function renderTemplateCards(container, onUse) {
  for (const template of STAGE_TEMPLATES) {
    const stage = createTemplateStage(template.id), button = document.createElement('button'), copy = document.createElement('span');
    button.type='button'; button.className='stage-template-card'; button.dataset.template=template.id; button.disabled=true;
    button.style.setProperty('--accent',template.color); button.setAttribute('aria-label',`使用${template.name}模板`); button.setAttribute('aria-pressed','false');
    button.append(plan(stage,template.color)); copy.className='template-copy';
    for (const [className,text] of [ ['template-tag',template.tag], ['template-title',template.name], ['template-description',template.description], ['template-count',`${stage.objects.filter(x=>x.type==='laser').length} 台激光 · ${stage.objects.filter(x=>x.type==='screen').length} 面屏幕 · 平面示意`], ['template-action','使用模板 →'] ]) {
      const span=document.createElement('span'); span.className=className; span.textContent=text; copy.append(span);
    }
    button.append(copy); button.addEventListener('click',()=>onUse(template.id)); container.append(button);
  }
}
