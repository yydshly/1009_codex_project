import * as THREE from 'three';
// Scene-local stock-to-recipient links, never historical roads.
export function decorateMarketLinkage(parent){
 const root=new THREE.Group();root.name='market-needs-and-use';parent.add(root);
 const material=new THREE.MeshBasicMaterial({color:0xe4c98a,transparent:true,opacity:.75,depthWrite:false});
 const rings=[0,1,2].map(()=>{const ring=new THREE.Mesh(new THREE.TorusGeometry(.46,.014,6,48),material.clone());ring.rotation.x=-Math.PI/2;root.add(ring);return ring;});
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(15),3));
 const path=new THREE.Line(geometry,new THREE.LineBasicMaterial({color:0xe4c98a,transparent:true,opacity:.75}));root.add(path);root.visible=false;
 return {root,rings,path};
}
export function updateMarketLinkage(visual,d,enabled,selected){
 visual.root.visible=enabled;if(!enabled)return;
 const good=Number(d.goods),positions=JSON.parse(d.marketActors||'[]'),received=Number(d.deliveryCount)>0&&d.marketUse!=='waiting-for-choice',done=['family-continues','traveller-departs','craft-work-continues'][good]===d.marketUse;
 visual.rings.forEach((ring,i)=>{const p=positions[i]??[[-3.6,0,.7],[-.3,0,.7],[3.45,0,.7]][i];ring.position.set(p[0],.06,p[2]);ring.material.color.setHex(selected&&i===good?(done?0x8bd7b7:0xe4c98a):0x7b9082);ring.material.opacity=selected&&i===good?.85:.20;});
 visual.path.visible=selected;if(!selected)return;
 const destination=[-3.7,0,3.7][good],carrier=JSON.parse(d.marketCarrier||'[-5.3,0,0.35]'),recipient=positions[good]??[destination,0,.7];
 const points=[[-5.3,.065,.35],[received?destination:carrier[0],.065,received?-.04:carrier[2]],[destination,.065,-.04],[recipient[0],.065,.7],[recipient[0],.065,recipient[2]]];
 const attr=visual.path.geometry.attributes.position;points.forEach((p,i)=>attr.setXYZ(i,...p));attr.needsUpdate=true;visual.path.geometry.setDrawRange(0,received?5:2);visual.path.geometry.computeBoundingSphere();visual.path.material.color.setHex(done?0x8bd7b7:0xe4c98a);
}
