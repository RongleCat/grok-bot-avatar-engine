import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  CANVAS_CENTRE, LOFT_POWER, LOFT_RESAMPLE, REVOLVE_RADIAL, SCAN_BUCKETS,
  contourSpan, crystalBalls, inscribedBalls, loft, revolve, ringPoints, starFlower,
} from '../src/mesh/build.mjs';

/** Evaluate a bundle slice with the minified names it closes over. */
function bundle(name, scope = {}) {
  const file = new URL(`../data/extracted/src/${name}.js`, import.meta.url);
  const source = readFileSync(file, 'utf8').split('\n').slice(1).join('\n').trim();
  const keys = Object.keys(scope);
  // eslint-disable-next-line no-new-func
  return new Function(...keys, `return (${source})`)(...keys.map((key) => scope[key]));
}

const MATH_SCOPE = {
  L: CANVAS_CENTRE,
  Js: Math.PI * 2,
  sc: 1e-5,
  oc: SCAN_BUCKETS,
  $s: REVOLVE_RADIAL,
  ic: LOFT_RESAMPLE,
  rc: 16,
  nc: LOFT_POWER,
  tc: 40,
  Math,
};

/** A rounded contour in canvas space, enough to exercise every branch. */
function sampleContour(radius = 90, lobes = 3) {
  const points = [];
  for (let index = 0; index < 128; index++) {
    const angle = (index / 128) * Math.PI * 2;
    const wobble = 1 + 0.18 * Math.sin(angle * lobes);
    points.push([
      CANVAS_CENTRE + Math.cos(angle) * radius * wobble,
      CANVAS_CENTRE + Math.sin(angle) * radius * wobble,
    ]);
  }
  return points;
}

function squareContour(half = 100) {
  return [
    [CANVAS_CENTRE - half, CANVAS_CENTRE - half],
    [CANVAS_CENTRE + half, CANVAS_CENTRE - half],
    [CANVAS_CENTRE + half, CANVAS_CENTRE + half],
    [CANVAS_CENTRE - half, CANVAS_CENTRE + half],
  ];
}

function assertPointsEqual(got, want, message) {
  assert.equal(got.length, want.length, `${message}: length ${got.length} != ${want.length}`);
  for (let index = 0; index < got.length; index++) {
    const a = got[index];
    const b = want[index];
    const keys = typeof a === 'object' ? Object.keys(a) : null;
    if (keys) {
      for (const key of keys) {
        assert.ok(Number.isFinite(a[key]), `${message}[${index}].${key} is not finite`);
        assert.ok(Math.abs(a[key] - b[key]) < 1e-12, `${message}[${index}].${key}: ${a[key]} != ${b[key]}`);
      }
    } else {
      for (let at = 0; at < a.length; at++) {
        assert.ok(Number.isFinite(a[at]), `${message}[${index}][${at}] is not finite`);
        assert.ok(Math.abs(a[at] - b[at]) < 1e-12, `${message}[${index}][${at}]: ${a[at]} != ${b[at]}`);
      }
    }
  }
}

test('contourSpan matches the bundle', () => {
  const ref = bundle('contour-extent', { sc: 1e-5, oc: SCAN_BUCKETS });
  for (const contour of [sampleContour(), squareContour(), sampleContour(40, 5)]) {
    const mine = contourSpan(contour);
    const theirs = ref(contour);
    for (let y = CANVAS_CENTRE - 130; y <= CANVAS_CENTRE + 130; y += 3.5) {
      // Outside the contour the client returns -Infinity on purpose (c - s with
      // c = -Infinity, s = Infinity), so compare identity rather than finiteness.
      assert.ok(Object.is(mine(y), theirs(y)) || Math.abs(mine(y) - theirs(y)) < 1e-9,
        `contourSpan at y=${y}: ${mine(y)} != ${theirs(y)}`);
    }
  }
});

test('ringPoints matches the bundle', () => {
  const ref = bundle('ring-points', { $s: REVOLVE_RADIAL, Js: Math.PI * 2 });
  for (const [y, radius] of [[0, 1], [-0.4, 0.77], [0.9, 0.05]]) {
    assertPointsEqual(ringPoints(y, radius), ref(y, radius), 'ringPoints');
  }
});

test('revolve matches the bundle on a lobed and a square contour', () => {
  const span = bundle('contour-extent', { sc: 1e-5, oc: SCAN_BUCKETS, Math });
  const rings = bundle('ring-points', { $s: REVOLVE_RADIAL, Js: Math.PI * 2 });
  const ref = bundle('revolve', { L: CANVAS_CENTRE, Dc: span, Ac: rings });
  for (const contour of [sampleContour(), squareContour(), sampleContour(60, 1)]) {
    assertPointsEqual(revolve(contour), ref(contour), 'revolve');
  }
});

test('loft matches the bundle', () => {
  const ref = bundle('loft', { ic: LOFT_RESAMPLE, rc: 16, nc: LOFT_POWER, Math });
  const contour = sampleContour(80, 2).map(([x, y]) => ({ x, y }));
  for (const depth of [0.62, 0.72, 0.36]) {
    const got = loft(contour, depth);
    const want = ref(contour, depth);
    assert.equal(got.depth, want.depth);
    assertPointsEqual([got.center], [want.center], 'loft center');
    assertPointsEqual(got.rings.flat(), want.rings.flat(), 'loft rings');
  }
});

test('inscribedBalls matches the bundle', () => {
  const square = squareContour(120);
  const lobed = sampleContour(95, 4);
  const table = new Map([[1, square], [2, lobed]]);
  const z = (id) => table.get(id);
  const ref = bundle('inscribed-balls', { L: CANVAS_CENTRE, tc: 40, z, Math, Array, Infinity });
  for (const id of [1, 2]) {
    const got = inscribedBalls(table.get(id));
    const want = ref(id);
    assertPointsEqual(got, want, `inscribedBalls body ${id}`);
  }
});

test('crystalBalls matches the bundle', () => {
  const ref = bundle('crystal-balls', { Js: Math.PI * 2, Math });
  assertPointsEqual(crystalBalls(), ref(), 'crystalBalls');
});

test('starFlower matches the bundle', () => {
  const ref = bundle('star-flower', { Js: Math.PI * 2, Math });
  assertPointsEqual(starFlower(), ref(), 'starFlower');
});

test('mesh constants match the bundle values', () => {
  assert.equal(CANVAS_CENTRE, 114.2705);
  assert.equal(LOFT_POWER, 0.72);
  assert.equal(LOFT_RESAMPLE, 160);
  assert.equal(REVOLVE_RADIAL, 64);
  assert.equal(SCAN_BUCKETS, 64);
});
