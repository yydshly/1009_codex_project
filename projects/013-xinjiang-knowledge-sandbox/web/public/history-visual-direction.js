import {historyEvents} from './history-content.js';
import {storyRange} from './story-observation.js';
import {narrationCueCuts,spatialAttention,narrativeMapProgress} from './history-spatial-cues.js';
import {eventFrame} from './history-process.js';

// Observation targets, not a reconstruction of an itinerary or historical view.
// A changed key requests one smooth camera transition in the host controller.
const radians = Math.PI / 180;
const shots = ['wide', 'medium', 'close'];
const shotCuts=(id,beat)=>narrationCueCuts[id==='migration'?'xibe':id]?.[beat]??[1/3,2/3];
export function visualObservationFraction(id,beat,index){
 const [a,b]=shotCuts(id,beat);return [a*.45,(a+b)*.5,(b+1)*.5][index]??0;
}
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
function finite(value, fallback) {
  try { const number = Number(value); return Number.isFinite(number) ? number : fallback; }
  catch { return fallback; }
}
const wrap = value => ((value % 360) + 360) % 360;
const norm = v => Math.hypot(...v);
const unit = v => { const length = norm(v); return v.map(n => n / length); };
const dot = (a, b) => a.reduce((sum, n, i) => sum + n * b[i], 0);
const cross = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
const sphere = (lon, lat, radius = 1) => {
  const longitude = Math.abs(lon) > 360 ? wrap(lon) : lon;
  // Preserve the sandbox's operation order for bit-identical radial results.
  const a = longitude * Math.PI / 180, b = lat * Math.PI / 180;
  return [radius*Math.cos(b)*Math.cos(a), radius*Math.sin(b), -radius*Math.cos(b)*Math.sin(a)];
};
function arc(a, b, fraction) {
  const cosine = clamp(dot(a, b), -1, 1), angle = Math.acos(cosine);
  if (angle < 1e-8) return [...a];
  if (Math.PI - angle < 1e-6) {
    const axis = Math.abs(a[1]) < .8 ? [0, 1, 0] : [1, 0, 0];
    const tangent = unit(cross(axis, a));
    return a.map((n, i) => n*Math.cos(Math.PI*fraction) + tangent[i]*Math.sin(Math.PI*fraction));
  }
  const denominator = Math.sin(angle);
  return unit(a.map((n, i) => (n*Math.sin((1-fraction)*angle) + b[i]*Math.sin(fraction*angle))/denominator));
}
function routePoint(route, fraction) {
  const vectors = route.map(([lon, lat]) => sphere(lon, lat));
  const lengths = vectors.slice(1).map((v, i) => Math.acos(clamp(dot(vectors[i], v), -1, 1)));
  const total = lengths.reduce((sum, value) => sum + value, 0);
  let remaining = total * fraction, index = 0;
  while (index < lengths.length - 1 && remaining > lengths[index]) remaining -= lengths[index++];
  const position = arc(vectors[index], vectors[index+1], lengths[index] > 1e-8 ? remaining/lengths[index] : 0);
  return [Math.atan2(-position[2], position[0])/radians, Math.asin(clamp(position[1], -1, 1))/radians];
}
function usableRoute(route, fallback) {
  if (!Array.isArray(route) || route.length < 2) return fallback;
  const valid = route.every(point => Array.isArray(point) && point.length >= 2 && typeof point[0] === 'number' && Number.isFinite(point[0]) && typeof point[1] === 'number' && Number.isFinite(point[1]) && Math.abs(point[1]) <= 90);
  return valid ? route.map(([lon, lat]) => [lon, lat]) : fallback;
}

/**
 * Convert a globe focus to the sandbox's +X/+Y/-Z coordinates.
 * distance is the old radial camera distance; tilt rotates the local offset
 * towards north (bearing 0) or east (bearing 90). Zero tilt is exactly radial.
 */
