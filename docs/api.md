# API

Everything visual comes out of the client renderer. The functions below are
bindings over it; they add no geometry, no colour maths and no motion.

```js
import {
  resolveAvatar,
  renderAvatarSvg,
  createAvatar,
  SHAPES,
  BODIES,
  COLORS,
  STATES,
  COMPACT_SIZE,
  bodyFor,
  colorValue,
  pinnedColor,
  paintOf,
  client,
} from 'grok-bot-avatar-engine';
```

## `renderAvatarSvg(options)`

Returns one `<svg>` string. Options are the client component's own prop names,
with `shape` / `color` as the readable spelling of `body` / `appearance`.

| Option | Default | Meaning |
|---|---|---|
| `shape` | | A name from `SHAPES`. Alias-resolved through `bodyFor` |
| `agentId` | | Derives shape and colour when `shape` is absent |
| `avatarShape`, `avatarColor` | | The client's own override fields |
| `color` | | A `COLORS` id, or any CSS colour |
| `state` | `'idle'` | A key of `STATES` |
| `time` | still frame | Seconds. Omit for the frame the client settles on, give a number to step the driver to that moment |
| `size` | `96` | CSS pixels |
| `seed` | the `id` | Clip shuffle and entry phase |
| `id` | `avatar-<shape>` | Namespaces the emitted defs. One per element on the page |
| `fill` | `.6` | Sprite coverage inside the box |
| `resolution` | from `fill` | Overrides the sprite size directly |
| `isStatic`, `isPlaying`, `maxFrameRate` | client defaults | Motion switches; `isStatic` takes the still path |
| `isProof` | `false` | The client's shaded-mesh debug view |
| `appearance` | built from the colour | The paint record, when `paintOf` is not enough |

Throws when neither a shape nor an agent id is given, and when neither a colour
nor an agent id is given. A shape that pins its colour keeps it: asking for a
blue pumpkin gets orange.

## `createAvatar(element, options)`

Mounts the client's own component into `element` and returns
`{ update, setState, setBody, setPlaying, setExpression, blink, look, restart, poke, gaze, destroy }`.
The frame cap, the `document.hidden` skip, the off-screen pause and the pointer
gaze are the component's behaviour, not a re-creation of it. Omit `size` to let
the element's box drive it, which is what the client does in a responsive slot.

## `resolveAvatar(agentId | input)`

Returns `{ shape, color }` from the client's gated resolver, so an explicit
`avatarShape: 'pumpkin'` survives instead of falling back to the derived shape.
Picture URLs are not this function's business: the app swaps in a photo above
the renderer, in code that is not part of the avatar engine.

## Tables and helpers

| Export | Client source |
|---|---|
| `SHAPES` | `ln`, the 26 picker names in order |
| `BODIES` | `ei`, the 26 names the renderer takes |
| `COLORS` | `nn`, `{ id, label, value }` |
| `STATES` | keys of `lo` |
| `COMPACT_SIZE` | `s_` (48), under which the compact clips take over |
| `bodyFor(shape)` | `i_`: blob to sphere, flower to starFlower, heart to heartChubby, star to star6 |
| `colorValue(id)` | `nn` lookup |
| `pinnedColor(shape)` | `cn`; in 0.78.1 only the pumpkin, which pins `orange` |
| `paintOf(ink, spot?)` | `o_`; one argument cuts the eyes out, two paints them |

## `client`

The transplanted renderer, undressed. `client.eo`, `client.go`, `client.Xg`,
`client.hp`, `client.p_` and the tables keep their bundle names, and
`data/extracted/avatar-engine.json` maps each one to its offset, length and
sha1 in the app. Reach for it when the bindings above do not cover what you
need; the types in `index.d.mts` describe the parts with a stable shape.

## Not ported

The plate, ring, stack, status badge and initials that sit around the character
are recorded with their offsets in `data/extracted/manifest.json`
(`mark-svg`, `stack-layout`, `indicator-geometry`, `initials-*`) and are not
exposed yet. The orange main-bot star is not in the 0.78.1 renderer at all.
