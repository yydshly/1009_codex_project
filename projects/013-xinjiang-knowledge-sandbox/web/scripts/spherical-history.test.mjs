import assert from 'node:assert/strict';
import {eventById} from '../public/history-content.js';
import {sphericalRoute,sphericalEventPlan,sphericalEventPose,sphericalVisualState} from '../public/spherical-history-data.js';
import {globePosition} from '../public/world-content.js';
for(const id of ['zhang','protectorate','xibe']){
 const plan=sphericalEventPlan(eventById(id));
 const coordinates=sphericalRoute(plan.route);
 for(const p of coordinates)assert(Math.abs(Math.hypot(...globePosition(...p,3.2))-3.2)<1e-10,'route stays on a sphere, not a chord through Earth');
 if(plan.route.length){for(const axis of [0,1]){assert(Math.abs(coordinates[0][axis]-plan.route[0][axis])<1e-9);assert(Math.abs(coordinates.at(-1)[axis]-plan.route.at(-1)[axis])<1e-9);}}
 const initial=sphericalVisualState(id,0),middle=sphericalVisualState(id,.5),final=sphericalVisualState(id,1);
 assert.equal(initial.route,0);assert.equal(initial.institution,0);assert.equal(initial.exchange,0);assert.equal(initial.settlement,0);assert.equal(initial.laterCanal,0);
 assert.deepEqual(sphericalVisualState(id,0),initial,'rewinding removes changes instead of accumulating objects');
 assert.equal(middle.phase,1);assert.equal(final.phase,2);
 if(id==='zhang'){assert(middle.route>0&&middle.route<1);assert.equal(middle.exchange,0);assert.equal(final.exchange,1);}
 if(id==='protectorate'){assert(middle.institution>0);assert.equal(middle.exchange,0);assert.equal(final.institution,1);assert.equal(final.exchange,1);assert.deepEqual(plan.route,[],'institution must not invent a migration itinerary');}
 if(id==='xibe'){assert.equal(middle.settlement,0);assert.equal(middle.laterCanal,0);assert(sphericalVisualState(id,.78).settlement>0);assert.equal(sphericalVisualState(id,.78).laterCanal,0,'later canal is separate from arrival/settlement');assert.equal(final.laterCanal,1);assert(plan.nodes.some(n=>n.id==='shengjing'));assert.equal(sphericalEventPose(id,0).lon,102);}
}
assert.deepEqual(sphericalRoute([]),[]);
assert.deepEqual(sphericalRoute([[84,42]]),[]);
assert(sphericalRoute([[84,42],[84,42]]).every(p=>p.every(Number.isFinite)));
console.log('球面历史：弧线、可逆进程、起讫与安置/后期引水分离通过');
