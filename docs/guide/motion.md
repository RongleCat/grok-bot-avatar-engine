# Motion

Motion is the client's, not a re-timing of it. Two declarations do the work:

```js
import { client, STATES } from 'grok-bot-avatar-engine';

const driver = client.eo({ body: 'cloud' });
const machine = client.go(driver, 'working', {
  seed: 20261101,
  isCompact: false,
  isResting: false,
});

for (let frame = 0; frame < 120; frame++) {
  machine.advance(1 / 60);
  driver.advance(1 / 60);
}
driver.frame(); // { body, quat, zoom, offset, squash, squashAnchor, eyes, glow, ... }
```

`eo` is the stateful driver: springs, pointer gaze, blinks, pokes, morphs and a
rest pose. `go` is the clip machine over the client's `lo` table. `frame()` is
what `Xg` draws. `createAvatar` wires all three plus the client's own component
loop, so most callers never touch this.

## Poses are quantized

Before anything is drawn, the driver's orientation is snapped to a step that
depends on the sprite size, and yaw is nudged away from the gimbal at ±90°. That
is the client's `jp`/`Mp`/`Np`/`Pp`, and it is why the same avatar at the same
moment produces the same paths twice — the mesh caches key off it. Two avatars of
the same shape at different sizes therefore do not share a cache entry.

## States

`STATES` is the 53 keys of `lo`. Each entry names clips, and optionally a face, a
morph, a `next` state and a `holdSeconds`:

| State | Clips | Notes |
|---|---|---|
| `idle` | Idle_B, Idle_B, Idle_D, Idle_B, Idle_A | compact: Idle_B only |
| `blocked` | Blocked_A | holds 120 seconds, then `drowsy` |
| `finished` | Done_B, Done_A | face happy, then `idle` |
| `failed` | Blocked_B | then `idle` |
| `approving` | Rotation_C | then `idle` |
| `waking` | Idle_B | face surprised, then `idle` after 1.6 seconds |
| `streaming` | Streaming_A/B/C | |
| `reading`, `working`, `coding`, `running`, `computing`, `controlling` | the Working set | |
| `logo` | Logo_A, Logo_B | |
| `showcase` | the four Marketing clips | |
| `turntable` | Rotation_B | a full spin, the closest thing to a preview |
| `orbit`, `radar`, `progress`, `spawning`, `dictating`, `sending`, `receiving`, `uploading`, `writing`, `alerting`, `bouncing`, `powering-down` | Idle_B | each with a morph of the same name |

A state with `next` and no `holdSeconds` is one-pass: `finished`, `failed` and
`approving` play their clips once and move on. Everything else loops. An unknown
state name is what the client makes it — `lo[name]` is undefined and the machine
throws — so check against `STATES`.

## Order

The machine does not play the declared order. It shuffles the state's clip list
with a generator seeded by the number you pass as `seed`, and pops from that
queue. The clip the state opens on starts at a random phase — `firstPhase: 0` pins
it — and every later play of a clip starts at phase 0. That is why two bots on
`idle` are never in step with each other, and why the same seed twice gives the
same run.

## Eyes and face

A blink key is not a held-shut eye. The client expands it into a lids ramp — shut
over part of a 0.26 second window, open over the rest — with a small overshoot on
reopening. The timings are recorded in the manifest as `blink-dur`, `close-full`,
`close-blink` and `reopen-peak`, and `eo` applies them; nothing in this package
re-derives them.

Faces come from the client's `ni` table through `ai` aliases, so a clip authored
with the lab's spelling lands on the right face. `holdFace`, `setExpression` and
`setEmphasis` on the driver are the three ways to change it.

## Still frames

`renderAvatarSvg` without `time` runs the client's own static procedure: pause,
rewind, then step `c_` times at `l_` seconds. With `time` it steps the driver and
machine to that moment at `1 / maxFrameRate`.

`d_()` reports the OS reduced-motion preference, and the client treats a
reduced-motion avatar exactly like a static one. `createAvatar` inherits that
behaviour from the component; you do not have to implement it.
