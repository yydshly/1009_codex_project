import { STAGE_TEMPLATES } from './stage-templates.js';
import { STAGE_LIBRARY_KEY, readStageLibrary, readStageSelection, selectStageReference } from './stage-projects.js';
import './stage-library.css';

export function mountStagePicker(select, onChange, onError) {
  let stamp = '', disposed = false;
  const refresh = () => {
    try {
      const library = readStageLibrary(localStorage), selection = readStageSelection(localStorage);
      select.replaceChildren();
      for (const [label, entries] of [
        ['我的项目', library.projects.map(project => ({ value: `project:${project.id}`, name: `${project.stage.name} · v${project.revision}` }))],
        ['五套模板', STAGE_TEMPLATES.map(template => ({ value: `template:${template.id}`, name: template.name }))],
      ]) {
        if (!entries.length) continue;
        const group = document.createElement('optgroup'); group.label = label;
        for (const entry of entries) { const option = document.createElement('option'); option.value = entry.value; option.textContent = entry.name; group.append(option); }
        select.append(group);
      }
      select.value = selection.ref; select.disabled = false;
      return selection;
    } catch (error) { onError(error); return null; }
  };
  const track = selection => { if (selection) stamp = `${selection.ref}:${selection.revision}`; };
  const change = async () => {
    try { const selection = selectStageReference(localStorage, select.value); track(selection); await onChange(); }
    catch (error) { refresh(); onError(error); }
  };
  const stored = async event => {
    if (disposed || (event.key !== STAGE_LIBRARY_KEY && event.key !== null)) return;
    const selection = refresh();
    if (selection && `${selection.ref}:${selection.revision}` !== stamp) { track(selection); await onChange(); }
  };
  track(refresh()); select.addEventListener('change', change); window.addEventListener('storage', stored);
  return { refresh: () => track(refresh()), dispose: () => { disposed = true; select.removeEventListener('change', change); window.removeEventListener('storage', stored); } };
}
