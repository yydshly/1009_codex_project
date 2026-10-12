// Research overview and a reusable creative brief; no model calls during playback.
const overviewDialog = document.getElementById('overview-dialog');
const overviewZoom = document.getElementById('overview-zoom');
function openOverview() {
  overviewZoom.value = 1;
  document.getElementById('overview-dialog-image').style.width = '100%';
  document.getElementById('overview-zoom-value').textContent = '100%';
  overviewDialog.showModal();
}
document.getElementById('overview-open').addEventListener('click', openOverview);
document.getElementById('overview-enlarge').addEventListener('click', openOverview);
document.getElementById('overview-close').addEventListener('click', () => overviewDialog.close());
overviewZoom.addEventListener('input', () => {
  const percent = Math.round(Number(overviewZoom.value) * 100);
  document.getElementById('overview-dialog-image').style.width = percent + '%';
  document.getElementById('overview-zoom-value').textContent = percent + '%';
});
overviewDialog.addEventListener('click', event => {
  if (event.target !== overviewDialog) return;
  const rect = overviewDialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) overviewDialog.close();
});
document.getElementById('copy-creative-prompt').addEventListener('click', async () => {
  const prompt = document.getElementById('creative-prompt-text');
  const status = document.getElementById('prompt-status');
  try {
    await navigator.clipboard.writeText(prompt.textContent.trim());
    status.textContent = '已复制，可直接交给编程模型。';
  } catch {
    const range = document.createRange(); range.selectNodeContents(prompt);
    const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
    status.textContent = '文字已选中，请复制；也可下载 TXT。';
  }
});
document.querySelectorAll('a[href="#creative-prompt"]').forEach(link => link.addEventListener('click', () => {
  document.getElementById('creative-prompt').open = true;
}));
function openLinkedPrompt() { if (location.hash === '#creative-prompt') document.getElementById('creative-prompt').open = true; }
window.addEventListener('hashchange', openLinkedPrompt); openLinkedPrompt();
