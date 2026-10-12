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