export function globeViewVectors(options = {}) {
  const input = options && typeof options === 'object' ? options : {};
  const lon = finite(input.lon, 84.6), lat = clamp(finite(input.lat, 41.8), -90, 90);
  const distance = Math.max(3.55, finite(input.distance, 5.45));
  const surface = clamp(finite(input.surface, 0), 0, 3.2);
  const tilt = clamp(finite(input.tilt, 0), 0, 42) * radians;
  const bearing = wrap(finite(input.bearing, 0)) * radians;
  const target = surface ? sphere(lon, lat, surface) : [0, 0, 0];
  if (!surface || !tilt) return {position:sphere(lon, lat, distance), target};
  const a=(Math.abs(lon)>360?wrap(lon):lon)*radians, b=lat*radians, normal=sphere(lon, lat);
  const north=[-Math.sin(b)*Math.cos(a), Math.cos(b), Math.sin(b)*Math.sin(a)];
  const east=[-Math.sin(a), 0, -Math.cos(a)];
  const offset=distance-surface;
  const position=target.map((n, i) => n+offset*(normal[i]*Math.cos(tilt)+(north[i]*Math.cos(bearing)+east[i]*Math.sin(bearing))*Math.sin(tilt)));
  // The admitted surface, distance and tilt ranges keep this above R=3.2.
  return {position, target};
}

const target = (lon, lat, distance, tilt, bearing) => ({lon, lat, distance, surface:3.12, tilt, bearing});
const view = (title, detail, pose, targetNode, inspect) => ({title, detail, pose, ...(targetNode ? {targetNode} : {}), inspect});

