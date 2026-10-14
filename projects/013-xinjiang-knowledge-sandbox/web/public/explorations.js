const candidates={
  chosen:{src:'./assets/glacier-sentinel-20230831.jpg',date:'2023.08.31',year:'2023',label:'CURRENT OBSERVATION',title:'把岩壁与冰舌留在画面里。',copy:'这一景的局部雪冰类约 4.85%，自动云类为 0%。比起大面积季节积雪，裸岩、冰碛与冰雪的边缘更容易观察，因此用于当前纹理。',snow:'4.85%'},
  rejected:{src:'./assets/glacier-candidate-20240904.jpg',date:'2024.09.04',year:'2024',label:'ARCHIVED CANDIDATE',title:'积雪覆盖，把细节藏起来了。',copy:'这一景的局部雪冰类约 49.97%，自动云类为 0%。雪覆盖让大片山地变白，对观察裸岩与冰舌边缘不够理想。我们保留候选，采用另一景作为当前纹理。',snow:'49.97%'}
};
document.querySelectorAll('[data-candidate]').forEach(button=>button.addEventListener('click',()=>{
  const item=candidates[button.dataset.candidate],image=document.getElementById('candidate-image');
  image.src=item.src;image.alt=`${item.date} 的冰川真实候选影像，北向上`;
  for(const field of ['label','title','copy','snow'])document.getElementById(`candidate-${field}`).textContent=item[field];
  document.getElementById('candidate-credit').textContent=`Contains modified Copernicus Sentinel data ${item.year} · 北向上`;
  document.querySelectorAll('[data-candidate]').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));
}));
