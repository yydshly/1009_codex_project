const dialog = document.querySelector('#guide-dialog');
const sizeButton = document.querySelector('#guide-size');
let guideTrigger;
for (const trigger of document.querySelectorAll('[data-open-guide]')) {
  trigger.addEventListener('click', event => {
    event.preventDefault();
    guideTrigger = trigger;
    dialog.showModal();
    document.body.classList.add('dialog-open');
    document.querySelector('#guide-close').focus();
  });
}
document.querySelector('#guide-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('dialog-open');
  dialog.classList.remove('original-size');
  sizeButton.setAttribute('aria-pressed', 'false');
  sizeButton.textContent = '原始尺寸';
  guideTrigger?.focus();
});
sizeButton.addEventListener('click', () => {
  const original = dialog.classList.toggle('original-size');
  sizeButton.setAttribute('aria-pressed', String(original));
  sizeButton.textContent = original ? '适应窗口' : '原始尺寸';
});

const tabs = [...document.querySelectorAll('.flow-tabs [role="tab"]')];
function chooseTab(tab) {
  for (const item of tabs) {
    const active = item === tab;
    item.setAttribute('aria-selected', String(active));
    item.tabIndex = active ? 0 : -1;
    document.getElementById(item.getAttribute('aria-controls')).hidden = !active;
  }
}
for (const tab of tabs) {
  tab.addEventListener('click', () => chooseTab(tab));
  tab.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const index = tabs.indexOf(tab);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    chooseTab(tabs[next]);
    tabs[next].focus();
  });
}
chooseTab(tabs[0]);
if ('IntersectionObserver' in window) {
  const links = [...document.querySelectorAll('.reading-nav nav a')];
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      for (const link of links) {
        const current = link.hash === '#' + entry.target.id;
        if (current) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      }
    }
  }, { rootMargin: '-15% 0px -65% 0px' });
  for (const section of document.querySelectorAll('.reading-content > section')) observer.observe(section);
}
