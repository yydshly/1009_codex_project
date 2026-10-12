const $=id=>document.getElementById(id);
const node=(tag,value,className)=>{const el=document.createElement(tag);if(value)el.textContent=value;if(className)el.className=className;return el;};
try{
  const response=await fetch('./assets/research/research-summary.json');
  if(!response.ok)throw new Error('研究摘要暂不可用');
  const summary=await response.json();
  for(const section of summary.sections){const card=node('article');card.append(node('h4',section.label),node('p',section.text));$('summary-cards').append(card);}
  for(const module of summary.modules){const row=node('tr');row.append(node('th',module.name),node('td',module.input),node('td',module.output),node('td',module.implementation));$('summary-module-rows').append(row);}
  for(const extension of summary.extensions){const card=node('article');card.append(node('h4',extension.name),node('p',extension.value),node('p','扩展条件：'+extension.condition,'research-note'));$('summary-extensions').append(card);}
  window.researchSummary=summary;
}catch(error){$('summary-cards').append(node('p',error.message,'media-error'));}
window.summaryReady=true;
