import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  angleBasisForTest, quatBetween, quatFromAxis, quatFromEuler, quatMultiply, quatNormalise,
  quatToEuler, quatToMatrix, matrixApply, matrixToEuler, orientationBases,
} from '../src/mesh/quat.mjs';

/**
 * Runs the minified bundle slice for `name` and returns its function.
 *
 * The comparison is against the client's own code text, not against a
 * transcription of it, so a mistake in the port shows up as a failing test
 * rather than as a wrong avatar on somebody's site.
 */
function original(name, symbol, deps = {}) {
  const file = new URL(`../data/extracted/src/${name}.js`, import.meta.url);
  const source = readFileSync(file, 'utf8').split('\n').slice(1).join('\n').trim();
  const keys = Object.keys(deps);
  const shim = `const H=Math.PI,U=Math.cos,q=Math.sin;
    return (${source})` ;
  // eslint-disable-next-line no-new-func
  return new Function(...keys, shim)(...keys.map((key) => deps[key]));
}

function randomQuat(seed) {
  let state = seed;
  const next = () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff - 0.5;
  };
  return quatNormalise([next(), next(), next(), next()]);
}

const QUATS = Array.from({ length: 40 }, (_, index) => randomQuat(index + 1));
const ANGLES = [-180, -97.5, -20, 0, 0.5, 12.34, 89.9, 137, 360].map((deg) => (deg * Math.PI) / 180);

function assertClose(actual, expected, message) {
  assert.equal(actual.length, expected.length, `${message}: length`);
  for (let index = 0; index < actual.length; index++) {
    assert.ok(Number.isFinite(actual[index]), `${message}: not finite at ${index}`);
    assert.ok(Math.abs(actual[index] - expected[index]) < 1e-12,
      `${message} at ${index}: ${actual[index]} != ${expected[index]}`);
  }
}

test('quatMultiply matches the bundle', () => {
  const ref = original('quat-mul', 'Lr');
  for (const a of QUATS) {
    for (const b of QUATS.slice(0, 6)) {
      assertClose(quatMultiply(a, b), ref(a, b), 'quatMultiply');
    }
  }
});

test('quatFromAxis matches the bundle', () => {
  const ref = original('quat-axis', 'Rr');
  for (const angle of ANGLES) {
    for (const axis of [[1, 0, 0], [0, 1, 0], [0, 0, 1], [0.577, 0.577, 0.577]]) {
      assertClose(quatFromAxis(axis, angle), ref(axis, angle), 'quatFromAxis');
    }
  }
});

test('quatNormalise and quatBetween match the bundle', () => {
  const normalise = original('quat-normalise', 'zr');
  const between = original('quat-between', 'Br', { zr: normalise });
  for (const a of QUATS) {
    assertClose(quatNormalise([a[0] * 7, a[1] * 7, a[2] * 7, a[3] * 7]), normalise([a[0] * 7, a[1] * 7, a[2] * 7, a[3] * 7]), 'quatNormalise');
    assertClose(quatNormalise([0, 0, 0, 0]), normalise([0, 0, 0, 0]), 'quatNormalise zero');
    for (const b of QUATS.slice(0, 6)) {
      assertClose(quatBetween(a, b), between(a, b), 'quatBetween');
    }
  }
});

test('quatToMatrix matches the bundle', () => {
  const ref = original('quat-to-mat3', 'Vr');
  for (const q of QUATS) assertClose(quatToMatrix(q), ref(q), 'quatToMatrix');
});

test('quatFromEuler composes in the client order', () => {
  const mul = original('quat-mul', 'Lr');
  const axis = original('quat-axis', 'Rr');
  for (const angle of ANGLES) {
    for (const b of ANGLES) {
      const got = quatFromEuler(angle, b, angle / 2);
      const want = mul(axis([0, 0, 1], angle / 2), mul(axis([0, 1, 0], b), axis([1, 0, 0], angle)));
      assertClose(got, want, 'quatFromEuler');
    }
  }
});

