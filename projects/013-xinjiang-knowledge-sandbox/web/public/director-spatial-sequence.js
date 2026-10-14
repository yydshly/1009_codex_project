// Geography establishes the setting. Historical lines and models appear only
// after the event begins, rather than previewing its outcome in the opening.
export const directorOpening = [
 {id:'earth',label:'大陆方位',world:'position',anchor:'xinjiang',title:'先在地球上，找到欧亚大陆',where:'全球 → 亚洲 → 中国西北',why:'先辨亚洲、欧洲与海洋。新疆的金色范围位于欧亚大陆内部；下一步靠近中国，确认它的相对位置。',next:'靠近中国与周边，再辨认新疆。',duration:8,caption:'先看大陆与海洋。金色范围标出新疆；此时建立方位，还没有展开历史路线。',pose:{lon:78,lat:30,distance:11.5,surface:0}},
 {id:'china',label:'中国与周边',world:'neighbors',anchor:'china',title:'从中国与周边，辨认西北位置',where:'亚洲 → 中国 → 新疆及邻近国家',why:'中国范围成为当前参照。新疆在中国西北，邻近国家帮助判断它在大陆上的位置；接下来重新突出新疆。',next:'把视线从国家范围，移到新疆的山地与盆地。',duration:7,caption:'当前突出中国范围。对照新疆与周边国家的位置，再进入新疆的自然地理。',pose:{lon:94,lat:36,distance:8.8,surface:1.8}},
 {id:'landforms',label:'新疆范围',world:'relief',anchor:'xinjiang',title:'新疆仍在同一个地球上',where:'中国西北 → 新疆范围 → 山地与盆地',why:'新疆重新成为当前范围。山系与盆地开始显现；沿这个球面继续靠近，读清具体地点的环境。',next:'先在新疆地图认识地理条件，再提出历史问题。',duration:7,caption:'重新突出新疆范围，山系与盆地留在原位。接下来靠近区域地图，先看环境，再看历史变化。',pose:{lon:84,lat:42,distance:7.3,surface:2.6}}
];

const geographicCues = {
 zhang:[
  {feature:'tianshan',title:'山地与盆地',text:'天山在北，塔里木盆地在南，昆仑山在更南侧。先建立山地与盆地的相对位置。'},
  {feature:'tarim',title:'绿洲位于盆地边缘',text:'突出塔里木盆地，对照东侧的吐鲁番与西缘的喀什。地点的位置还没有变成历史路线。'},
  {feature:'all',title:'带着地理问题，进入历史',text:'这些地点处在怎样的往来环境里？接下来从张骞出使的外交目的开始，再分开理解后续往来与长期交流。'}],
 protectorate:[
  {feature:'tianshan',title:'先找天山南侧',text:'天山与塔里木盆地同时保留，先看机构故事发生的地理背景。此时还没有出现机构或联络线。'},
  {feature:'tarim',title:'轮台在盆地北缘方向',text:'突出塔里木盆地，找到轮台地区参照。现代轮台帮助定位，不等于乌垒遗址的准确坐标。'},
  {feature:'all',title:'地方已有生活，新机构如何加入？',text:'先认清轮台与周边地方。接下来观察设立之前、机构出现和联系展开，建筑与路线将随历史阶段变化。'}],
 xibe:[
  {feature:'tianshan',title:'从天山转向新疆西部',text:'先在新疆整体范围中找到天山，再把目光移向西部的伊犁河谷。此时未展开西迁路线或安置模型。'},
  {feature:'ili-water',title:'辨认伊犁与察布查尔',text:'突出伊犁河谷，同时对照伊犁与察布查尔的位置。地理位置与历史上的抵达、安置需要分别理解。'},
  {feature:'all',title:'谁来到这里，又怎样安顿？',text:'河谷提供观察生活条件的背景。接下来从1764年调遣开始，分开看1765年抵达、1766年安置和后续建设。'}]
};
export function directorGeographyCue(id,progress=0){
 const p=Math.max(0,Math.min(1,Number(progress)||0));
 const index=Math.min(2,Math.floor(p*3));
 return {...(geographicCues[id]??geographicCues.zhang)[index],index,progress:p};
}
export function directorStage(shot){
 if(shot.journey)return 'history';
 if(shot.world)return 'world';
 if(shot.geography!==undefined||shot.natureRegion||shot.id==='regional')return 'map';
 if(shot.beat!==undefined)return 'history';
 if(shot.id==='return')return 'return';
 return 'model';
}
export const directorStages=[['world','地球方位'],['map','新疆地理'],['history','历史变化'],['model','地点与操作'],['return','回看联系']];

// Shared opening recordings are referenced once by all three directors.
export const directorOpeningSpeech={
 earth:'先看地球上的大陆与海洋。亚洲位于这边，欧洲在它的西侧，非洲在西南方向。新疆位于欧亚大陆内部。接下来，沿同一个地球靠近中国。',
 china:'现在，中国的范围被金色轮廓标出。新疆在中国西北。对照蒙古国、哈萨克斯坦等周边国家，我们就能理解它在大陆上的位置。下一步，把视线转回新疆。',
 landforms:'镜头继续靠近，新疆的范围重新亮起。先看横贯中部的天山，再对照北侧的准噶尔盆地和南侧的塔里木盆地。下面，我们留在这片地表，读清故事发生的环境。'
};
const openingTargets={earth:['asia','europe','africa'],china:['china','xinjiang','mongolia','kazakhstan'],landforms:['xinjiang','tianshan','junggar','tarim']};
for(const shot of directorOpening){shot.speech=directorOpeningSpeech[shot.id];shot.audio={event:'opening',beat:shot.id};shot.targets=openingTargets[shot.id];shot.duration=18;}
const geographicTargets={
 zhang:[['tianshan','tarim','kunlun'],['tarim','turpan','kashgar'],['kashgar']],
 protectorate:[['tianshan','tarim'],['tarim','luntai'],['luntai']],
 xibe:[['tianshan'],['ili-water','ili','qabqal'],['qabqal']]
};
export function directorGeographyShots(id){
 return [0,1,2].map(index=>{
  const cue=directorGeographyCue(id,(index+.1)/3);
  const shotId=['regional','region-places','region-question'][index];
  return {id:shotId,label:['读地形','找地点','进入历史'][index],title:cue.title,geography:index,
   feature:cue.feature,targets:geographicTargets[id][index],speech:cue.text,audio:{event:id,beat:shotId},
   where:cue.title,why:cue.text,next:index<2?['在同一地表上寻找故事相关的地点。','保留这些地理参照，提出历史问题。'][index]:'从历史背景开始，连续观察过程与影响。',duration:18,caption:cue.text};
 });
}
