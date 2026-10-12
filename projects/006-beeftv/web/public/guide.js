const guideDialog = document.querySelector('#guide-dialog');
const openGuide = document.querySelector('#open-guide');
const closeGuide = document.querySelector('#close-guide');
if (guideDialog && typeof guideDialog.showModal === 'function') {
  openGuide.hidden = false;
  openGuide.addEventListener('click', () => {
    guideDialog.showModal();
    guideDialog.scrollTop = 0;
    guideDialog.querySelector('.guide-dialog-body').scrollLeft = 0;
  });
  closeGuide.addEventListener('click', () => guideDialog.close());
  guideDialog.addEventListener('click', (event) => {
    if (event.target !== guideDialog) return;
    const bounds = guideDialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) guideDialog.close();
  });
  guideDialog.addEventListener('close', () => openGuide.focus({ preventScroll: true }));
}
