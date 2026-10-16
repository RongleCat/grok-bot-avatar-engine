# Agent id

Pass the cloud agent id exactly as the string you stored. Do not strip hyphens, trim, or change case. `33cf1aae-…` and `33CF1AAE-…` are two different characters. A numeric id is hashed as that digit string, not as an integer.

```js
import { resolveAvatar } from 'grok-bot-avatar-engine';

const avatar = resolveAvatar('33cf1aae-3a51-452d-b761-34a6ccb62201');
// shape cloud, color brown, kind character
```

The recipe is `grok-bot-0.70.2`:

1. FNV-1a 32-bit over the UTF-16 code units, with `Math.imul`.
2. A second mix of that hash picks the shape: `shapeHash % 8` into `blob`, `pebble`, `squircle`, `tablet`, `wedge`, `hex`, `cloud`, `teardrop`.
3. One Mulberry32 sample picks the color: `floor(random * 10)` into brown, red, orange, yellow, green, cyan, blue, violet, magenta, gray. Black is explicit only.

Empty strings throw `AVATAR_KEY_REQUIRED` from `hashBotId` and `AVATAR_AGENT_ID_REQUIRED` from `resolveAvatar`.

## Overrides

Shape and color override on their own. An unknown shape or unknown color is ignored and the id wins that field.

```js
resolveAvatar({
  agentId: '33cf1aae-3a51-452d-b761-34a6ccb62201',
  avatarShape: 'hex',
  avatarColor: 'black',
});
```

A non-empty `avatarUrl` or `avatarDataUrl`, or a non-empty `avatarVersion`, sets `kind` to `picture`. `renderAvatarSvg` draws the URL when there is one. `avatarVersion` alone does not invent a URL. Pass `forceCharacter: true` to keep the character beside a URL.

`renderAvatarSvg({ shape: 'hex', color: 'green' })` skips the id and draws that character. The default without an id is a blue blob, which is only a demo default.
