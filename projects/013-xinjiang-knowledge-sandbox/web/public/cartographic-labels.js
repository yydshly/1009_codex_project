// Scale is corrected for the extra camera altitude used by narrow canvases.
// A selected object is always eligible; macro labels get space before detail.
export function cartographicScale(distance,aspect=1){
 const normalized=3.2+(distance-3.2)/Math.max(1,.9/Math.max(.25,aspect));
 return normalized<7.8?'region':normalized<10?'continent':'planet';
}
export function atlasLabelPriority(item,{selected,scale}){
 if(item.id===selected)return 1300;
 if(item.id==='xinjiang')return 1200;
 if(item.kind==='continent')return scale==='region'?350:1100;
 if(item.kind==='ocean')return scale==='region'?300:1000;
 if(['mountain','basin','air','exchange','coordinate'].includes(item.kind))return 950;
 if(item.kind==='boundary-country')return item.id==='china'?900:['russia','india','kazakhstan','mongolia'].includes(item.id)?800:700-(item.rank??6)*10;
 return 500;
}
export function atlasLabelEligible(item,{selected,scale,topic,detail=false}){
 if(item.id===selected||item.id==='xinjiang')return true;
 // Eurasia is a continental-scale reading, Asia and Europe are the default.
 if(item.id==='eurasia')return topic==='scale'&&scale==='continent';
 if(item.kind==='continent'||item.kind==='ocean')return scale!=='region';
 if(item.kind==='subregion')return scale!=='planet';
 if(item.kind==='city')return scale==='region'||topic==='connections'||topic==='coordinates'||detail;
 if(item.kind==='boundary-country'&&scale==='planet'&&!detail)return ['china','russia','india','kazakhstan','mongolia'].includes(item.id)||item.rank<=2&&item.minLabel<2;
 return true;
}
export const scaleReading={planet:'地球全景 · 先辨大洲与海洋',continent:'大陆尺度 · 再辨国家与新疆',region:'新疆周边 · 对照山系、盆地与地点'};
