import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { PumpTourClock, PUMP_TOUR_CUES, PUMP_TOUR_DURATION, pumpTourPoseAt, formatPumpTourTime } from '../src/pump-tour.js';
import { PumpNarration } from '../src/pump-narration.js';
import { PumpContent, PUMP_PARTS } from '../src/pump-content.js';
import { StageLayout } from '../src/stage-layout.js';
import { STAGE_TEMPLATES, createTemplateStage } from '../src/stage-templates.js';
import { serializeStage } from '../src/stage-definition.js';

test('完整脚本逐一介绍六部件；每一秒有唯一章节，开场和总结合计 108 秒', () => {
  assert.deepEqual(PUMP_TOUR_CUES.filter(cue => cue.step).map(cue => cue.part), PUMP_PARTS.map(part => part.id));
  for (let second = 0; second < PUMP_TOUR_DURATION; second += .25) {
    const matches = PUMP_TOUR_CUES.filter(cue => second >= cue.start && second < cue.end);
    assert.equal(matches.length, 1); assert.equal(pumpTourPoseAt(second).cue.id, matches[0].id);
  }
  assert.equal(pumpTourPoseAt(0).view, 'wide');
  assert.equal(pumpTourPoseAt(108).cue.id, 'summary'); assert.equal(pumpTourPoseAt(108).finished, true);
});
test('章节边界的旋转和展开连续；跳段与异常时间仍产生有限合法状态', () => {
  for (const cue of PUMP_TOUR_CUES.slice(1)) {
    const before = pumpTourPoseAt(cue.start - .000001), after = pumpTourPoseAt(cue.start);
    assert.ok(Math.abs(before.rotation - after.rotation) < .00001);
    assert.ok(Math.abs(before.explode - after.explode) < .00001);
  }
  for (const seconds of [-20, NaN, Infinity, ...PUMP_TOUR_CUES.map(cue => cue.start + 3), 200]) {
    const pose = pumpTourPoseAt(seconds);
    assert.ok([pose.time, pose.rotation, pose.explode, pose.cameraAngle].every(Number.isFinite));
    assert.ok(pose.explode >= 0 && pose.explode <= 1); assert.ok(PUMP_PARTS.some(part => part.id === pose.selected));
  }
  assert.equal(formatPumpTourTime(108), '01:48'); assert.equal(formatPumpTourTime(NaN), '00:00');
});
test('主时钟以实际时间推进，暂停保持位置，继续不重复起点，完整播放后停住且可重播', () => {
  let now = 0; const clock = new PumpTourClock(() => now);
  clock.play(); now = 10; clock.play(); assert.equal(clock.time, 10);
  clock.pause(); now = 80; assert.equal(clock.time, 10); assert.equal(clock.playing, false);
  clock.play(); now = 87; assert.equal(clock.time, 17);
  now = 200; assert.equal(clock.time, 108); assert.equal(clock.playing, false);
  now = 250; assert.equal(clock.time, 108); clock.play(); assert.equal(clock.time, 0); assert.equal(clock.playing, true);
});
test('播放中跳段保持播放，暂停跳段保持暂停，拖到终点结束，不依赖帧数', () => {
  let now = 0; const clock = new PumpTourClock(() => now);
  clock.seek(51); assert.equal(clock.playing, false); clock.play(); now = 4; assert.equal(clock.time, 55);
  clock.seek(81); now = 6; assert.equal(clock.time, 83); assert.equal(clock.playing, true);
  clock.pause(); clock.seek(21); now = 40; assert.equal(clock.time, 21); assert.equal(clock.playing, false);
  clock.play(); clock.seek(108); assert.equal(clock.playing, false); assert.equal(clock.time, 108);
  clock.seek(-1); assert.equal(clock.time, 0); clock.seek(NaN); assert.equal(clock.time, 0);
});
test('五套舞台的逐部件镜头边界包含实际世界几何；讲解全过程不改写舞台资产', () => {
  for (const template of STAGE_TEMPLATES) {
    const stage = createTemplateStage(template.id), original = serializeStage(stage);
    const layout = new StageLayout(new THREE.Scene()); layout.build(stage); const content = new PumpContent(layout);
    for (const cue of PUMP_TOUR_CUES) {
      const pose = pumpTourPoseAt(cue.start + 3); content.update(pose, 0, pose.time, true); layout.scene.updateMatrixWorld(true);
      const box = content.partBounds(pose.selected);
      assert.ok(!box.isEmpty()); assert.ok([...box.min.toArray(), ...box.max.toArray()].every(Number.isFinite));
      for (const mesh of content.model.pickable.filter(mesh => mesh.userData.partId === pose.selected)) {
        const vertex = new THREE.Vector3();
        for (let i = 0; i < mesh.geometry.attributes.position.count; i++) {
          vertex.fromBufferAttribute(mesh.geometry.attributes.position, i).applyMatrix4(mesh.matrixWorld);
          assert.ok(box.clone().expandByScalar(.00001).containsPoint(vertex));
        }
      }
    }
    assert.equal(serializeStage(stage), original); assert.deepEqual(content.partBounds('missing'), content.bounds());
    content.dispose(); layout.dispose();
  }
});

