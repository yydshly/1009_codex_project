import './style.css';
import './research-guide.css';
import { samples } from './content.js';
import { initializeDemo } from './demo.js';
import { initializePromptGuide } from './prompt-guide.js';

const gallery = document.getElementById('sample-gallery');
const dialog = document.getElementById('sample-dialog');
const guideDialog = document.getElementById('guide-dialog');
document.getElementById('open-guide').addEventListener('click', () => guideDialog.showModal());
document.getElementById('close-guide').addEventListener('click', () => guideDialog.close());
guideDialog.addEventListener('click', event => { if (event.target === guideDialog) guideDialog.close(); });
for (const sample of samples) {
  const button = document.createElement('button'); button.type = 'button'; button.className = 'sample-card';
  const img = document.createElement('img'); img.src = `${import.meta.env.BASE_URL}samples/${sample.file}`; img.alt = `上游 Dvor 截图：${sample.title}`; img.width = 1600; img.height = 900;
  const line = document.createElement('div'); line.className = 'sample-line';
  const title = document.createElement('strong'); title.textContent = sample.title;
  const effect = document.createElement('small'); effect.textContent = '放大 ↗'; line.append(title, effect);
  const caption = document.createElement('p'); caption.textContent = sample.effect;
  button.append(img, line, caption);
  button.addEventListener('click', () => {
    document.getElementById('sample-image').src = img.src;
    document.getElementById('sample-image').alt = img.alt;
    document.getElementById('sample-title').textContent = sample.title;
    document.getElementById('sample-description').textContent = sample.description;
    dialog.showModal();
  }); gallery.append(button);
}
document.getElementById('close-sample').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
initializePromptGuide();
initializeDemo().catch(error => {
  console.error(error);
  const status = document.getElementById('scene-loading');
  status.textContent = '无法启动 3D 场景。请使用支持 WebGL 的浏览器；上方研究内容和截图仍可阅读。';
  status.hidden = false;
});
