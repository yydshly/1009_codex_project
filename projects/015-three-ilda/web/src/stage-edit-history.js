import { validateStage } from './stage-definition.js';

const signature = stage => JSON.stringify(stage);

// 只记录舞台配置；镜头、预览播放和项目身份不属于撤销内容。
export class StageEditHistory {
  constructor(limit = 60) { this.limit = limit; this.entries = []; this.cursor = -1; this.group = null; this.saved = ''; }
  reset(stage, selected = '') {
    const definition = validateStage(stage);
    this.entries = [{ stage: definition, selected }]; this.cursor = 0;
    this.saved = signature(definition); this.endGroup();
  }
  record(stage, selected = '', { group = null } = {}) {
    const definition = validateStage(stage), current = this.entries[this.cursor];
    if (current && signature(current.stage) === signature(definition)) return false;
    this.entries.splice(this.cursor + 1);
    const entry = { stage: definition, selected };
    if (group !== null && this.group === group && this.cursor > 0) this.entries[this.cursor] = entry;
    else { this.entries.push(entry); this.cursor++; }
    if (this.entries.length > this.limit + 1) { this.entries.shift(); this.cursor--; }
    this.group = group; return true;
  }
  select(id) {
    const current = this.entries[this.cursor];
    if (current?.stage.objects.some(object => object.id === id)) current.selected = id;
  }
  endGroup() { this.group = null; }
  markSaved(stage) { this.saved = signature(validateStage(stage)); this.endGroup(); }
  markUnsaved() { this.saved = ''; this.endGroup(); }
  isDirty(stage) { return signature(validateStage(stage)) !== this.saved; }
  get canUndo() { return this.cursor > 0; }
  get canRedo() { return this.cursor >= 0 && this.cursor < this.entries.length - 1; }
  undo() { if (!this.canUndo) return null; this.cursor--; this.endGroup(); return structuredClone(this.entries[this.cursor]); }
  redo() { if (!this.canRedo) return null; this.cursor++; this.endGroup(); return structuredClone(this.entries[this.cursor]); }
}
