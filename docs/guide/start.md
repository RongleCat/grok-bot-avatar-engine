# Start

Node.js 22.13 or newer. ESM only. The runtime has zero npm dependencies.

The package is published from GitHub. It is not on the npm registry.

```sh
npm install github:RongleCat/grok-bot-avatar-engine
```

Draw one still frame:

```js
import { renderAvatarSvg } from 'grok-bot-avatar-engine';

const svg = renderAvatarSvg({
  agentId: '33cf1aae-3a51-452d-b761-34a6ccb62201',
  state: 'idle',
  time: 0,
  size: 120,
  main: true,
});
```

That id is a cloud in brown. `main: true` adds the orange star and cuts a hole out of the body so the star sits in the silhouette. `time` is seconds from the start of the state.

Mount a live avatar in the browser:

```js
import { createAvatar } from 'grok-bot-avatar-engine';

const avatar = createAvatar(document.querySelector('#bot'), {
  agentId: '33cf1aae-3a51-452d-b761-34a6ccb62201',
  state: 'working',
  size: 88,
});

avatar.setState('finished');
avatar.destroy();
```

`createAvatar` needs `requestAnimationFrame`. In Node, use `renderAvatarSvg` and advance `time` yourself.

From this repo:

```sh
node examples/render-svg.mjs <agent-id> idle 0 > /tmp/bot.svg
node examples/preview.mjs
```

The preview serves `http://127.0.0.1:4174` and plays every shape. Open it over HTTP. A `file://` page cannot import the clip data.

## What you get

| Piece | Behavior |
|---|---|
| Identity | FNV-1a over the agent id string, then one of 8 shapes and one of 10 colors |
| Outlines | Fitted SVG paths. 22 of them match the Grok Bot 0.70.2 outline builder |
| Eyes | Dark capsules, a small white highlight, seats scaled from the 0.70.2 eye table |
| Motion | 28 clips and the state list, including the 120 second blocked hold |
| Star | Disc 16, cutout 2.7, on a 60 viewBox. Orange `#f59312`, white star, hairline `#1c1c1c` |

## What this is not

The Grok Bot desktop client paints these bodies as a 3D mesh: revolution, loft, or extrusion, then a projected eye capsule. This library draws the front-view outline and plays the same clips in SVG. A still, front-facing character is the same silhouette. A hard yaw is a horizontal squeeze here, and a turn in the mesh there. Cloud volume and star thickness are flat.

This package does not ship the desktop client's renderer, and it does not log in or call the network.

It is an independent library by [铁柱AGI](https://x.com/cgnot996). It is not an xAI product, not a Cursor product, and not part of [Grok App](https://github.com/RongleCat/grok-app).
