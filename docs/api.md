# API

```js
import {
  resolveAvatar,
  renderAvatarSvg,
  createAvatar,
  poseAt,
  bodyPath,
  SHAPES,
  PALETTE,
  STATES,
} from 'grok-bot-avatar-engine';
```

## `resolveAvatar(agentId | input)`

Returns the character for a cloud agent id.

| Field | Meaning |
|---|---|
| `algorithmVersion` | `'grok-bot-0.70.2'` |
| `kind` | `'character'` or `'picture'` |
| `shape`, `color` | Public ids |
| `baseHex`, `lightHex`, `darkHex` | Palette entry |
| `sources.shape`, `sources.color` | `'explicit'` or `'id-default'` |
| `picture` | `{ url, version }` or `null` |
| `hash`, `shapeHash`, `shapeIndex`, `colorIndex` | The integer recipe |

Throws `AVATAR_AGENT_ID_REQUIRED` when the id is missing.

## `renderAvatarSvg(options)`

Returns one SVG string. Useful options:

| Option | Default | Meaning |
|---|---|---|
| `agentId` | | Derive shape and color |
| `shape`, `color` | blob, blue | Used when there is no id. Override an id when set |
| `avatarShape`, `avatarColor`, `avatarUrl`, `avatarDataUrl`, `avatarVersion` | | Same fields as `resolveAvatar` |
| `theme` | `'light'` | Picks `lightHex` or `darkHex` |
| `ink` | from the color | Any SVG color. Quotes are escaped |
| `state` | `'idle'` | A key of `STATES` |
| `time` | `0` | Seconds |
| `size` | `120` | Pixel width and height |
| `main` | `false` | Orange star and cutout |
| `compact` | `true` when `size < 48` | Idle uses Idle_B only |
| `reducedMotion` | `false` | Forces time 0 |
| `id` | generated | Mask and clip ids. Set it when you compose several SVGs by hand |
| `forceCharacter` | `false` | Draw the character even if `avatarUrl` is set |

Throws `AVATAR_SHAPE_UNKNOWN:<name>` for a shape outside the catalog, and `AVATAR_COLOR_UNKNOWN` for a color outside the palette.

## `createAvatar(element, options)`

Writes the SVG into `element` on each animation frame. Returns `{ setState(name), update(partial), destroy() }`. `setState` restarts the clock. Throws `AVATAR_DOM_REQUIRED` outside a browser.

## `poseAt(state, time, { compact })`

Returns `{ clip, face, morph, x, y, turn, yaw, scale, squashX, squashY, blink, look, eyeScaleX, eyeScaleY, tilt }`.

## `bodyPath(shape)`

The fitted outline `d` in the 228.44 canvas. `outlineSamples(shape)` returns the sampled points used to place the eyes.

## Constants

`SHAPES`, `DEFAULT_SHAPES`, `BODIES`, `FACES`, `STATES`, `PALETTE`, `DEFAULT_COLORS`, `EYE_SEATS`, `EYE_REFERENCE`, `EYE_UNIT`, `CLIP_NAMES`, `BADGE_SPEC`, `VIEWBOX` (60), `CANVAS` (`{ center: 114.2705, target: 228.44 }`).
