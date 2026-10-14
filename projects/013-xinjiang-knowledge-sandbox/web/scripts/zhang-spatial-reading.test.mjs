import test from 'node:test';
import assert from 'node:assert/strict';
import {zhangReading,zhangSpaceFrame,directorLocation} from '../public/zhang-spatial-reading.js';

test('muted market guidance follows the actual recipient rather than the narration clock',()=>{
 const s={model:'market',goods:0};
 assert.equal(zhangReading(s,1,{}).index,0);
 assert.equal(zhangReading(s,1,{goods:'1',deliveryCount:'3',marketUse:'traveller-departs'}).index,0);
 assert.equal(zhangReading(s,0,{goods:'0',deliveryCount:'1',marketUse:'receiving'}).index,1);
 assert.equal(zhangReading(s,0,{goods:'0',deliveryCount:'1',marketUse:'family-continues'}).index,2);
 for(const [goods,response]of ['family-continues','traveller-departs','craft-work-continues'].entries())assert.equal(zhangReading({model:'market',goods},0,{goods:String(goods),deliveryCount:'1',marketUse:response}).index,2);
});
test('locator follows the spoken history node and returns to the actual model place',()=>{
 assert.equal(directorLocation({beat:1},{historySelectedNode:'dunhuang'},'kashgar'),'dunhuang');
 assert.equal(directorLocation({beat:2},{historySelectedNode:'turpan'},'kashgar'),'turpan');
 assert.equal(directorLocation({model:'market'},{historySelectedNode:'turpan'},'kashgar'),'kashgar');
 assert.equal(directorLocation({id:'return'},{historySelectedNode:'turpan'},'kashgar'),'kashgar');
});
test('geography reveals conditions before history and keeps them as context',()=>{
 assert.deepEqual(zhangSpaceFrame({world:'position'}),{mountains:0,basin:0,water:0,oases:0});
 const initial=zhangSpaceFrame({geography:0},0),later=zhangSpaceFrame({geography:1},1),history=zhangSpaceFrame({beat:1},.5);
 assert.equal(initial.mountains,1);assert.equal(initial.water,0);assert.equal(initial.oases,0);
 assert(later.water>0&&later.oases===1);assert(history.mountains>0&&history.oases===1);
 assert.deepEqual([0,1,2].map(beat=>zhangReading({beat}).look),[
  '先看出发目的，再辨认远行面临的地理条件。','金线逐步连起地域；移动符号表达往来。','青色支线形成网络；焦点转到喀什的交换需要。']);
});
