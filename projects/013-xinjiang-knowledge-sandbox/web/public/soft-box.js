import * as THREE from 'three';
// Shared shallow bevels give miniature architecture, furniture and props the
// same edge language without replacing them with rendered screenshot assets.
export function softBoxGeometry(){
 const r=.025,s=new THREE.Shape();
 s.moveTo(-.5+r,-.5);s.lineTo(.5-r,-.5);s.quadraticCurveTo(.5,-.5,.5,-.5+r);
 s.lineTo(.5,.5-r);s.quadraticCurveTo(.5,.5,.5-r,.5);s.lineTo(-.5+r,.5);
 s.quadraticCurveTo(-.5,.5,-.5,.5-r);s.lineTo(-.5,-.5+r);s.quadraticCurveTo(-.5,-.5,-.5+r,-.5);
 const g=new THREE.ExtrudeGeometry(s,{depth:.95,bevelEnabled:true,bevelSize:.015,bevelThickness:.025,bevelSegments:2,steps:1,curveSegments:3});g.translate(0,0,-.475);g.computeVertexNormals();return g;
}
