export function renderEffectCards(container, catalog, onSelect) {
  container.replaceChildren();
  for (const entry of catalog) {
    const button = document.createElement('button'), image = document.createElement('img'), title = document.createElement('strong'), note = document.createElement('small'), frames = document.createElement('small');
    button.type = 'button'; button.dataset.effect = entry.id; button.setAttribute('aria-label', `接入效果 ${entry.name}`);
    image.src = new URL(entry.preview, document.baseURI).href; image.alt = ''; image.loading = 'lazy';
    title.textContent = entry.name; note.textContent = `${entry.origin === 'upstream' ? '上游节目' : '本地原创'} · 源帧路线示意`;
    frames.textContent = `${entry.frames.toLocaleString('zh-CN')} 帧`;
    button.append(image, title, note, frames); button.addEventListener('click', () => onSelect(entry.id)); container.append(button);
  }
}
