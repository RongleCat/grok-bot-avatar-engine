<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/avatars-row-dark.png" />
    <img src="assets/avatars-row.png" alt="Five Grok Bot avatars: an orange cloud, a violet teardrop, a black circle, a green hexagon, and a blue squircle." width="640" height="92" />
  </picture>
</p>

<h1 align="center">grok-bot-avatar-engine</h1>

<p align="center"><strong>Grok Bot 头像引擎</strong></p>
<p align="center"><em>Agent id · 25 shapes · 28 motion clips · SVG · the main-bot star</em></p>
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
  <img src="https://img.shields.io/badge/client-Grok%20Bot%200.70.2-lightgrey" alt="Grok Bot 0.70.2" />
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
> **About this engine.** grok-bot-avatar-engine draws the Grok Bot character set as SVG: the agent-id recipe, the outlines, the eye seats, the 28 motion clips, and the main-bot star. It is an independent library by [铁柱AGI](https://x.com/cgnot996). It is **not an xAI product, not a Cursor product, and not the Grok Bot app**.
>
> The same author builds [Grok App](https://github.com/RongleCat/grok-app), a desktop workbench for the local Grok Build CLI, and [grok-bot-sdk](https://github.com/RongleCat/grok-bot-sdk), the protocol client. Those are different programs.

---

## Install

Node.js **22.13 or newer**. ESM only. The runtime has zero npm dependencies.

```sh
npm install github:RongleCat/grok-bot-avatar-engine
```

```js
import { resolveAvatar, renderAvatarSvg, createAvatar } from 'grok-bot-avatar-engine';

const avatar = resolveAvatar('33cf1aae-3a51-452d-b761-34a6ccb62201');
// cloud, brown

document.querySelector('#bot').innerHTML = renderAvatarSvg({
  agentId: avatar.agentId,
  state: 'working',
  time: 1.2,
  size: 96,
  main: true,
});
```

`main: true` punches the orange star into the silhouette. The disc is 16 units on a 60 viewBox, the hole is 2.7 wider than the disc, and the ratios stay put when you change `size`.

In a browser, `createAvatar(element, options)` plays the clip with `requestAnimationFrame`. `setState('finished')` restarts the clock.

```sh
node examples/preview.mjs
```

Open `http://127.0.0.1:4174`.

## What matches Grok Bot 0.70.2

- The id string is hashed as UTF-16, with hyphens and case left as they are. Uppercase is a different character. Black is explicit only.
- Explicit `avatarShape` and `avatarColor` override one field at a time. A picture URL replaces the character.
- Twenty-two outline paths match that client's outline builder, including cloud, heart, sparkle, shield, and the six-point star.
- The eye table uses the same design fractions. Hex is the reference capsule.
- The state list and the 28 clips are the same list, including the 120 second blocked hold and the compact idle clip under 48px.
- The star color is `#f59312`.

The desktop client then revolves, lofts, or extrudes those outlines into a mesh. This package draws the front view in SVG. A still character facing you has the same silhouette. A large yaw is a squeeze here and a mesh turn there. Blob is the circle you see from the front of the sphere. Crystal is the fourteen separate discs of the ball cluster. Flower is the six-petal union the client extrudes.

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
| [grok-bot-sdk](https://github.com/RongleCat/grok-bot-sdk) | Protocol client for the Grok Bot 0.70.2 desktop API. It derives the avatar parameters and does not draw them. |
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
