(() => {
  const catalog = globalThis.ASTRA_CATALOG;
  const $ = id => document.getElementById(id);
  if (!catalog?.works?.length) { $('catalog-grid').textContent = '目录加载失败，请刷新页面，或从页尾打开上游目录。'; return; }
  const works = catalog.works;
  const state = { category: 'all', query: '', sourceOnly: false, sort: 'mixed', limit: 18 };
  const categoryCounts = Object.fromEntries(catalog.categories.map(category => [category.id, works.filter(work => work.category === category.id).length]));
  const byId = new Map(works.map(work => [work.id, work]));
  const localImages = { 'https://orbital-garden-one.vercel.app/': './assets/orbital-garden.jpg', 'https://thunderfall.vercel.app/': './assets/thunderfall.jpg', 'https://sanguo-jiangshan.vercel.app/': './assets/three-kingdoms.jpg' };
  const imageFor = work => localImages[work.demoUrl] || work.imageUrl;
  const node = (tag, className, content) => { const element = document.createElement(tag); if (className) element.className = className; if (content !== undefined) element.textContent = content; return element; };
  const link = (label, url, className = '') => { const element = node('a', className, label); element.href = url; element.target = '_blank'; element.rel = 'noopener noreferrer'; return element; };
  function image(work, container, detail = false) {
    const fallback = node('span', 'image-fallback', '正在加载上游预览…');
    const element = node('img'); element.alt = work.imageAlt || `${work.name}：上游条目预览`;
    element.loading = detail ? 'eager' : 'lazy'; element.decoding = 'async'; element.referrerPolicy = 'no-referrer';
    element.addEventListener('load', () => { fallback.hidden = true; }, { once: true });
    element.addEventListener('error', () => { element.hidden = true; fallback.textContent = detail ? '预览暂不可用，仍可通过原作者入口体验。' : '预览暂不可用'; fallback.hidden = false; }, { once: true });
    element.src = imageFor(work);
    container.append(element, fallback);
  }
  function card(work) {
    const article = node('article', 'work-card'); article.dataset.workId = work.id;
    const preview = node('button', 'work-preview'); preview.type = 'button'; preview.dataset.detail = work.id; preview.setAttribute('aria-label', `查看 ${work.name} 详情`);
    image(work, preview); preview.append(node('span', 'work-category', catalog.categories.find(item => item.id === work.category).short));
    const body = node('div', 'work-body'); const author = node('p', 'work-author'); author.append(node('span', '', work.author));
    if (work.sourceLinks.length) author.append(node('span', 'source-badge', '含源码入口'));
    const heading = node('h2', 'work-title'); const titleButton = node('button', '', work.name); titleButton.type = 'button'; titleButton.dataset.detail = work.id; heading.append(titleButton);
    const controls = node('div', 'work-links'); const detail = node('button', '', '资料与详情'); detail.type = 'button'; detail.dataset.detail = work.id;
    controls.append(link('在线体验 ↗', work.demoUrl), detail);
    body.append(author, heading, node('p', 'work-description', work.description), controls); article.append(preview, body); return article;
  }
  function mixedOrder(items) {
    const buckets = catalog.categories.map(category => items.filter(work => work.category === category.id));
    const ordered = []; for (let index = 0; ordered.length < items.length; index++) for (const bucket of buckets) if (bucket[index]) ordered.push(bucket[index]);
    return ordered;
  }
  function render() {
    const needle = state.query.trim().toLocaleLowerCase().normalize('NFKC');
    const base = works.filter(work => (!state.sourceOnly || work.sourceLinks.length) && (!needle || [work.name, work.description, work.author, work.categoryName, work.platform, work.model, work.resourceText].filter(Boolean).join(' ').toLocaleLowerCase().normalize('NFKC').includes(needle)));
    let results = base.filter(work => state.category === 'all' || work.category === state.category);
    if (state.sort === 'name') results.sort((a,b) => a.name.localeCompare(b.name, 'zh-CN'));
    else if (state.sort === 'mixed') results = mixedOrder(results);
    const visible = results.slice(0,state.limit);
    $('catalog-grid').replaceChildren(...visible.map(card));
    $('empty-state').hidden = results.length > 0;
    $('load-more').hidden = results.length <= state.limit;
    $('load-more-area').hidden = results.length === 0;
    $('result-count').textContent = `找到 ${results.length} 项 / 全部 ${works.length} 项`;
    $('shown-count').textContent = `已显示 ${visible.length} / ${results.length} 项`;
    $('search-clear').hidden = !state.query;
    for (const button of $('category-menu').querySelectorAll('button')) {
      button.setAttribute('aria-pressed', String(button.dataset.category === state.category));
      button.querySelector('span:last-child').textContent = button.dataset.category === 'all' ? base.length : base.filter(work => work.category === button.dataset.category).length;
    }
  }
  const all = node('button', 'category-button'); all.type='button'; all.dataset.category='all'; all.append(node('span','','全部样例'),node('span','',works.length));
  $('category-menu').append(all,...catalog.categories.map(category => { const button=node('button','category-button');button.type='button';button.dataset.category=category.id;button.append(node('span','',category.short),node('span','',categoryCounts[category.id]));return button; }));
  $('category-menu').addEventListener('click', event => { const button=event.target.closest('[data-category]');if(!button)return;state.category=button.dataset.category;state.limit=18;render(); });
  $('catalog-search').addEventListener('input', event => {state.query=event.target.value;state.limit=18;render();});
  $('search-clear').addEventListener('click', () => {state.query='';state.limit=18;$('catalog-search').value='';render();$('catalog-search').focus();});
  $('source-only').addEventListener('change', event=>{state.sourceOnly=event.target.checked;state.limit=18;render();});
  $('catalog-sort').addEventListener('change',event=>{state.sort=event.target.value;state.limit=18;render();});
  $('load-more').addEventListener('click',()=>{state.limit+=18;render();});
  $('reset-filters').addEventListener('click',()=>{Object.assign(state,{category:'all',query:'',sourceOnly:false,limit:18});$('catalog-search').value='';$('source-only').checked=false;render();$('catalog-search').focus();});
  function resources(target, items, fallback) { target.replaceChildren();if(items.length)target.append(...items.map(item=>link(item.label+' ↗',item.url)));else target.textContent=fallback; }
  function showDetail(id) {
    const work=byId.get(id);if(!work)return;
    $('detail-category').textContent=work.categoryName;$('detail-title').textContent=work.name;$('detail-description').textContent=work.description;
    $('detail-image').replaceChildren();image(work,$('detail-image'),true);
    $('detail-author').replaceChildren(work.authorUrl?link(work.authorNote||work.author,work.authorUrl,'detail-author-link'):document.createTextNode(work.author));
    $('detail-platform').textContent=work.platform;$('detail-model').textContent=work.model;
    resources($('detail-model-links'),work.modelLinks,'条目未附模型参与链接。');
    resources($('detail-resources'),work.resources,'条目未提供开发资料链接。');
    $('detail-resource-text').textContent=work.resourceText||'是否公开源码及适用许可，需要向原作者确认。';
    $('detail-play').href=work.demoUrl;$('detail-entry').href=work.entryUrl;
    $('detail-source').hidden=!work.sourceLinks.length;if(work.sourceLinks.length)$('detail-source').href=work.sourceLinks[0].url;
    $('detail-dialog').showModal();
  }
  $('catalog-grid').addEventListener('click',event=>{const trigger=event.target.closest('[data-detail]');if(trigger)showDetail(trigger.dataset.detail);});
  $('dialog-close').addEventListener('click',()=>$('detail-dialog').close());
  $('detail-dialog').addEventListener('click',event=>{if(event.target===$('detail-dialog')){const rect=event.target.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)event.target.close();}});
  $('total-count').textContent=works.length;$('source-count').textContent=works.filter(work=>work.sourceLinks.length).length;
  $('snapshot-date').textContent=catalog.maintainedAt;$('upstream-readme').href=catalog.readmeUrl;render();
})();
