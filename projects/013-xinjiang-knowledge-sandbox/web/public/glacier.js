// Local interpretation of measured terrain; teaching parameters have no physical units.
export const glacierBranches = [
  [[86.804,43.103],[86.808,43.109],[86.811,43.114]],
  [[86.820,43.096],[86.826,43.100],[86.829,43.105]],
];

export function focusGlacierDEM(source) {
  // Take existing samples exactly. No added resolution or invented elevations.
  const firstCol=55,lastCol=227,firstRow=108,lastRow=238;
  const [w,s,e,n]=source.bounds,dx=(e-w)/(source.cols-1),dy=(n-s)/(source.rows-1);
  const heights=[];
  for(let row=firstRow;row<=lastRow;row++)for(let col=firstCol;col<=lastCol;col++)heights.push(source.heights[row*source.cols+col]);
  return {...source,name:'glacier-focus',bounds:[w+firstCol*dx,n-lastRow*dy,w+lastCol*dx,n-firstRow*dy],cols:lastCol-firstCol+1,rows:lastRow-firstRow+1,heights,min:Math.min(...heights),max:Math.max(...heights),sourceWindow:[firstCol,firstRow,lastCol,lastRow]};
}

export function textureWindow(sourceBounds,bounds) {
  const [w,s,e,n]=sourceBounds,[cw,cs,ce,cn]=bounds;
  return {offset:[(cw-w)/(e-w),(cs-s)/(n-s)],repeat:[(ce-cw)/(e-w),(cn-cs)/(n-s)]};
}

export function budgetBalance(accumulation,ablation) { return Math.max(-1,Math.min(1,(accumulation-ablation)/100)); }
export function iceHalfWidth(along,phase=0) {return .75*(.38+.62*Math.pow(Math.sin(Math.PI*Math.max(0,Math.min(1,along+.08))),.45))*(1-phase*.36);}
export function experimentStep(phase,accumulation,ablation,seconds) {
  // Exaggerated display response to the sign of balance, not a glacier forecast.
  return Math.max(0,Math.min(100,phase-budgetBalance(accumulation,ablation)*seconds*14));
}
export function budgetCaption(accumulation,ablation) {
  const balance=budgetBalance(accumulation,ablation);
  return Math.abs(balance)<.015?'积累 ≈ 消融 · 示意冰体保持':balance>0?'积累 > 消融 · 示意冰体恢复':'消融 > 积累 · 示意冰体收缩';
}

export function glacierStationMarkup() {
  return `<div class="station-heading"><span>FIELD NOTES / 01</span><a href="./explorations.html">探索记录 ↗</a></div>
    <h3 id="station-title">冰谷观察站</h3>
    <div class="locator-map" id="glacier-locator"><svg viewBox="0 0 240 105" role="img" aria-label="新疆与天山定位示意，冰谷位于约86.817度东经、43.100度北纬"><path d="M18 67L32 41 64 29 80 10 125 13 144 5 177 30 213 34 227 57 191 79 155 88 96 83 47 97Z" fill="#263c43" stroke="#73939a" stroke-width="1"/><path d="M30 57Q110 64 201 44" fill="none" stroke="#92d5ce" stroke-width="4" opacity=".5"/><text x="75" y="48">天山 · 位置示意</text><circle cx="144" cy="44" r="12" fill="none" stroke="#e3c395" stroke-dasharray="2 3"/><circle cx="144" cy="44" r="3" fill="#ffe3b5"/><path d="M148 42L167 20" stroke="#e3c395"/><text x="158" y="15">冰谷</text></svg></div>
    <p id="station-copy">从天山的山地背景，进入一段可以观察的冰谷。</p>
    <div class="station-facts"><span>真实观测<b>2023.08.31</b></span><span>影像原始像元<b>10 m</b></span></div>
    <div id="budget-lab" hidden><p class="lab-label">改变条件 · 无量纲教学试验</p>
      <label>积累强度 <output id="accumulation-output">40</output><input id="accumulation-range" aria-label="积累强度" type="range" min="0" max="100" value="40"></label>
      <label>消融强度 <output id="ablation-output">80</output><input id="ablation-range" aria-label="消融强度" type="range" min="0" max="100" value="80"></label>
      <div class="budget-bars" aria-hidden="true"><i id="accumulation-bar"></i><i id="ablation-bar"></i></div>
      <p id="budget-caption" role="status"></p><div class="lab-actions"><button id="experiment-play" aria-pressed="false">▷ 运行试验</button><button id="experiment-reset">重置条件</button></div>
    </div><p class="station-boundary" id="station-boundary">真实影像 × 真实高程 · 视觉高度 1.25×</p>`;
}
