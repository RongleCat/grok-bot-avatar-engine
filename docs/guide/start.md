# Start

Node.js 22.13 or newer. ESM only. The runtime has zero npm dependencies.

The package is published from GitHub. It is not on the npm registry.

```sh
npm install github:RongleCat/grok-bot-avatar-engine
```

Draw one frame:

```js
import { renderAvatarSvg } from 'grok-bot-avatar-engine';

const svg = renderAvatarSvg({
  agentId: '33cf1aae-3a51-452d-b761-34a6ccb62201',
  state: 'idle',
  size: 120,
});
```

Omit `time` and you get the frame the client settles a resting avatar on. Give
`time: 1.2` and the driver is stepped to that moment the way the play loop steps
it. The id resolves through the client's own recipe, so the shape and the colour
are the ones that bot has in the app.

Mount a live avatar:

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

`createAvatar` attaches the client's own component, so the frame cap, the
`document.hidden` skip and the off-screen pause come with it. Omit `size` to let
the element's box drive it. `renderAvatarSvg` works in Node with no DOM at all.

From this repo:

```sh
node examples/render-svg.mjs <agent-id> idle 1.2 > /tmp/bot.svg
node examples/sheet.mjs
node examples/showcase.mjs
node examples/preview.mjs
```

`examples/showcase.mjs` writes `examples/showcase.html`, a self-contained page
with the engine inlined: the shape picker, the colour picker, the state list and
the pointer gaze. `examples/preview.mjs` serves `http://127.0.0.1:4174` and
imports `src/index.mjs` from your working tree, so it shows what you are
editing. Open it over HTTP; a `file://` page cannot import the package modules.

## What you get

| Piece | Where it comes from |
|---|---|
| Bodies | The 26 names in the client's `ei` table, projected from their meshes |
| Shapes | The 26 picker names in `ln`, with `i_` mapping blob, flower, heart and star |
| Colour | The 11 entries in `nn`; the pumpkin pins `orange` and gets no colour row |
| Eyes | Cut out, never painted: an SVG mask on the mesh path, spliced subpaths on the flat one |
| States | The 53 keys of `lo` over 28 clips |
| Motion | The client's driver `eo` and clip machine `go`, including the seeded shuffle |
| Identity | `jn`, the gated resolver, so an explicit pumpkin survives |
| Pumpkin | The client's own signed-distance field and stem mesh, resolved for every caller |

## What this is not

This is a port of the desktop client's renderer, not a re-creation of it. The
declarations in `data/extracted/src/avatar-engine.js` are the app's own bytes,
cut out of the bundle with their offsets recorded. The code in `src/` binds and
drives that renderer; it does not draw anything itself.

Two things the older documentation promised are gone with the front-view
approximation they came from. A hard yaw is now a real mesh turn, not a
horizontal squeeze. And the orange main-bot star is not in the 0.78.1 renderer at
all — `#f59312` is just the `yellow/0` token in the app's theme palette — so this
package no longer offers a `main` option.

The plate, ring, stack, status badge and initials that sit around the character
are the client's own composition and are not ported yet; their symbols are
recorded in `data/extracted/manifest.json`.

This package does not log in, call the network, or read your Grok Bot install.
Picture URLs are handled by the app above the renderer, so nothing here takes
one.

It is maintained by [铁柱AGI](https://x.com/cgnot996). It is not an xAI product,
not a Cursor product, and not part of [Grok App](https://github.com/RongleCat/grok-app).
