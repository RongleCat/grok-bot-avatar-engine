import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { deriveDefaultAvatar, hashBotId, resolveAvatar } from '../src/index.mjs';

const fixture = JSON.parse(readFileSync(new URL('./avatar-vectors.json', import.meta.url), 'utf8'));

test('agent id vectors match the 0.70.2 recipe', () => {
  for (const vector of fixture.vectors) {
    const derived = deriveDefaultAvatar(vector.key);
    assert.equal(derived.hash, vector.hash);
    assert.equal(derived.shapeHash, vector.shapeHash);
    const avatar = resolveAvatar(vector.key);
    assert.equal(avatar.shape, vector.shape);
    assert.equal(avatar.color, vector.color);
    assert.equal(avatar.shapeIndex, vector.shapeIndex);
    assert.equal(avatar.colorIndex, vector.colorIndex);
    assert.equal(avatar.kind, 'character');
    assert.equal(avatar.sources.shape, 'id-default');
    assert.equal(avatar.sources.color, 'id-default');
  }
});

test('uppercase UUID is a different character', () => {
  const lower = resolveAvatar('33cf1aae-3a51-452d-b761-34a6ccb62201');
  const upper = resolveAvatar('33CF1AAE-3A51-452D-B761-34A6CCB62201');
  assert.equal(lower.shape, 'cloud');
  assert.equal(lower.color, 'brown');
  assert.equal(upper.shape, 'tablet');
  assert.equal(upper.color, 'red');
});

test('explicit shape and color override independently, and a picture wins the kind', () => {
  const avatar = resolveAvatar({
    agentId: '33cf1aae-3a51-452d-b761-34a6ccb62201',
    avatarShape: 'hex',
    avatarColor: 'black',
    avatarUrl: 'https://example.com/a.png',
    avatarVersion: '3',
  });
  assert.equal(avatar.shape, 'hex');
  assert.equal(avatar.color, 'black');
  assert.equal(avatar.darkHex, '#FFFFFF');
  assert.equal(avatar.sources.shape, 'explicit');
  assert.equal(avatar.sources.color, 'explicit');
  assert.equal(avatar.kind, 'picture');
  assert.equal(avatar.picture.url, 'https://example.com/a.png');
  assert.equal(avatar.picture.version, '3');
});

test('invalid explicit fields fall back to the id', () => {
  const avatar = resolveAvatar({
    agentId: 'abc',
    avatarShape: 'not-a-shape',
    avatarColor: 'pink',
  });
  assert.equal(avatar.shape, 'hex');
  assert.equal(avatar.color, 'cyan');
});

test('empty keys throw', () => {
  assert.throws(() => hashBotId(''), /AVATAR_KEY_REQUIRED/);
  assert.throws(() => resolveAvatar(''), /AVATAR_AGENT_ID_REQUIRED/);
  assert.throws(() => resolveAvatar({ agentId: '' }), /AVATAR_AGENT_ID_REQUIRED/);
});
