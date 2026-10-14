// Visitor choices connect questions across separate cases. They do not cause
// historical events, move an actual object between communities, or measure water.
export const atlasPlaces=[
 {id:'ice',name:'一号冰川',region:'天山',lon:86.817,lat:43.10,cue:'water-mountains',stage:null,era:'同一天的观测影像',question:'水与山地',source:'glacier'},
 {id:'water',name:'吐鲁番',region:'绿洲与水路',lon:89.19,lat:42.95,cue:'water-ice',stage:'oasis',era:'原创生活情境',question:'工程与生产',source:'karez'},
 {id:'market',name:'喀什',region:'盆地西缘',lon:75.99,lat:39.47,cue:'exchange-goods',stage:'market',era:'跨时期交流主题',question:'交换与需要',source:'silk'},
 {id:'family',name:'察布查尔',region:'伊犁谷地',lon:81.15,lat:43.84,cue:'memory-arrival',stage:'people',era:'1764—1765 西迁案例',question:'生活与记忆',source:'xibe'},
 {id:'culture',name:'哈密',region:'区域文化案例',lon:93.51,lat:42.82,cue:'memory-practice',stage:'culture',era:'另一个社区的传习',question:'文化与接续',source:'muqam'},
 {id:'gate',name:'霍尔果斯',region:'伊犁谷地关口',lon:80.42,lat:44.21,cue:'modern-limit',stage:'logistics',era:'2023 方案主题',question:'通行与公共协作',source:'policy'},
];
export function placeFor(c){
 if(c.scale==='planet'||c.scale==='continent'||c.lon>100)return null;
 return atlasPlaces.find(p=>Math.hypot(p.lon-c.lon,p.lat-c.lat)<.35)??null;
}
export function choiceLabel(stage,v){
 if(!v)return '';
 if(stage==='oasis')return v.plan==='field'?'先到田里':'先到家里';
 if(stage==='market')return ['织物送到家人','补给送到远行者','器物送到手艺人'][v.goods]??'观察交换';
 if(stage==='people')return v.memory==='tools'?'交接工具与劳作':'交接家书与记忆';
 if(stage==='culture')return v.choice==='listen'?'观察之后再接上':v.choice==='join'?'主动接上一拍':'参与社区传习';
 return ({balanced:'轮换通行与缓冲',freight:'先回应货运',habitat:'先保留连续绿带'})[v.plan]??'观察空间安排';
}
export function carryFor(stage,ledger={}){
 if(stage==='market'&&ledger.oasis){
  const field=ledger.oasis.plan==='field';
  return {from:'oasis',label:choiceLabel('oasis',ledger.oasis),title:'把用水之后的需要，带到集市',text:field?'你先关注了生产。到喀什，先观察远行者如何接到补给，再决定把哪一批货物送出去。':'你先关注了家庭。到喀什，先观察织物如何进入家人的生活，再决定把哪一批货物送出去。',default:field?'supplies':'cloth',scope:'沿用你的观察问题；两个地点不共用一条实测水系。'};
 }
 if(stage==='people'&&ledger.market){
  const home=ledger.market.goods===0;
  return {from:'market',label:choiceLabel('market',ledger.market),title:'从物品的用途，追问远行后的生活',text:home?'在集市，你看过家人的照应。转到有明确年代的西迁案例，先关注家庭如何安顿。':'在集市，你看过物品被使用。转到有明确年代的西迁案例，先关注引水、工具与劳作。',default:home?'home':'water',scope:'比较不同移动背景；集市选择不会改变历史事件。'};
 }
 if(stage==='culture'&&ledger.people){
  const tools=ledger.people.memory==='tools';
  return {from:'people',label:choiceLabel('people',ledger.people),title:'从代际交接，继续看社区如何传习',text:tools?'你关注了双手之间的工具交接。在另一个社区的庭院，先让学习者尝试接上一拍。':'你关注了家书与讲述。在另一个社区的庭院，先留出观察和倾听的时间。',default:tools?'join':'listen',scope:'锡伯西迁记忆与维吾尔木卡姆为不同社区案例。'};
 }
 if(stage==='logistics'&&(ledger.culture||ledger.people||ledger.market)){
  const from=ledger.culture?'culture':ledger.people?'people':'market';
  const observations=[ledger.market?'集市中，物品要送到需要的人手里':null,ledger.people?'家庭里，劳作与照护要安排先后':null,ledger.culture?(ledger.culture.choice==='listen'?'庭院里，先留出观察时间，学习者才接上':'庭院里，学习者参与之后，同伴回听并回应'):null].filter(Boolean);
  return {from,label:choiceLabel(from,ledger[from]),title:'把参与和回应的问题，带到公共空间',text:observations.join('；')+'。现在听居民、货运人员与维护者说出各自的需要。轮换通行只是一种可比较的安排，仍由你选择。',default:'balanced',observations,scope:'带入观察问题，比较独立案例；文化选择不决定政策，也不代表真实成效。'};
 }
 return null;
}
export function itineraryFrame(c,ledger={},visited=[]){
 const place=placeFor(c),records=atlasPlaces.filter(p=>p.stage&&ledger[p.stage]).map(p=>({...p,label:choiceLabel(p.stage,ledger[p.stage]),manual:ledger[p.stage].manual===true}));
 return {place,records,visited:[...visited],carry:carryFor(place?.stage,ledger),scope:'地点组织问题；旅行连线表示浏览顺序，不是历史道路或实测水系。'};
}
