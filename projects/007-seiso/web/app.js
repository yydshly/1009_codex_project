const dialog = document.getElementById('guide-dialog');
document.getElementById('guide-open').addEventListener('click', () => dialog.showModal());
document.getElementById('guide-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });

const filterButtons = [...document.querySelectorAll('[data-rule-filter]')];
const ruleEntries = [...document.querySelectorAll('.rule[data-status]')];
for (const button of filterButtons) {
  button.addEventListener('click', () => {
    const status = button.dataset.ruleFilter;
    for (const entry of ruleEntries) entry.hidden = status !== 'all' && entry.dataset.status !== status;
    for (const candidate of filterButtons) candidate.setAttribute('aria-pressed', String(candidate === button));
    const count = ruleEntries.filter(entry => !entry.hidden).length;
    document.getElementById('rule-count').textContent = `显示${status === 'all' ? '全部' : status === 'stable' ? '默认稳定' : '预览'} ${count} 条规则`;
  });
}

const tabs = [...document.querySelectorAll('.example-tabs [role="tab"]')];
function selectTab(selected, focus = false) {
  for (const tab of tabs) {
    const active = tab === selected;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
    document.getElementById(tab.getAttribute('aria-controls')).hidden = !active;
  }
  if (focus) selected.focus();
}
for (const tab of tabs) {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', (event) => {
    const index = tabs.indexOf(tab);
    const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : -1;
    if (next >= 0) { event.preventDefault(); selectTab(tabs[next], true); }
  });
}
