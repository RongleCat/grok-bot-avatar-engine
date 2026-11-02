<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/avatars-row-dark.png" />
    <img src="assets/avatars-row.png" alt="Five Grok Bot avatars: an orange cloud, a violet teardrop, a black circle, a green hexagon, and a blue squircle." width="640" height="92" />
  </picture>
</p>

<h1 align="center">grok-bot-avatar-engine</h1>

<p align="center"><strong>Grok Bot 头像引擎</strong></p>
<p align="center"><em>客户端渲染器移植 · 26 形体 · 53 状态 · 眼睛是挖空的 · 南瓜带柄</em></p>
<p align="center"><a href="https://ronglecat.github.io/grok-bot-avatar-engine/">https://ronglecat.github.io/grok-bot-avatar-engine/</a></p>

<p align="center">
  <a href="./README.md">English</a> ·
  <a href="./README_ZH.md">中文</a>
</p>

<p align="center">
  <a href="https://ronglecat.github.io/grok-bot-avatar-engine/"><img src="https://img.shields.io/badge/docs-guide%20%2B%20API-0ea5e9" alt="Docs" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
  <a href="https://github.com/RongleCat/grok-bot-avatar-engine/stargazers"><img src="https://img.shields.io/github/stars/RongleCat/grok-bot-avatar-engine?style=social" alt="GitHub stars" /></a>
  <img src="https://img.shields.io/badge/node-%3E%3D22.13-339933?logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/client-Grok%20Bot%200.78.1-lightgrey" alt="Grok Bot 0.78.1" />
  <img src="https://img.shields.io/badge/note-unofficial-yellow" alt="Unofficial" />
</p>

<p align="center">
  <a href="https://x.com/cgnot996"><img src="https://img.shields.io/badge/X-铁柱AGI%20%40cgnot996-black?logo=x&logoColor=white" alt="X 铁柱AGI" /></a>
  <img src="https://img.shields.io/badge/WeChat-铁柱AGI-07C160?logo=wechat&logoColor=white" alt="WeChat 铁柱AGI" />
  <a href="https://bot.tiezhu.si/"><img src="https://img.shields.io/badge/learn-bot.tiezhu.si-111111" alt="Grok Bot learning site" /></a>
</p>

<p align="center">
  <img src="assets/wechat/mp-search-scan.png" alt="WeChat Search 铁柱AGI — scan to follow the official account" width="420" />
  &nbsp;&nbsp;
  <img src="assets/wechat/community-group-qr.png" alt="Author WeChat QR — add to join the paid community" width="200" />
</p>

<p align="center"><sub>Left: WeChat official account <strong>铁柱AGI</strong>. Right: the author's personal WeChat. The paid community is invite-only — add this WeChat and ask to join.</sub></p>

---

