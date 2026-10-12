const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const root='https://github.com/lemomo-ai/lemo-opuscar/blob/';
try {
  const response=await fetch('./data/research-guide.json');if(!response.ok)throw new Error('理解说明加载失败');
  const d=await response.json();
  document.getElementById('capability-list').innerHTML=d.capabilities.map((c,i)=>`<article><span>0${i+1}</span><h3>${esc(c.title)}</h3><p>${esc(c.text)}</p><a href="${root+d.ref+'/'+c.source}" target="_blank" rel="noopener">依据：${esc(c.source)} ↗</a></article>`).join('');
  document.getElementById('module-list').innerHTML=d.modules.map((m,i)=>`<article><div><span>0${i+1}</span><h3>${esc(m.name)}</h3><code>${esc(m.path)}</code></div><p>${esc(m.role)}</p><p class="module-boundary">${esc(m.boundary)}</p></article>`).join('');
  document.getElementById('principle-list').innerHTML=d.principles.map((p,i)=>`<li><span>0${i+1}</span><div><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></div></li>`).join('');
  document.getElementById('extension-list').innerHTML=d.extensions.map((x,i)=>`<article><span>0${i+1} / 扩展建议</span><h3>${esc(x.title)}</h3><p>${esc(x.idea)}</p><dl><div><dt>需要补齐</dt><dd>${esc(x.requires)}</dd></div><div><dt>怎样验证</dt><dd>${esc(x.verify)}</dd></div></dl></article>`).join('');
  document.getElementById('guide-updated').textContent=d.updatedAt;
} catch(error) {
  document.querySelectorAll('[data-research-loading]').forEach(node=>node.textContent='理解说明暂未载入，可刷新页面或查看研究文档。');console.error(error);
}
const panel=document.getElementById('original-guide-frame'),button=document.getElementById('expand-original-guide');
button.addEventListener('click',()=>{const expanded=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(expanded));panel.classList.toggle('expanded',expanded);button.textContent=expanded?'收起引导图 ↑':'展开完整引导图 ↓';if(!expanded)document.getElementById('guide').scrollIntoView({behavior:'smooth'});});
