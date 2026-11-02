# Agent id

Pass the cloud agent id exactly as the string you stored. Do not strip hyphens,
trim, or change case. `33cf1aae-…` and `33CF1AAE-…` are two different characters,
because the hash walks UTF-16 code units. A numeric id is hashed as that digit
string, not as an integer.

```js
import { resolveAvatar } from 'grok-bot-avatar-engine';

resolveAvatar('agent_01');            // { shape: 'blob', color: 'yellow' }
resolveAvatar({ agentId: 'x', avatarShape: 'pumpkin' }); // pumpkin survives
```

`resolveAvatar` is the client's own `jn`: derive both fields from the id, then
let an explicit `avatarShape` or `avatarColor` replace just its own field. It is
`jn` and not `An` because `An` only accepts the 25 ordinary picker names, so an
explicit pumpkin — a gated shape — would silently fall back to the derived one.

## What the derivation reads

| Field | Client symbol | Pool it indexes |
|---|---|---|
| shape | `Dn` | `dn`, the eight flat-list names: blob, pebble, squircle, tablet, wedge, hex, cloud, teardrop |
| colour | `Tn` | `_n`, ten names: brown, red, orange, yellow, green, cyan, blue, violet, magenta, gray |
| mesh shape | `Mn` | `fn`, the thirteen the 3D client picks from: blob, cloud, square, sparkle, clover, heart, flower, teardrop, tablet, wedge, house, star, hex |

Both start from the same FNV-1a over those code units — `2166136261` seeded,
`16777619` mixed, `Math.imul`, unsigned right shift, which is `bn` (and its twin
`u_`) — and then each path mixes again before it indexes: `En` for the shape, and
`xn`/`Cn` for the colour, where `Cn` draws one Mulberry32 sample and floors it
into `_n.length`. So the two fields are independent draws of one hash, not one
number read two ways. **Black is in `COLORS` but not in `_n`**, and `Cn` is bounded
to that pool: an id can never come out black, only an explicit
`avatarColor: 'black'` can.

A bot whose row in the sidebar was drawn from the flat list and whose 3D character
came from the mesh pool can disagree with itself. That is the client's behaviour,
not a bug to reconcile. `resolveAvatar` gives the flat answer; `client.Mn` gives
the mesh one.

## Neither pool contains pumpkin

`cn` records it with `pickerGate: 'sand_pumpkin_2026'`, and the app only reaches
it when the flag is on and the shape was set by hand. This package has no flag:
`resolveAvatar({ agentId, avatarShape: 'pumpkin' })` works for any caller, and
`renderAvatarSvg` keeps the pinned orange whatever colour was asked for.

## Picture URLs are not here

The app swaps in a photo above the renderer: `avatarUrl`, `avatarDataUrl` and
`avatarPhoto` are handled in its own bundle, and none of them reach the avatar
engine. This package takes a shape and a colour and returns an SVG. If you store
a picture, decide that yourself before calling.