function voiceFixture(voices = [{ lang: 'zh-CN', localService: true }]) {
  const callbacks = new Map(), synth = { calls: [], cancellations: 0, getVoices: () => voices,
    addEventListener: (name, fn) => callbacks.set(name, fn), removeEventListener: name => callbacks.delete(name),
    speak(utterance) { this.calls.push(utterance); }, cancel() { this.cancellations++; } };
  class Utterance { constructor(text) { this.text = text; } }
  const errors = [], availability = [], narration = new PumpNarration({ synthesis: synth, Utterance,
    onAvailability: value => availability.push(value), onError: error => errors.push(error) });
  return { synth, callbacks, errors, availability, narration, voices };
}
test('语音只选择本机中文声音；无支持时屏幕流程仍可运行，未启用时不发声', () => {
  const fixture = voiceFixture([{lang: 'en-US', localService: true}, {lang: 'zh-CN', localService: false}]);
  fixture.narration.setEnabled(true); fixture.narration.speak('测试'); assert.deepEqual(fixture.availability, [false]);
  assert.equal(fixture.synth.calls.length, 0); fixture.narration.dispose();
  const supported = voiceFixture(); supported.narration.speak('测试'); assert.equal(supported.synth.calls.length, 0);
  supported.narration.setEnabled(true); supported.narration.speak('电机'); assert.equal(supported.synth.calls[0].text, '电机');
  assert.equal(supported.synth.calls[0].lang, 'zh-CN'); supported.narration.dispose();
  const unavailable = new PumpNarration({synthesis: undefined, Utterance: undefined}); unavailable.setEnabled(true); unavailable.speak('无浏览器'); unavailable.dispose();
});
test('跳段取消旧语音，过期错误不会影响新章节；禁用与退出释放监听和当前语音', () => {
  const {narration, synth, errors, callbacks} = voiceFixture(); narration.setEnabled(true);
  narration.speak('电机'); const previous = synth.calls[0]; narration.speak('联轴器');
  assert.equal(synth.cancellations, 1); previous.onerror({error: 'synthesis-failed'}); assert.deepEqual(errors, []);
  synth.calls[1].onerror({error: 'interrupted'}); assert.deepEqual(errors, []);
  narration.setEnabled(false); assert.equal(synth.cancellations, 2); narration.dispose(); assert.equal(callbacks.size, 0);
});
test('本机声音消失时安全禁用；声音服务同步失败会报告且不破坏讲解', () => {
  const fixture = voiceFixture(); fixture.narration.setEnabled(true); fixture.narration.speak('电机');
  fixture.voices.length = 0; fixture.callbacks.get('voiceschanged')(); assert.equal(fixture.narration.enabled, false);
  fixture.narration.speak('密封'); assert.equal(fixture.synth.calls.length, 1); fixture.narration.dispose();
  const broken = voiceFixture(); broken.synth.speak = () => {throw new Error('unavailable');};
  broken.narration.setEnabled(true); assert.doesNotThrow(() => broken.narration.speak('叶轮')); assert.deepEqual(broken.errors, ['unavailable']);
  assert.equal(broken.narration.current, null); broken.narration.dispose();
});