function chapters(id, route) {
  if (id === 'zhang') {
    const [a,b]=storyRange(id,1);
    const along = [0,1,2].map(i=>routePoint(route,eventFrame(id,narrativeMapProgress(id,a+(b-a)*visualObservationFraction(id,1,i))).route));
    return [
      [view('先看山地与盆地', '山地、盆地与荒漠是理解远行的空间背景。', target(84.6,41.8,5.6,8,160)),
       view('靠近盆地边缘', '沿着山地与盆地之间的空间，观察往来为何依托沿途绿洲。', target(84.4,39.8,4.4,24,170)),
       view('辨认东侧参照', '敦煌帮助辨认盆地东侧方向；接下来观察联系怎样展开。', target(94.66,40.14,3.95,36,200),'dunhuang')],
      [view('联系开始展开', '金线从东侧展开，商旅带着行装前进。沿途哪里能够停留和补给？', target(...along[0],5.15,12,170)),
       view('跟随沿线移动', '沿当前教学廊道观察移动符号，地势与联系保持在同一空间。', target(...along[1],4.35,26,185)),
       view('接近西侧联系', '从沿线推进转向地域间的联系，为下一幕的交流网络建立方位。', target(...along[2],3.9,36,210))],
      [view('由一条线看见网络', '青色联系扩展到多个地点；长期交流与一次出使分开理解。', target(82.5,41.15,5.3,10,165)),
       view('把交换放到喀什', '盆地西侧的交换符号，把区域联系引向具体需要。', target(76.4,39.5,4.35,28,185),'kashgar'),
       view('观察交换，再进入集市', '靠近喀什的交换符号；主动进入集市后，比较货物的接收者与用途。', target(75.99,39.47,3.85,38,205),'kashgar')]
    ];
  }
  if (id === 'protectorate') return [
    [view('地方空间先存在', '先看天山南侧与盆地北缘，辨认机构出现前的地方背景。', target(84.6,41.8,5.3,10,160)),
     view('山地之间的聚落', '灰色聚落留在地表，地方生活不以机构的出现为起点。', target(83.5,41.55,4.4,25,170)),
     view('先认地方聚落', '靠近灰色聚落符号，再观察下一幕机构与地方怎样同时出现。', target(80.6,40.5,3.95,37,200))],
    [view('机构进入同一空间', '机构符号逐步显现，周边聚落继续保留。', target(84.25,41.78,4.95,12,170),'luntai'),
     view('观察机构结构成形', '入口、围合与内部空间渐次显现，帮助提出空间组织的问题。', target(84.25,41.78,4.3,28,195),'luntai'),
       view('靠近入口与内部', '看门洞、围合与院落怎样连接外部和内部；下一层可以拆开观察。', target(84.25,41.78,3.82,38,215),'luntai')],
    [view('把机构放回地方联系', '青色联系从机构伸向地方，沿线出现往来的人与物。', target(84.25,41.78,5.15,10,165),'luntai'),
     view('观察往来与连接', '沿联系观察地方与机构，同时保留原有聚落。', target(85.7,41.95,4.35,28,190)),
     view('带着内外关系进入模型', '靠近轮台参照点，下一层可比较入口、通道与内部空间。', target(84.25,41.78,3.85,38,215),'luntai')]
  ];
  const migration = routePoint([[123.43,41.8],[81.32,43.92]], .65);
  return [
    [view('同一地球上的起讫', '盛京方向与伊犁同时出现，先理解远行尺度。', target(102,42,7.6,0,160),undefined,[123.43,41.8]),
     view('看见出发方向', '以今沈阳辨认盛京方向，起点保留在全球空间。', target(123.43,41.8,4.5,24,175),'shengjing'),
     view('辨认河谷方向', '把视线移向伊犁；下一幕将区分出发、抵达与安置。', target(81.32,43.92,3.95,35,200),'ili')],
    [view('远行联系逐步展开', '沿起讫方向观察家庭和行装移动，伊犁河谷是这一段远行的目的地。', target(102,42,7.4,8,165)),
     view('跟随远行的方向', '移动符号沿方向线推进，镜头保持这条联系的空间参照。', target(...migration,4.5,26,185)),
     view('抵达之后，还要安置', '先到伊犁，再关注察布查尔；抵达与安置发生在不同时间。', target(81.32,43.92,3.95,37,210),'ili')],
    [view('把安置放回河谷', '从河谷范围看察布查尔，住处与用水回到同一空间。', target(81.23,43.88,5.05,10,165),'qabqal'),
     view('住房先出现', '观察住处与田垄，再辨认后续建设带来的生活条件。', target(81.14,43.84,4.25,28,190),'qabqal'),
     view('住处、田地与后来的渠水', '靠近住房与渠水符号；下一层可主动比较安顿与用水的需要。', target(81.14,43.84,3.8,38,215),'qabqal')]
  ];
}

/** Reversible, stateless shot selection driven by the exact narration ranges. */
export function visualCue(id, progress, route = []) {
  if (id === 'migration') id = 'xibe';
  const event = historyEvents.find(item => item.id === id);
  if (!event) return null;
  const p = clamp(finite(progress, 0), 0, 1);
  const beat = p < storyRange(id,0)[1] ? 0 : p < storyRange(id,1)[1] ? 1 : 2;
  const [start,end] = storyRange(id,beat);
  const fraction = clamp((p-start)/(end-start), 0, 1);
  const [firstCut,secondCut]=shotCuts(id,beat),shotIndex=fraction<firstCut?0:fraction<secondCut?1:2;
  const selected = chapters(id, usableRoute(route,event.corridor))[beat][shotIndex];
  const {inspect,...cue} = selected;
  const attention=spatialAttention(id,beat,shotIndex);
  const routeAnchor=attention.kind==='route'?routePoint(id==='xibe'?[[123.43,41.8],[81.32,43.92]]:usableRoute(route,event.corridor),eventFrame(id,narrativeMapProgress(id,p)).route):null;
  const closeAnchor=routeAnchor??attention.anchor??inspect;
  return {...cue,attention,key:`${id}:${beat}:${shots[shotIndex]}`, beat, shot:shots[shotIndex], inspectPose:{...cue.pose,lon:closeAnchor?.[0]??cue.pose.lon,lat:closeAnchor?.[1]??cue.pose.lat,distance:3.6,tilt:40}};
}
