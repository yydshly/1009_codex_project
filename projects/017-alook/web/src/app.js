const dialog = document.getElementById('guide-dialog');
let opener;
for (const button of document.querySelectorAll('[data-guide-open]')) {
  button.addEventListener('click', () => {
    opener = button;
    dialog.showModal();
  });
}
document.getElementById('guide-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
dialog.addEventListener('close', () => opener?.focus());

const steps = JSON.parse(document.getElementById('flow-data').textContent);
const stepButtons = [...document.querySelectorAll('[data-step]')];
for (const button of stepButtons) {
  button.addEventListener('click', () => {
    const step = steps[Number(button.dataset.step)];
    for (const other of stepButtons) other.setAttribute('aria-pressed', String(other === button));
    document.getElementById('step-actor').textContent = step.actor;
    document.getElementById('step-title').textContent = step.title;
    document.getElementById('step-text').textContent = step.text;
    document.getElementById('step-result').textContent = step.result;
    document.getElementById('step-source').href = step.url;
  });
}

if ('IntersectionObserver' in window) {
  const links = [...document.querySelectorAll('.contents a')];
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      for (const link of links) {
        const current = link.hash === `#${entry.target.id}`;
        if (current) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      }
    }
  }, { rootMargin: '-12% 0px -60% 0px' });
  for (const section of document.querySelectorAll('.article > section')) observer.observe(section);
}
