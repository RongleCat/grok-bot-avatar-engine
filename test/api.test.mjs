import assert from 'node:assert/strict';
import test from 'node:test';

import {
  BODIES, COLORS, COMPACT_SIZE, SHAPES, STATES,
  bodyFor, colorValue, createAvatar, pinnedColor, renderAvatarSvg, resolveAvatar,
} from '../src/index.mjs';

/**
 * The public surface is two functions and a handful of table reads, so these
 * check the bindings rather than the pixels: that each call reaches the client
 * renderer and that nothing here has grown its own idea of what an avatar looks
 * like. test/engine.test.mjs covers the renderer itself.
 */

test('the tables come from the client, not from a list kept here', () => {
  assert.equal(SHAPES.length, 26);
  assert.equal(BODIES.length, 26);
  assert.equal(COLORS.length, 11);
  assert.equal(STATES.includes('turntable'), true);
  assert.equal(COMPACT_SIZE, 48);
  assert.deepEqual(bodyFor('flower'), 'starFlower');
  assert.deepEqual(bodyFor('star'), 'star6');
  assert.equal(colorValue('orange'), '#FF6700');
  assert.equal(colorValue('#123456'), null);
});

test('only the pumpkin pins a colour', () => {
  assert.equal(pinnedColor('pumpkin'), 'orange');
  for (const shape of SHAPES.filter((name) => name !== 'pumpkin')) {
    assert.equal(pinnedColor(shape), null, shape);
  }
});

test('an explicit pumpkin survives resolution', () => {
  // An() drops it because the gated shapes are not in the picker list; the
  // public resolver has to be the gated one or nobody could ask for a pumpkin.
  assert.deepEqual(resolveAvatar({ agentId: 'x', avatarShape: 'pumpkin' }).shape, 'pumpkin');
  assert.equal(resolveAvatar('agent_01').shape, 'blob');
});

test('renderAvatarSvg draws through the client renderer', () => {
  const svg = renderAvatarSvg({ shape: 'pumpkin', size: 96 });
  assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" id="avatar-pumpkin"/);
  assert.match(svg, /viewBox="0 0 96 96"/);
  assert.match(svg, /fill="#FF6700"/, 'the pinned orange');
  assert.match(svg, /<mask id="avatar-pumpkin-holes"/, 'eyes are cut out');
  assert.match(svg, /fill="#3d3d3d"|fill="#525252"/, 'the stem paints come from the client');
});

test('the pinned colour wins over a requested one', () => {
  const svg = renderAvatarSvg({ shape: 'pumpkin', color: 'blue', size: 96 });
  assert.match(svg, /fill="#FF6700"/);
  assert.doesNotMatch(svg, /fill="#1084FE"/);
});

test('an agent id picks both shape and colour', () => {
  const { shape, color } = resolveAvatar('agent_01');
  const svg = renderAvatarSvg({ agentId: 'agent_01', size: 96 });
  assert.equal(svg.includes(`fill="${colorValue(color)}"`), true, `${shape}/${color}`);
  assert.equal(svg.includes(`id="avatar-${shape}"`), true);
});

test('time steps the driver', () => {
  const base = { shape: 'cloud', color: 'magenta', size: 96, id: 'x' };
  const a = renderAvatarSvg({ ...base, time: 0.4 });
  const b = renderAvatarSvg({ ...base, time: 2.4 });
  const still = renderAvatarSvg(base);
  assert.notEqual(a, b, 'two moments must differ');
  assert.notEqual(still, a, 'the still frame is its own procedure');
});

test('each call namespaces its defs by the id it was given', () => {
  const one = renderAvatarSvg({ shape: 'gem', color: 'black', size: 96, id: 'one' });
  const two = renderAvatarSvg({ shape: 'gem', color: 'black', size: 96, id: 'two' });
  assert.match(one, /href="#one-body"/);
  assert.match(two, /href="#two-body"/);
  assert.ok(!one.includes('#two-'));
});

test('small avatars share the client sprite floor', () => {
  // The client renders into a sprite of at least 144 units and scales it into
  // the box, so a 24px and a 96px avatar carry the same outline, not a coarser
  // one. That floor is gp in the bundle, not a number kept here.
  const sprite = (size) => /<mask[^>]*width="([0-9.]+)"/.exec(
    renderAvatarSvg({ shape: 'pebble', color: 'green', size, state: 'idle', time: 0.2, id: `s${size}` }),
  )[1];
  assert.equal(sprite(24), sprite(96));
  assert.equal(Number(sprite(24)) >= 144, true);
});

test('bad input is refused before anything is drawn', () => {
  assert.throws(() => renderAvatarSvg({}), /shape, avatarShape or agentId/);
  assert.throws(() => renderAvatarSvg({ shape: 'cloud' }), /color, avatarColor or agentId/);
});

/** Just enough DOM for the client's own mount step: observers stay undefined in node, as the component expects. */
function fakeElement() {
  const node = (tag) => ({
    tag,
    attributes: [],
    children: [],
    setAttribute(name, value) { this.attributes.push({ name, value }); },
    append(...kids) { this.children.push(...kids); },
    querySelectorAll: () => [],
  });
  return {
    ownerDocument: { createElementNS: (_ns, tag) => node(tag) },
    replaceChildren(...kids) { this.mounted = kids; },
    getBoundingClientRect: () => ({ width: 96, height: 96, left: 0, top: 0 }),
  };
}

test('createAvatar hands back the client component', () => {
  const element = fakeElement();
  const avatar = createAvatar(element, {
    shape: 'clover', color: 'green', state: 'working', size: 96, id: 'live', isStatic: true,
  });
  assert.equal(typeof avatar.setState, 'function');
  assert.equal(typeof avatar.destroy, 'function');
  assert.equal(element.mounted.length, 1, 'the svg was mounted');
  assert.equal(element.mounted[0].tag, 'svg');
  assert.equal(element.mounted[0].attributes.find((a) => a.name === 'id').value, 'live');
  assert.doesNotThrow(() => avatar.setState('finished'));
  assert.doesNotThrow(() => avatar.destroy());
});
