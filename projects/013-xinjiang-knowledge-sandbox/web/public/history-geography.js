import * as THREE from 'three';
import {mapFeatures,densifyMapLine} from './map-learning-content.js';

// Existing observation coordinates only. These overlays identify geographic
// conditions; their width and small basin halo are display emphasis, not extents.
const feature=id=>mapFeatures.find(item=>item.id===id);
const tianshan=feature('tianshan'),tarim=feature('tarim'),ili=feature('ili-water');
const choices={
 zhang:[
  {source:tianshan,kind:'ridge',color:0xc8d4c9,title:'先辨天山，再对照山地南侧的盆地与往来地点。'},
  {source:tarim,kind:'basin',color:0xccb17c,title:'塔克拉玛干沙漠位于塔里木盆地内；聚落与交流要结合盆地边缘理解。'}
 ],
 protectorate:[
  {source:tianshan,kind:'ridge',color:0xc8d4c9,title:'天山提供南北方位参照；轮台地区位于这条概括山系线南侧。'},
  {source:tarim,kind:'basin',color:0xccb17c,title:'沿盆地北缘观察地方与机构的关系；此处不描绘古代辖区。'}
 ],
 xibe:[
  {source:ili,kind:'valley',color:0x8fbdab,title:'先认伊犁河谷，再把抵达、安置与后续生活放回地域条件中。'},
  {source:tianshan,kind:'ridge',color:0xc8d4c9,title:'天山与伊犁河谷共同建立方位；山系线不是西迁行程。'}
 ]
};

export function historyGeographyPlan(event){
 const id=typeof event==='string'?event:event?.id;
 return (choices[id==='migration'?'xibe':id]??[]).map(({source,kind,color,title})=>({
  id:source.id,name:source.name,kind,color,title,anchor:source.anchor,
  shape:source.shape??[],section:source.section,sourceId:source.id,
  scope:kind==='basin'?'盆地内部的定位强调，不表示实测范围':'已有概括地理观察线，不表示山脊测绘、河道或历史行程'
 }));
}

export function historyGeographyStrength(focus='background',context=false){
 const intensity=({background:1,process:.48,impact:.32})[focus]??1;
 return context?intensity*.42:intensity;
}

