import { createElement, validateStage } from './stage-definition.js';
const labels = {'launch-deck':'发布会主台','launch-step':'前侧台阶','display-plinth':'右侧产品展台','product-slot':'产品内容插槽','main-screen':'宽幅发布主屏','left-pillar':'左侧立柱','right-pillar':'右侧立柱','rear-deck':'秀场后场台面','catwalk':'中央长走台','front-island':'前端圆台','front-content':'走台内容插槽','rear-screen':'秀场背屏','hall-floor':'展厅地台','left-panel':'展厅左屏','middle-panel':'展厅中屏','right-panel':'展厅右屏','studio-deck':'直播间地台','host-desk':'主播展示桌','product-podium':'商品圆台','host-slot':'主播站位','studio-wall':'直播背景屏','side-panel':'侧面商品屏','divider':'分区立柱'};
const label = id => labels[id] ?? (id.startsWith('left-seat-') ? '左侧座席 '+(+id.split('-').at(-1)+1) : id.startsWith('right-seat-') ? '右侧座席 '+(+id.split('-').at(-1)+1) : id.startsWith('display-island-') ? '独立展岛 '+(+id.split('-').at(-1)+1) : id.startsWith('exhibit-slot-') ? '展品插槽 '+(+id.split('-').at(-1)+1) : '');
const e = (type,id,changes) => ({...createElement(type,id),...changes,...(label(id) ? {name:label(id)} : {})});
const deck = (id,position,size,color,shape='rect') => e('platform',id,{name:'舞台台面',position,size,color,shape});
const screen = (id,position,size,rotationY=0) => e('screen',id,{name:'展示屏幕',position,size,rotationY,color:'#183e49'});
const slot = (id,position,size=[2,.15,2]) => e('slot',id,{name:'内容插槽',position,size,color:'#e8bd85'});
const pillar = (id,position,height=6) => e('truss',id,{name:'灯光立柱',position,size:[.3,height,.3],color:'#536f83'});
const lasers = (positions,rotations=[]) => positions.map((position,i)=>e('laser',`laser-${i+1}`,{name:`激光设备 ${i+1}`,position,size:[3.5,2.6,.1],rotationY:rotations[i]??0,aperture:[0,1-position[1],7],pointRate:7000+i*1500,intensity:1.2,beamIntensity:.45,program:['corners','light-flower','orbits','lab-mark'][i%4]}));
const stage = (name,theme,objects) => validateStage({kind:'ilda-virtual-stage',version:1,name,theme,objects});
const definitions = {
 'aurora-island': {"kind":"ilda-virtual-stage","version":1,"name":"极光环岛 · 四机双屏","theme":"gallery","objects":[{"id":"island-deck","type":"platform","name":"椭圆主舞台","color":"#21483e","position":[0,0.32,0],"size":[18,0.64,11],"rotationY":10,"shape":"round"},{"id":"content-podium","type":"platform","name":"左侧抬高内容台","color":"#725943","position":[-3,0.83,1.8],"size":[3.6,0.38,3.6],"rotationY":0,"shape":"round"},{"id":"screen-left","type":"screen","name":"左侧独立屏幕","color":"#173e43","position":[-5,3.6,-3.6],"size":[4.8,4.8,0.18],"rotationY":14},{"id":"screen-right","type":"screen","name":"右侧独立屏幕","color":"#173e43","position":[4.5,3.6,-4.1],"size":[4.8,4.8,0.18],"rotationY":-20},{"id":"island-content","type":"slot","name":"共用内容插槽","color":"#ebbd83","position":[-3,1.1,1.8],"size":[2.4,0.15,2.4],"rotationY":20},{"id":"pillar-left","type":"truss","name":"左侧灯光立柱","color":"#8eac9a","position":[-8.1,3.55,-2],"size":[0.35,5.8,0.35],"rotationY":0},{"id":"pillar-right","type":"truss","name":"右侧灯光立柱","color":"#8eac9a","position":[8.1,3.55,-2],"size":[0.35,5.8,0.35],"rotationY":0},{"id":"island-laser-1","type":"laser","name":"环岛激光 1","color":"#9ce9c0","position":[-6,4.3,-1],"size":[3.3,2.6,0.1],"rotationY":22,"program":"corners","aperture":[0.8,-3.15,6.8],"pointRate":6500,"intensity":1.35,"beamIntensity":0.5},{"id":"island-laser-2","type":"laser","name":"环岛激光 2","color":"#9ce9c0","position":[-1.9,6,-2],"size":[3.3,2.6,0.1],"rotationY":8,"program":"light-flower","aperture":[0.4,-4.85,7.8],"pointRate":8500,"intensity":1.35,"beamIntensity":0.5},{"id":"island-laser-3","type":"laser","name":"环岛激光 3","color":"#9ce9c0","position":[2.3,5.5,-2.5],"size":[3.3,2.6,0.1],"rotationY":-10,"program":"orbits","aperture":[-0.5,-4.35,7.5],"pointRate":10500,"intensity":1.35,"beamIntensity":0.5},{"id":"island-laser-4","type":"laser","name":"环岛激光 4","color":"#9ce9c0","position":[6.4,4,-1],"size":[3.3,2.6,0.1],"rotationY":-26,"program":"lab-mark","aperture":[-1,-2.85,6.8],"pointRate":12500,"intensity":1.35,"beamIntensity":0.5}]},
 'grand-launch': stage('镜幕发布厅','gallery',[
  deck('launch-deck',[0,.3,0],[18,.6,9],'#253a50'),
  deck('launch-step',[0,.12,5.3],[12,.24,1.5],'#40586a'),
  deck('display-plinth',[3,1,1.5],[3.2,.8,3.2],'#69594a','round'),
  slot('product-slot',[3,1.5,1.5],[2.2,.15,2.2]),
  screen('main-screen',[0,4,-3.8],[15,6,.2]),
  pillar('left-pillar',[-8,4,-3.8],7.5),pillar('right-pillar',[8,4,-3.8],7.5),
  ...lasers([[-5,6.8,-3],[5,6.8,-3]])]),
 'runway': stage('星轨 T 型秀场','midnight',[
  deck('rear-deck',[0,.35,-3],[16,.7,4],'#362343'),
  deck('catwalk',[0,.35,2],[3.6,.7,9],'#523b63'),
  deck('front-island',[0,.35,6.8],[6,.7,4],'#71595f','round'),
  slot('front-content',[0,.8,6.8],[2.5,.15,2.5]),
  screen('rear-screen',[0,4.2,-4.8],[10,6,.2]),
  ...[-6,-3,0,3,6].map((z,i)=>deck(`left-seat-${i}`,[-5,.3,z],[3,.6,1.2],'#202b40')),
  ...[-6,-3,0,3,6].map((z,i)=>deck(`right-seat-${i}`,[5,.3,z],[3,.6,1.2],'#202b40')),
  ...lasers([[-6,5,-3],[0,6.5,-3],[6,5,-3]],[15,0,-15])]),
 'exhibition': stage('三岛环绕展厅','gallery',[
  deck('hall-floor',[0,.15,0],[20,.3,12],'#213c3c'),
  ...[-6,0,6].map((x,i)=>deck(`display-island-${i}`,[x,.8,i===1?1.5:0],[4,.9,4],'#66553e','round')),
  ...[-6,0,6].map((x,i)=>slot(`exhibit-slot-${i}`,[x,1.4,i===1?1.5:0])),
  screen('left-panel',[-6,3.5,-3],[4,4,.2],18),screen('middle-panel',[0,3.5,-2],[4,4,.2]),screen('right-panel',[6,3.5,-3],[4,4,.2],-18),
  ...lasers([[-6,5.8,-2],[6,5.8,-2]],[20,-20])]),
 'studio': stage('双区直播间','midnight',[
  deck('studio-deck',[0,.3,0],[13,.6,8],'#243a51'),
  deck('host-desk',[-3,1.15,1],[4,1.1,1.4],'#64727d'),
  deck('product-podium',[3,.95,1.5],[2.8,1.3,2.8],'#675545','round'),
  slot('product-slot',[3,1.7,1.5]),slot('host-slot',[-3,.7,-.5]),
  screen('studio-wall',[-2.5,3.3,-3],[7,4.6,.2]),screen('side-panel',[4.5,3.3,-2],[3,4.6,.2],-30),
  pillar('divider',[1.2,3,-2],5.4),
  ...lasers([[-4.5,5,-2],[4.5,5,-1]],[10,-20])])
};
export const STAGE_TEMPLATES = [
 {id:'aurora-island',tag:'01 / ISLAND',name:'极光环岛',description:'椭圆主台 · 偏置内容台 · 四机双屏',color:'#8fd4bd'},
 {id:'grand-launch',tag:'02 / LAUNCH',name:'镜幕发布厅',description:'宽幅背屏 · 双层台阶 · 右侧展台',color:'#a3c7ea'},
 {id:'runway',tag:'03 / RUNWAY',name:'星轨 T 型秀场',description:'长走台 · 前端圆台 · 两侧座席',color:'#c3abe3'},
 {id:'exhibition',tag:'04 / GALLERY',name:'三岛环绕展厅',description:'三个展岛 · 三面独立屏幕 · 多插槽',color:'#d5bb91'},
 {id:'studio',tag:'05 / STUDIO',name:'双区直播间',description:'主播桌 · 商品圆台 · 双区屏幕',color:'#96bed7'}
];
export function createTemplateStage(id) {
 if (!Object.hasOwn(definitions,id)) throw new Error('未知舞台模板');
 return validateStage(structuredClone(definitions[id]));
}
