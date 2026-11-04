---
layout: home

hero:
  name: Grok Bot Avatar Engine
  text: The client's renderer, running outside the client
  tagline: 26 bodies, cut-out eyes, 53 motion states, the pumpkin with its stem. Ported from the Grok Bot 0.78.1 app, byte for byte. Unofficial.
  actions:
    - theme: brand
      text: Start
      link: /guide/start
    - theme: alt
      text: API
      link: /api
    - theme: alt
      text: 中文
      link: /zh/

features:
  - title: Not a re-creation
    details: The renderer is the app's own declarations, lifted out of the bundle untouched with an offset and sha1 per symbol. `renderAvatarSvg` and `createAvatar` bind it; they draw nothing themselves.
  - title: Real mesh silhouettes
    details: Revolve, loft, extrude, ball cluster, or a raymarched signed-distance field, then projected. A hard yaw is a turn, not a squeeze. Crystal is a union, so is cloud.
  - title: Eyes are holes
    details: Nothing paints an eye. The mesh path punches it through an SVG mask, the flat path splices it into the outline, and the page shows through either way.
  - title: The whole state table
    details: "The client's stateful driver and clip machine, 53 states over 28 clips, with seeded shuffle, blinks, pointer gaze, and poses quantized the way the app quantizes them."
---

## Community

The author is [铁柱AGI on X (@cgnot996)](https://x.com/cgnot996). The protocol client for the same desktop app is [grok-bot-sdk](https://github.com/RongleCat/grok-bot-sdk). The desktop workbench for local Grok Build is [Grok App](https://github.com/RongleCat/grok-app). The course that walks through Grok Bot itself is the [learning site](https://bot.tiezhu.si/).

<p>
  <img src="/wechat/mp-search-scan.png" alt="WeChat Search 铁柱AGI" width="420" />
  &nbsp;&nbsp;
  <img src="/wechat/wechat-qr.png" alt="Author WeChat QR for the paid community" width="200" />
</p>

Search **铁柱AGI** for the WeChat official account. The right code is the author's personal WeChat. The paid community is joined by adding that account and asking to be invited.
