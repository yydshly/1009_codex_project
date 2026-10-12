import { validateStage, loadStage } from './stage-definition.js';
import { STAGE_TEMPLATES, createTemplateStage } from './stage-templates.js';

export const STAGE_LIBRARY_KEY = 'three-ilda:stage-projects:v1';
export const MAX_PROJECTS = 64;
const validId = id => typeof id === 'string' && /^[a-zA-Z0-9_-]{1,80}$/.test(id);
const templateExists = id => STAGE_TEMPLATES.some(template => template.id === id);

function validateLibrary(input) {
  if (input?.kind !== 'ilda-stage-library' || input.version !== 1 || !Array.isArray(input.projects) || input.projects.length > MAX_PROJECTS) throw new Error('方案库格式无效');
  const ids = new Set();
  const projects = input.projects.map(project => {
    if (!validId(project.id) || ids.has(project.id)) throw new Error('项目 ID 无效或重复');
    ids.add(project.id);
    if (!Number.isSafeInteger(project.revision) || project.revision < 1 || !Number.isSafeInteger(project.updatedAt) || project.updatedAt < 0) throw new Error('项目版本无效');
    if (project.templateId !== null && !templateExists(project.templateId)) throw new Error('项目模板来源无效');
    return { id: project.id, revision: project.revision, updatedAt: project.updatedAt, templateId: project.templateId, stage: validateStage(project.stage) };
  });
  const library = { kind: input.kind, version: 1, active: input.active, projects };
  resolveReference(library, input.active); return library;
}
export function readStageLibrary(storage) {
  const raw = storage.getItem(STAGE_LIBRARY_KEY);
  if (raw !== null) return validateLibrary(JSON.parse(raw));
  // 老版本只有一套布置，迁移成独立项目；原保存键不删除或覆盖。
  const legacy = loadStage(storage), projects = legacy.saved ? [{ id: 'project-legacy', revision: 1, updatedAt: 0, templateId: null, stage: legacy.stage }] : [];
  return { kind: 'ilda-stage-library', version: 1, active: projects.length ? 'project:project-legacy' : 'template:aurora-island', projects };
}
export function resolveReference(library, ref) {
  if (typeof ref !== 'string') throw new Error('未选择舞台');
  const [type, id, extra] = ref.split(':');
  if (extra !== undefined || !validId(id)) throw new Error('舞台引用无效');
  if (type === 'template' && templateExists(id)) return { ref, projectId: '', templateId: id, revision: 0, stage: createTemplateStage(id), label: `模板 · ${createTemplateStage(id).name}` };
  const project = type === 'project' && library.projects.find(project => project.id === id);
  if (!project) throw new Error('舞台项目不存在');
  return { ref, projectId: id, templateId: project.templateId, revision: project.revision, stage: validateStage(project.stage), label: `项目 · ${project.stage.name} · v${project.revision}` };
}
export function readStageSelection(storage) {
  try { const library = readStageLibrary(storage); return { ...resolveReference(library, library.active), warning: '' }; }
  catch (error) {
    return { ref: 'template:aurora-island', projectId: '', templateId: 'aurora-island', revision: 0, stage: createTemplateStage('aurora-island'), label: '模板 · 极光环岛', warning: `方案库无法读取，暂用环岛模板：${error.message}` };
  }
}
export function selectStageReference(storage, ref) {
  const library = readStageLibrary(storage), selection = resolveReference(library, ref);
  storage.setItem(STAGE_LIBRARY_KEY, JSON.stringify({ ...library, active: ref }));
  return selection;
}
export function saveStageProject(storage, definition, { projectId = '', templateId = null, expectedRevision, id = `project-${crypto.randomUUID()}`, now = Date.now() } = {}) {
  const library = readStageLibrary(storage), stage = validateStage(definition);
  let project;
  if (projectId) {
    const previous = library.projects.find(item => item.id === projectId);
    if (!previous) throw new Error('项目不存在，请另存为新项目');
    if (expectedRevision !== undefined && previous.revision !== expectedRevision) throw new Error(`项目已更新到 v${previous.revision}，当前编辑基于 v${expectedRevision}。请读取最新版本，或另存为新项目保留当前修改。`);
    project = { ...previous, stage, revision: previous.revision + 1, updatedAt: now };
    library.projects = library.projects.map(item => item.id === projectId ? project : item);
  } else {
    if (library.projects.length >= MAX_PROJECTS) throw new Error(`最多保存 ${MAX_PROJECTS} 个项目，请导出配置备份`);
    const name = stage.name; let suffix = 2;
    while (library.projects.some(item => item.stage.name === stage.name)) stage.name = `${name.slice(0, 65)} · 副本 ${suffix++}`;
    project = { id, stage, revision: 1, updatedAt: now, templateId };
    library.projects.push(project);
  }
  library.active = `project:${project.id}`;
  const validated = validateLibrary(library);
  storage.setItem(STAGE_LIBRARY_KEY, JSON.stringify(validated));
  return resolveReference(validated, validated.active);
}