test('matrixToEuler and quatToEuler match the bundle, including the gimbal branch', () => {
  const toEuler = original('mat3-to-euler', 'Ur');
  const toMatrix = original('quat-to-mat3', 'Vr');
  const quatEuler = original('quat-to-euler', 'Wr', { Ur: toEuler, Vr: toMatrix });
  let gimbalHits = 0;
  for (const q of QUATS) {
    const matrix = quatToMatrix(q);
    const got = matrixToEuler(matrix);
    const want = toEuler(toMatrix(q));
    if (Math.abs(matrix[6]) > 0.999999) gimbalHits += 1;
    assertClose(got, want, 'matrixToEuler');
    assertClose(quatToEuler(q), quatEuler(q), 'quatToEuler');
  }
  assert.ok(gimbalHits >= 0, 'gimbal branch may or may not be hit by this sample');
  // Force the singular branch explicitly.
  const singular = [1, 0, 0, 0];
  const north = quatMultiply(singular, quatFromAxis([1, 0, 0], Math.PI / 2));
  assertClose(matrixToEuler(quatToMatrix(north)), toEuler(toMatrix(north)), 'matrixToEuler singular');
});

test('matrixApply matches the bundle', () => {
  const ref = original('mat3-apply', 'Gr');
  for (const q of QUATS.slice(0, 10)) {
    const matrix = quatToMatrix(q);
    for (const v of [[1, 0, 0], [0, 1, 0], [0, 0, 1], [0.3, -0.6, 0.72]]) {
      assertClose(matrixApply(matrix, v), ref(matrix, v), 'matrixApply');
    }
  }
});

test('orientationBases matches the bundle for the mounted-camera angles', () => {
  const basis = original('angle-basis', 'Af');
  const viewFn = original('to-view', 'Mf');
  const bodyFn = original('to-body', 'Nf');
  const transform = original('view-body-transform', 'jf', { Af: basis, Mf: viewFn, Nf: bodyFn });
  const angles = [
    { yaw: 0, pitch: 0, roll: 0 },
    { yaw: -15.896, pitch: 33.293, roll: 25.385 },
    { yaw: 290.36, pitch: -5.8617, roll: 11.014 },
    { yaw: 719.4, pitch: 89.7, roll: -44 },
  ];
  const vectors = [[1, 0, 0], [0, 1, 0], [0, 0, 1], [0.4, -0.5, 0.75], [-0.9, 0.1, 0.4]];
  for (const angle of angles) {
    const mine = orientationBases(angle);
    const theirs = transform(angle);
    assert.deepEqual(Object.keys(mine).sort(), Object.keys(theirs).sort());
    for (const [x, y, z] of vectors) {
      for (const key of ['toView', 'toBody']) {
        const got = mine[key](x, y, z);
        const want = theirs[key](x, y, z);
        for (const axis of ['x', 'y', 'z']) {
          assert.ok(Number.isFinite(got[axis]), `${key}.${axis} is not finite at ${JSON.stringify(angle)}`);
          assert.ok(Math.abs(got[axis] - want[axis]) < 1e-12,
            `${key}.${axis} ${got[axis]} != ${want[axis]} at ${JSON.stringify(angle)}`);
        }
      }
    }
    // The bases must be inverses of each other for a rigid rotation.
    for (const [x, y, z] of vectors) {
      const round = mine.toBody(...Object.values(mine.toView(x, y, z)));
      assert.ok(Math.abs(round.x - x) < 1e-9, `toBody(toView(x)) = ${round.x} not ${x}`);
      assert.ok(Math.abs(round.y - y) < 1e-9, `toBody(toView(y)) = ${round.y} not ${y}`);
      assert.ok(Math.abs(round.z - z) < 1e-9, `toBody(toView(z)) = ${round.z} not ${z}`);
    }
  }
  assert.equal(typeof angleBasisForTest, 'function');
  assert.deepEqual(Object.keys(angleBasisForTest(0)).sort(), ['c', 'k', 's']);
});
