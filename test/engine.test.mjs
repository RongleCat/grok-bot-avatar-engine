import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

/**
 * Guards over the transplanted renderer. The declarations themselves are not
 * re-tested for behaviour here — they are the app's own bytes — so what these
 * check is that the transplant is still wired up: the engine loads, every body
 * renders, the pumpkin keeps its stem, and the generated page carries the same
 * engine the tests just ran.
 */
const engine = await import('../data/extracted/src/avatar-engine.js');
const report = JSON.parse(readFileSync(new URL('../data/extracted/avatar-engine.json', import.meta.url), 'utf8'));

const render = (body, color = '#FF6700', size = 96) => {
  const driver = engine.eo({ body });
  driver.pause();
  driver.seek(0);
  for (let index = 0; index < engine.c_; index++) driver.advance(engine.l_);
  const machine = engine.go(driver, 'idle', { seed: 7, isCompact: false, isResting: true });
  machine.advance(0.2);
  const resolution = Math.round(size * engine.no(0.6) * 100) / 100;
  return engine.hp(engine.Xg(driver.frame(), engine.o_(color), resolution, body, {
    isProof: false,
    displaySize: size,
    extent: '100%',
  }));
};

test('every client body renders', () => {
  for (const body of engine.ei) {
    const svg = render(body);
    assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/, `${body}: root`);
    assert.match(svg, /viewBox="0 0 96 96"/, `${body}: viewBox`);
    // The mesh renderer punches eyes through a mask; the flat renderer splices
    // them into the body outline. Neither paints eyes on top.
    const cutOut = /<mask id="/.test(svg) || (svg.match(/Z(?=M|")/g) ?? []).length >= 2;
    assert.ok(cutOut, `${body}: eyes are neither masked nor spliced into the outline`);
    assert.ok(/<path d="M/.test(svg), `${body}: no outline emitted`);
  }
});

test('the pumpkin keeps its ridged body and its stem', () => {
  const svg = render('pumpkin');
  const paths = svg.match(/<path d="M[^"]+"/g) ?? [];
  assert.ok(paths.length >= 2, `expected body plus stem paths, got ${paths.length}`);
  assert.match(svg, /fill="#3d3d3d"|fill="#525252"/, 'stem paints come from the client table');
});

test('the picker shapes resolve onto renderable bodies', () => {
  for (const name of engine.ln) {
    const body = engine.i_(name);
    assert.ok(engine.ei.includes(body), `${name} resolves to ${body}`);
    assert.doesNotThrow(() => render(body));
  }
});

test('pumpkin is the only shape that pins a colour', () => {
  assert.deepEqual(engine.cn.map((entry) => [entry.shape, entry.pickerColor]), [['pumpkin', 'orange']]);
  assert.deepEqual([...engine.ti], ['pumpkin'], 'ti is the client set of bodies with a pinned colour');
});

test('the driver produces a new pose each frame', () => {
  const driver = engine.eo({ body: 'cloud' });
  engine.go(driver, 'working', { seed: 3, isCompact: false, isResting: false });
  const seen = new Set();
  for (let index = 0; index < 20; index++) {
    driver.advance(1 / 60);
    seen.add(JSON.stringify(driver.frame().quat));
  }
  assert.ok(seen.size > 15, `only ${seen.size} distinct poses in 20 frames`);
});

test('the emitter namespaces its defs by the id it is given', () => {
  // The page paints the same body at three sizes at once, so the per-instance
  // prefix is part of the contract: shared ids make <use> and mask cross wires.
  const first = render('pumpkin');
  const withId = (id) => {
    const driver = engine.eo({ body: 'pumpkin' });
    driver.pause();
    driver.seek(0);
    return engine.hp(engine.Xg(driver.frame(), engine.o_('#FF6700'), 96, id, { displaySize: 96, extent: '100%' }));
  };
  const a = withId('a-pumpkin');
  const b = withId('b-pumpkin');
  assert.match(first, /id="[a-z0-9-]+-body"/);
  assert.match(a, /href="#a-pumpkin-body"/);
  assert.match(b, /href="#b-pumpkin-body"/);
  assert.ok(!a.includes('#b-pumpkin'), 'instance a must not reference instance b');
});

test('the generated page carries the engine the tests ran', () => {
  const page = readFileSync(new URL('../examples/showcase.html', import.meta.url), 'utf8');
  assert.ok(!/^export \{/m.test(page), 'the page must not ship the closure export list');
  const source = readFileSync(new URL('../data/extracted/src/avatar-engine.js', import.meta.url), 'utf8');
  for (const declaration of report.declarations.slice(0, 40)) {
    const line = `// ${report.bundle} offset ${declaration.offset} length ${declaration.length} sha1 ${declaration.sha1}`;
    assert.ok(source.includes(line), `missing provenance line for ${declaration.symbol}`);
  }
});
