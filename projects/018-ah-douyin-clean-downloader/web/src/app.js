const dialog = document.querySelector('#guide-dialog');
const sizeButton = document.querySelector('#guide-size');
let returnFocus = null;
document.querySelectorAll('[data-open-guide]').forEach(button => button.addEventListener('click', () => {
  returnFocus = button;
  dialog.classList.remove('original-size');
  sizeButton.setAttribute('aria-pressed', 'false');
  sizeButton.textContent = '原始尺寸';
  dialog.showModal();
  document.body.classList.add('modal-open');
}));
document.querySelector('#guide-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('modal-open');
  returnFocus?.focus();
});
sizeButton.addEventListener('click', () => {
  const original = dialog.classList.toggle('original-size');
  sizeButton.setAttribute('aria-pressed', String(original));
  sizeButton.textContent = original ? '适应宽度' : '原始尺寸';
});
const tabs = [...document.querySelectorAll('.route-tabs [role="tab"]')];
function activate(tab) {
  tabs.forEach(item => {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
  });
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activate(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) { event.preventDefault(); activate(tabs[next]); tabs[next].focus(); }
  });
});
const navLinks = [...document.querySelectorAll('.toc a')];
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => {
        if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-10% 0px -72% 0px' });
  document.querySelectorAll('.article-body > section').forEach(section => observer.observe(section));
}
