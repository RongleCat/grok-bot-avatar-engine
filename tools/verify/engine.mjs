/**
 * Drive the transplanted client renderer headless and write one SVG per shape.
 *
 * Nothing here invents geometry: the pose comes from the client's own driver
 * (`eo`), the clip selection from the client's state machine (`go`), the pixels
 * from the client's emitter (`Xg` + `hp`). Every path the showcase page needs
 * is exercised here so tools/extract/loop.py pulls in exactly the symbols the
 * engine asks for and nothing else.
 *
 *   node tools/verify/engine.mjs [shape ...]
 */
import { mkdirSync, writeFileSync } from 'node:fs';

const ENGINE = '../../data/extracted/src/avatar-engine.js';
const SIZE = 96;

function missingName(error) {
  const message = String(error?.message ?? error);
  return /([A-Za-z_$][\w$]*) is not (?:defined|a function)/.exec(message)?.[1] ?? null;
}

async function main() {
  const engine = await import(ENGINE);
  const { eo, go, Xg, hp, o_, no, i_, lo, nn } = engine;
  const shapes = process.argv.slice(2).length ? process.argv.slice(2) : engine.ei;
  const resolution = Math.round(SIZE * no(0.6) * 100) / 100;
  const out = new URL('../../.tmp-engine/', import.meta.url).pathname;
  mkdirSync(out, { recursive: true });

  const states = Object.keys(lo);
  // Identity: the client derives shape and color from the agent id.
  const identity = ['agent_01', 'ronglecat', 'x'].map((agentId) => [
    agentId,
    JSON.stringify(engine.An({ agentId })),
    engine.jn({ agentId, avatarShape: 'pumpkin' }).shape,
    engine.Mn({ agentId }).shape,
  ]);
  const color = nn[3].value;
  const reduced = engine.d_();
  const failures = [];
  const frames = [];

  for (const shape of shapes) {
    try {
      const driver = eo({ body: shape });
      const machine = go(driver, 'idle', { seed: 20261101, isCompact: false, isResting: false });
      for (let index = 0; index < 40; index++) {
        driver.advance(0.1);
        machine.advance(0.1);
        frames.push(JSON.stringify(driver.frame().eyes));
      }
      for (const state of states) {
        machine.setState(state);
        driver.advance(0.35);
        machine.advance(0.35);
        const svg = hp(Xg(driver.frame(), o_(color), resolution, shape, {
          isProof: false,
          displaySize: SIZE,
          extent: '100%',
        }));
        writeFileSync(out + `${shape}-${state}.svg`, svg);
      }
      // The resting pose the client settles on under prefers-reduced-motion.
      const still = eo({ body: shape });
      const resting = go(still, 'idle', { seed: 11, isCompact: false, isResting: true });
      resting.advance(0.2);
      writeFileSync(out + `${shape}-rest.svg`, hp(Xg(still.frame(), o_(color), resolution, shape, {
        displaySize: SIZE,
        extent: '100%',
      })));
      // The pointer-following path, and the compact pose used in small slots.
      driver.setGazeAlways?.(true);
      driver.setGaze?.({ x: 0.4, y: -0.3 });
      driver.setEmphasis?.(true);
      driver.advance(0.2);
      machine.setCompact(true);
      machine.advance(0.2);
      writeFileSync(out + `${shape}-gaze.svg`, hp(Xg(driver.frame(), o_(color), resolution, shape, {
        displaySize: SIZE,
        extent: '100%',
      })));
      machine.setCompact(false);
      driver.setBody?.(i_(shape), { isInstant: true });
    } catch (error) {
      failures.push([shape, error]);
    }
  }
  if (failures.length > 0) {
    // Report every distinct missing symbol at once; one round per shape would
    // take twenty rebuilds to converge on the same answer.
    const names = new Set();
    for (const [, error] of failures) {
      const name = missingName(error);
      if (name) names.add(name);
    }
    for (const name of names) console.error('MISSING %s', name);
    if (names.size === 0) {
      const [shape, error] = failures[0];
      console.error('FAILED %s: %s', shape, error.stack?.split('\n').slice(0, 4).join('\n'));
    }
    process.exit(1);
  }
  console.log('rendered %d shapes x %d states into %s', shapes.length, states.length, out);
  console.log('animated frames distinct: %d / %d', new Set(frames).size, frames.length);
  console.log('reduced motion: %s', reduced);
  for (const row of identity) console.log('identity: %s', row.join(' | '));
}

main().catch((error) => {
  const name = missingName(error);
  if (name) console.error('MISSING %s', name);
  console.error(String(error?.stack ?? error).split('\n').slice(0, 5).join('\n'));
  process.exit(1);
});
