import test from 'node:test';
import assert from 'node:assert/strict';
import {worldMapEntry} from '../public/entry-policy.js';
test('the common world entry reads the region before any automatic history or place approach',()=>{
 for(const topic of ['position','neighbors','relief','coordinates','scale','connections'])assert.deepEqual(worldMapEntry(topic),{mode:'geography',lens:'relief',guide:false});
});
test('selected world questions retain their geographic lens without starting a historical path',()=>{
 assert.deepEqual(worldMapEntry('climate'),{mode:'geography',lens:'water',guide:false});
 assert.deepEqual(worldMapEntry('exchange'),{mode:'geography',lens:'corridors',guide:false});
});
