import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { SHAPES, bodyPath, poseAt, renderAvatarSvg } from '../src/index.mjs';

const OUTLINE_HASH = {
  blob: '477f7be7ea2c95bf',
  pebble: 'a5228bfd03185a7c',
  bean: '506b3131ce8c2643',
  egg: 'ac728b90056d60fc',
  squircle: '53a566ca2fe59159',
  tablet: 'c33b4ec7ee578d94',
  capsule: '02fc525289d5f94d',
  cylinder: '139fc19674396289',
  hex: '7d91f7e72305dc0e',
  gem: '4e8c630f9fe7b063',
  crystal: 'f65236b3f3578c04',
  wedge: 'a51fc2677f559068',
  shield: '92524d580680800d',
  dome: '73fbbd6469397233',
  arch: 'd6500d448006a963',
  cloud: '8274d76a743613be',
  teardrop: 'a29967fa043fc33a',
  leaf: 'e7fdbb9a1bc18ebc',
  square: '223b926226728391',
  sparkle: '7d7385b49cf154c2',
  clover: '524a4ca0071884ed',
  flower: '01750096aff35a5a',
  heart: '73530a21d57f44ee',
  house: 'f041c137ce466e28',
  star: 'cbb4bd94673e12f0',
};

test('every public shape has a closed outline', () => {
  assert.equal(SHAPES.length, 25);
  for (const shape of SHAPES) {
    const path = bodyPath(shape);
    assert.match(path, /^M/);
    assert.match(path, /Z$/);
    assert.equal(path.includes('NaN'), false);
    const hash = createHash('sha256').update(path).digest('hex').slice(0, 16);
    assert.equal(hash, OUTLINE_HASH[shape], shape);
  }
});

test('an unknown shape throws', () => {
  assert.throws(() => bodyPath('not-a-shape'), /AVATAR_SHAPE_UNKNOWN/);
});

test('idle breathes and a small avatar stays on the compact clip', () => {
  const rest = poseAt('idle', 0);
  const breath = poseAt('idle', 1.6054821209465213);
  assert.equal(rest.clip, 'Idle_B');
  assert.equal(rest.scale, 1);
  assert.ok(Math.abs(breath.scale - 0.64 / 0.6) < 1e-9);
  assert.equal(poseAt('idle', 10, { compact: true }).clip, 'Idle_B');
  assert.equal(poseAt('idle', 10).clip, 'Idle_D');
});

test('blocked holds, then moves on', () => {
  assert.equal(poseAt('blocked', 119).clip, 'Blocked_A');
  assert.equal(poseAt('blocked', 120).clip, 'Blocked_C');
});

test('the main-bot star punches a hole and uses the same orange everywhere', () => {
  const svg = renderAvatarSvg({
    agentId: '33cf1aae-3a51-452d-b761-34a6ccb62201',
    main: true,
    time: 0,
    size: 120,
    id: 'starred',
  });
  assert.match(svg, /#f59312/);
  assert.match(svg, /#A27952/);
  assert.match(svg, /mask="url\(#starred-notch\)"/);
  assert.match(svg, /cloud|M/);
  const plain = renderAvatarSvg({ shape: 'hex', color: 'green', id: 'plain' });
  assert.equal(plain.includes('#f59312'), false);
  assert.match(plain, /#00C972/);
});

test('a picture url replaces the character unless forced', () => {
  const photo = renderAvatarSvg({
    agentId: 'abc',
    avatarUrl: 'https://example.com/a.png',
    id: 'photo',
  });
  assert.match(photo, /href="https:\/\/example.com\/a.png"/);
  const character = renderAvatarSvg({
    agentId: 'abc',
    avatarUrl: 'https://example.com/a.png',
    forceCharacter: true,
    id: 'back',
  });
  assert.equal(character.includes('<image'), false);
  assert.match(character, /<path /);
});

test('quotes in ink are escaped', () => {
  const svg = renderAvatarSvg({ shape: 'blob', ink: 'red" onload="alert(1)', id: 'ink' });
  assert.equal(svg.includes('onload="'), false);
  assert.match(svg, /fill="red&quot; onload=&quot;alert\(1\)"/);
});