export function buildHistoryGeography({root,event,point,viewport,addMarker}){
 const layer=new THREE.Group();layer.name='history-geographic-context';root.add(layer);
 const plan=historyGeographyPlan(event),materials=[],labels=[],surfaceLift=.00065;
 const surface=(lon,lat)=>{const p=point(lon,lat).clone();return p.addScaledVector(p.clone().normalize(),surfaceLift);};
 const material=(color,opacity)=>{const m=new THREE.MeshBasicMaterial({color,transparent:true,opacity,depthWrite:false,depthTest:true,side:THREE.DoubleSide});materials.push({material:m,opacity});return m;};
 function strip(coords,width,color){
  const samples=densifyMapLine(coords,.055),positions=[],indices=[];
  for(let i=0;i<samples.length;i++){
   const a=samples[Math.max(0,i-1)],b=samples[Math.min(samples.length-1,i+1)],lat=samples[i][1],cos=Math.cos(lat*Math.PI/180);
   const dx=(b[0]-a[0])*cos,dy=b[1]-a[1],length=Math.hypot(dx,dy)||1;
   const normal=[-dy/length/Math.max(.2,cos)*width,dx/length*width];
   for(const side of [-1,1])positions.push(...surface(samples[i][0]+normal[0]*side,samples[i][1]+normal[1]*side).toArray());
   if(i){const j=i*2;indices.push(j-2,j-1,j,j-1,j+1,j);}
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(indices);
  const mesh=new THREE.Mesh(geometry,material(color,.12));mesh.renderOrder=1;layer.add(mesh);
  const lineMaterial=new THREE.LineBasicMaterial({color,transparent:true,opacity:.61,depthWrite:false,depthTest:true});materials.push({material:lineMaterial,opacity:.61});
  const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(samples.map(p=>surface(...p))),lineMaterial);line.renderOrder=1;layer.add(line);
 }
 function basin(item){
  // A deliberately small locator within the existing basin anchor/section.
  // No geological boundary is invented, and the Xinjiang outline is not repeated.
  const lonSpan=Math.max(...item.section.map(p=>Math.abs(p[0]-item.anchor[0]))),latSpan=Math.max(...item.section.map(p=>Math.abs(p[1]-item.anchor[1])));
  const rx=Math.min(1.7,lonSpan*.42),ry=Math.min(.85,latSpan*.36),rings=10,segments=72;
  for(let ring=0;ring<rings;ring++){
   const positions=[],indices=[],inner=ring/rings,outer=(ring+1)/rings;
   for(let i=0;i<=segments;i++){
    const angle=i/segments*Math.PI*2;
    for(const radius of [inner,outer])positions.push(...surface(item.anchor[0]+Math.cos(angle)*rx*radius,item.anchor[1]+Math.sin(angle)*ry*radius).toArray());
    if(i){const j=i*2;indices.push(j-2,j-1,j,j-1,j+1,j);}
   }
   const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(indices);
   const mesh=new THREE.Mesh(geometry,material(item.color,.10*(1-ring/rings)**1.5));mesh.renderOrder=1;layer.add(mesh);
  }
 }
 for(const item of plan){
  const firstMaterial=materials.length;
  if(item.kind==='basin')basin(item);else strip(item.shape,item.kind==='ridge'?.075:.055,item.color);
  for(const entry of materials.slice(firstMaterial))entry.feature=item.id;
  const marker=addMarker({id:'geography-'+item.id,name:item.name,role:'地理参照',title:item.title},surface(...item.anchor));
  if(marker){
   marker.visible=true;marker.priority=3;marker.title=item.title;marker.geography=true;
   if(marker.button){
    const button=marker.button;delete button.dataset.kgEventDestination;delete button.dataset.kgAction;
    button.dataset.historyGeography=item.id;button.classList.add('kg-geography-label');button.textContent=item.name;button.title=item.title;button.disabled=true;button.tabIndex=-1;button.setAttribute('aria-label',item.name+'：'+item.title);
    Object.assign(button.style,{background:'transparent',border:'none',boxShadow:'none',color:item.kind==='basin'?'#dacda8':'#c6dcd1',fontSize:'11px',fontWeight:'500',letterSpacing:'.12em',padding:'3px 5px',pointerEvents:'none',textShadow:'0 1px 4px #142420,0 0 8px #142420',opacity:'.78'});
   }
   labels.push(marker);
  }
 }
 if(viewport?.dataset)viewport.dataset.historyGeographyFeatures=plan.map(item=>item.id).join(',');
 function update(progress,{focus='background',context=false,attention=null}={}){
  const strength=historyGeographyStrength(focus,context);
  for(const entry of materials){const spoken=attention?.id===entry.feature;entry.material.opacity=Math.min(.92,entry.opacity*strength*(spoken?3.4:attention?.kind==='geography'?.35:1));}
  for(const marker of labels){marker.visible=!context||focus==='background';marker.priority=focus==='background'?3:5;if(marker.button)marker.button.style.opacity=String(context?.38:focus==='background'?.78:.50);}
  if(viewport?.dataset){viewport.dataset.historyGeographyFocus=focus;viewport.dataset.historyGeographyStrength=strength.toFixed(3);viewport.dataset.historyGeographyLabels=String(labels.filter(marker=>marker.visible).length);viewport.dataset.historyGeographyHighlight=plan.some(item=>item.id===attention?.id)?attention.id:'';}
  return {focus,strength,features:plan.map(item=>item.id),labels:labels.filter(marker=>marker.visible).length};
 }
 update(0);
 return {update};
}