> [!NOTE]
> **What this is.** grok-bot-avatar-engine is a **port of the Grok Bot client's own avatar renderer**, not a re-imagining of it. The renderer that draws the shapes, the eyes and the motion lives in `data/extracted/src/avatar-engine.js`: 600-odd declarations lifted out of the unpacked app bundle byte for byte, each one stamped with its bundle offset and sha1 by `tools/extract/closure.py`. `src/` holds readable transcriptions of the layers underneath (quaternion maths, mesh construction), and their tests run the bundle text and compare, so a transcription that drifts fails.
>
> It is **not an xAI product, not a Cursor product, and not the Grok Bot app** — it is someone else's code, kept here in ported form by [铁柱AGI](https://x.com/cgnot996). See [LICENSE](LICENSE) and [SECURITY.md](SECURITY.md).
>
> The same author builds [Grok App](https://github.com/RongleCat/grok-app), a desktop workbench for the local Grok Build CLI, and [grok-bot-sdk](https://github.com/RongleCat/grok-bot-sdk), the protocol client. Those are different programs.

---

## Install

Node.js **22.13 or newer**. ESM only. The runtime has zero npm dependencies.

```sh
npm install github:RongleCat/grok-bot-avatar-engine
```

```js
import { renderAvatarSvg } from 'grok-bot-avatar-engine';

document.querySelector('#bot').innerHTML = renderAvatarSvg({
  agentId: '33cf1aae-3a51-452d-b761-34a6ccb62201',
  state: 'working',
  size: 96,
});
```

That is the client's renderer: mesh projection, cut-out eyes, the pumpkin's ridges and stem, its motion driver. `renderAvatarSvg` and `createAvatar` are bindings over it and draw nothing themselves; `resolveAvatar`, `SHAPES`, `COLORS`, `STATES` and the rest read the client's own tables.

The bindings are not a wall. `grok-bot-avatar-engine/engine` is the transplanted renderer with its bundle names intact, for anything they do not cover:

```js
import { client } from 'grok-bot-avatar-engine';

const driver = client.eo({ body: 'pumpkin' });
client.go(driver, 'working', { seed: 20261101, isCompact: false, isResting: false });
driver.advance(1.2);
client.hp(client.Xg(driver.frame(), client.o_('#FF6700'), 96, 'bot', { displaySize: 96, extent: '100%' }));
```

Omit `time` for the frame the client settles a resting avatar on, or pass seconds to step the driver to that moment. A shape that pins its colour keeps it: a blue pumpkin still comes out orange.

In a browser, `createAvatar(element, options)` mounts the client's own component, so the frame cap, the hidden-tab skip, the off-screen pause and the pointer gaze come with it.

```sh
node examples/preview.mjs
node examples/showcase.mjs
```

The showcase is a file, not a server: `examples/showcase.html` opens in a browser with the engine inlined. Every pixel in it comes from `avatar-engine.js`, and the shape list, colour list, pinned-colour rule and state list are read out of the client's own tables (`ln`, `nn`, `cn`, `lo`).

## What the port covers

- **Renderer.** The client's mesh pipeline runs here: `Xg` → `Dp` → `Fp`/`Rp`/`Lp` → projection (`nl`, `ol`, `rl`), the even-odd polygon union (`ru`), the pumpkin's signed-distance field (`Ff`) and its stem (`Lf`), then `kp`/`hp` emit the SVG. Eyes are cut out, never painted: the mesh path punches them with an SVG mask, the flat path splices them into the body outline.
- **Bodies.** All 26 in the client's `ei` table, including the 25 picker shapes in `ln` and the aliases `i_` maps (blob→sphere, flower→starFlower, heart→heartChubby, star→star6).
- **Motion.** The client's stateful driver `eo` (springs, gaze, blink, poke, morph, rest) and its clip machine `go` over the `lo` state table — 53 states. Poses are quantized to the sprite resolution exactly as the client does, which is what makes its caches hit.
- **Identity.** `An`/`jn`/`Mn` resolve an agent id to shape and colour; `cn`/`ti` keep the pumpkin pinned to `orange` with no colour row offered.
- **Provenance.** `data/extracted/manifest.json` records every symbol, data table and literal with bundle, offset, length and sha1. `tools/extract/closure.py` rebuilds the engine from `closure-seeds.txt`; `tools/extract/loop.py` grows that list from the ReferenceErrors the render actually hits, so nothing is guessed in.

The front-view outline approximation that this package used to ship is deleted. A hard yaw is now a mesh turn, and the orange main-bot star is gone with it: `#f59312` turns out to be the `yellow/0` token in the app's theme palette, and no such star exists in the 0.78.1 renderer.

## Linked avatars

The character reacts to agent state through the client's own machine:

```js
import { eo, go, Xg, hp, o_ } from 'grok-bot-avatar-engine/engine';

const driver = eo({ body: 'cloud' });
const machine = go(driver, 'working', { seed: 20261101, isCompact: false, isResting: false });
driver.advance(1 / 60);
machine.advance(1 / 60);
const svg = hp(Xg(driver.frame(), o_('#FF309B'), 96, 'cloud', { displaySize: 96, extent: '100%' }));
```

`setState('finished')` plays the one-pass clip and moves on; `setCompact(true)` switches to the small-slot clips; `setGaze(rect, point)` turns the head toward the pointer; `d_()` makes the whole thing settle on a still frame under prefers-reduced-motion. All of that is the client's behaviour, not a re-creation of it.

The plate, ring, stack, badge and initials layer around the character is recorded in the manifest (`mark-svg`, `stack-layout`, `indicator-geometry`, `initials-*`) but is not ported yet.

Details worth knowing, from the same extraction:

- The id string is hashed as UTF-16, with hyphens and case left as they are; uppercase is a different character. The identity recipe did not change between 0.70.2 and 0.78.1.
- Explicit `avatarShape` and `avatarColor` override one field at a time. A picture URL replaces the character.
- The client carries no eye row for sphere or pumpkin, and the port uses the same stand-in for both.
- Clip order is the client's seeded shuffle, not the declaration order, and a one-pass state (`finished`, `failed`, `approving`) plays its clips once and then moves to its `next`.
- The client hides the pumpkin behind the `sand_pumpkin_2026` experiment; this package resolves it for every caller.

## Docs

Guide and API, in English and Chinese:

- English: https://ronglecat.github.io/grok-bot-avatar-engine/
- 中文: https://ronglecat.github.io/grok-bot-avatar-engine/zh/

```sh
npm install
npm test
npm run docs:dev
```

## Related projects

| Project | What it is |
|---|---|
| [grok-bot-sdk](https://github.com/RongleCat/grok-bot-sdk) | Protocol client for the Grok Bot 0.78.1 desktop API. It derives the avatar parameters and does not draw them. |
| [Grok App](https://github.com/RongleCat/grok-app) | Open-source desktop workbench for the local Grok Build CLI. [grok-app.com](https://grok-app.com) |
| [awesome-grok-bot](https://github.com/RongleCat/awesome-grok-bot) | Grok Bot community index |
| [Grok Bot learning site](https://bot.tiezhu.si/) | From zero to a bot team: install, routines, cases, usage |

## Author and community

| Channel | Where |
|---|---|
| X | [@cgnot996 (铁柱AGI)](https://x.com/cgnot996) |
| WeChat official account | Search **铁柱AGI**, or scan the left code above |
| Paid community | Add the author's WeChat with the right code, then ask to join |
| Learning site | [bot.tiezhu.si](https://bot.tiezhu.si/) |

The row at the top is drawn by this package: orange cloud, violet teardrop, black circle, green hex, blue squircle. It is not an xAI logo.

MIT License. Copyright 2026 RongleCat.
