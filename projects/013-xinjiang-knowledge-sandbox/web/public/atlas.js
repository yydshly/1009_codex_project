// All thumbnails are actual local scene captures. Coordinates locate the case;
// human environments are original narrative sets, not surveyed street models.
export const atlasScenes=[
 {id:'ice',group:'nature',name:'冰谷与来水',line:'从真实山地，找到水的起点',image:'./assets/atlas-r15-ice.jpg',cue:'region-ice',lon:86.82,lat:43.1,place:'天山一号冰川',type:'真实影像'},
 {id:'water',group:'life',name:'绿洲的第一道水',line:'动一次水闸，看生活如何回应',image:'./assets/atlas-r15-water.jpg',cue:'water-ice',lon:89.19,lat:42.95,place:'吐鲁番 · 水路',type:'原创场景'},
 {id:'market',group:'life',name:'道路与集市',line:'把货物送到需要的人手里',image:'./assets/atlas-r15-market.jpg',cue:'exchange-stops',lon:75.99,lat:39.47,place:'喀什 · 交流主题',type:'原创场景'},
 {id:'family',group:'memory',name:'远行与家庭',line:'打开行装，看生活与记忆',image:'./assets/atlas-r15-family.jpg',cue:'memory-journey',lon:81.31,lat:43.91,place:'伊犁 · 西迁案例',type:'历史案例'},
 {id:'culture',group:'memory',name:'庭院里的传习',line:'示范之后，让下一位接上',image:'./assets/atlas-r15-culture.jpg',cue:'memory-muqam',lon:93.51,lat:42.82,place:'哈密 · 木卡姆资料',type:'文化案例'},
 {id:'gate',group:'modern',name:'当代关口',line:'听见三种需求，再安排空间',image:'./assets/atlas-r15-gate.jpg',cue:'modern-kashgar',lon:80.42,lat:44.2,place:'霍尔果斯 · 协作主题',type:'当代主题'},
];
export function installAtlas({onEnter,onHome,onStart,onFilm,onGroup,onRegion}){
 const cards=document.getElementById('atlas-scenes'),pins=document.getElementById('atlas-pins'),filters=document.getElementById('atlas-filters');
 let selected='all';
 const pinButtons=[];
 for(const item of atlasScenes){
  const b=document.createElement('button');b.className='atlas-card';b.dataset.atlasScene=item.id;b.dataset.group=item.group;
  const img=document.createElement('img');img.src=item.image;img.alt='';img.loading='eager';
  const copy=document.createElement('span');copy.innerHTML=`<small>${item.type}</small><b>${item.name}</b><span>${item.line}</span>`;b.append(img,copy);b.setAttribute('aria-label','进入场景：'+item.name);
  b.addEventListener('click',()=>onEnter(item));cards.append(b);
  const pin=document.createElement('button');pin.className='atlas-pin';pin.dataset.group=item.group;pin.innerHTML=`<span>${item.place}</span><small>${item.type}</small>`;pin.setAttribute('aria-label','地图入口：'+item.place);pin.addEventListener('click',()=>onEnter(item));pins.append(pin);pinButtons.push({item,button:pin});
 }
 function filter(group){selected=group;filters.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.atlasGroup===group)));cards.querySelectorAll('button').forEach(b=>b.hidden=group!=='all'&&b.dataset.group!==group);onGroup(group);}
 filters.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>filter(b.dataset.atlasGroup)));
 document.getElementById('demo-start').addEventListener('click',onStart);
 document.getElementById('atlas-film').addEventListener('click',onFilm);
 document.getElementById('atlas-home').addEventListener('click',onHome);document.getElementById('atlas-region').addEventListener('click',onRegion);
 const brand=document.querySelector('.demo-brand');brand.addEventListener('click',e=>{e.preventDefault();onHome();});
 return {pinButtons,get group(){return selected;},reset(){filter('all');},setReady(ready){document.getElementById('demo-start').disabled=!ready;document.getElementById('atlas-film').disabled=!ready;cards.querySelectorAll('button').forEach(b=>b.disabled=!ready);},updateImage(id,path){cards.querySelector(`[data-atlas-scene="${id}"] img`).src=path;}};
}
