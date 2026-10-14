import {installBlueprint} from './platform-blueprint.js';
installBlueprint(document.getElementById('platform-blueprint'));
import {installFilmReading} from './film-reading.js';
const players = new Map([
  ['reference', document.getElementById('reference-video')],
  ['current', document.getElementById('current-video')],
]);
installFilmReading(players.get('current'));
for (const [id, player] of players) {
  player.addEventListener('play', () => {
    for (const other of players.values()) if (other !== player) other.pause();
  });
  const showError = () => {
    const status = document.getElementById(`${id}-status`);
    status.hidden = false;
    status.textContent = id === 'reference'
      ? '本地原片未能加载，请通过下方原帖入口查看。'
      : '本地成片未能加载，仍可通过下方入口进入完整交互体验。';
  };
  player.addEventListener('error', showError);
  player.querySelector('source').addEventListener('error', showError);
}
for (const button of document.querySelectorAll('[data-player]')) {
  button.setAttribute('aria-pressed', 'false');
  button.addEventListener('click', () => {
    const player = players.get(button.dataset.player);
    const seek = () => {
      player.currentTime = Math.min(Number(button.dataset.time), player.duration || Infinity);
      // Keep audio playback user controlled; a time label positions the paused frame.
    };
    player.pause();
    if (player.readyState >= 1) seek();
    else { player.addEventListener('loadedmetadata', seek, {once:true}); player.load(); }
    for (const sibling of document.querySelectorAll(`[data-player="${button.dataset.player}"]`)) {
      sibling.setAttribute('aria-pressed', String(sibling === button));
    }
  });
}

const container = document.getElementById('round-records');
const status = document.getElementById('record-status');
let rounds = [];
function render(phase) {
  const shown = rounds.filter(record => phase === 'all' || record.phase === phase);
  container.replaceChildren();
  for (const record of shown) {
    const item = document.createElement('details');
    const summary = document.createElement('summary');
    const badge = document.createElement('strong'); badge.textContent = record.label;
    const title = document.createElement('span'); title.textContent = record.title;
    summary.append(badge, title);
    const detail = document.createElement('div'); detail.className = 'record-detail';
    const description = document.createElement('p'); description.textContent = record.summary;
    const count = document.createElement('p'); count.textContent = `${record.fileCount} 项文件记录 · ${record.mediaCount} 项媒体记录 · 完全相同内容共享保存`;
    const manifest = document.createElement('a'); manifest.href = record.manifest; manifest.textContent = '下载源码与素材清单 ↗'; manifest.download = `${record.id}-retention.json`;
    const notes = document.createElement('a'); notes.href = record.notes; notes.textContent = '本轮记录 ↗';
    detail.append(description, count, manifest, notes); item.append(summary, detail); container.append(item);
  }
  status.textContent = `显示 ${shown.length} / ${rounds.length} 个已有轮次；每轮清单保留文件路径、大小与 SHA-256。`;
}
try {
  const response = await fetch('./assets/records/rounds.json');
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  rounds = (await response.json()).rounds;
  render('all');
} catch {
  status.textContent = '轮次索引暂不可用，可进入探索手记阅读历史演进。';
}
for (const button of document.querySelectorAll('[data-phase]')) button.addEventListener('click', () => {
  for (const sibling of document.querySelectorAll('[data-phase]')) sibling.setAttribute('aria-pressed', String(sibling === button));
  render(button.dataset.phase);
});

// Old deep links still reveal their retained research chapter.
async function revealRetainedChapter(){
 const hash=location.hash,target=document.getElementById(decodeURIComponent(hash.slice(1)));if(!target)return;
 for(let parent=target.parentElement;parent;parent=parent.parentElement)if(parent.tagName==='DETAILS')parent.open=true;
 // Revealing archived chapters can load earlier lazy images and move the anchor.
 const earlier=[...document.images].filter(img=>img.compareDocumentPosition(target)&Node.DOCUMENT_POSITION_FOLLOWING);
 await Promise.all(earlier.map(img=>{img.loading='eager';return img.decode().catch(()=>{});}));
 if(location.hash===hash)requestAnimationFrame(()=>target.scrollIntoView({block:'start',behavior:'instant'}));
}
window.addEventListener('hashchange',revealRetainedChapter);if(location.hash)revealRetainedChapter();
