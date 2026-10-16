# Shapes and color

`SHAPES` is the editor order, 25 names. `DEFAULT_SHAPES` is the 8 the id can pick. `toBody` maps the public name onto the outline id: `blob` to `sphere`, `flower` to `starFlower`, `heart` to `heartChubby`, `star` to `star6`.

```js
import { SHAPES, bodyPath, PALETTE, inkFor } from 'grok-bot-avatar-engine';

bodyPath('cloud');
inkFor('brown', 'light'); // #A27952
inkFor('brown', 'dark');  // #855C36
```

`inkFor` throws `AVATAR_COLOR_UNKNOWN` for a name outside `PALETTE`. Black's light ink is `#000000` and its dark ink is `#FFFFFF`.

## How the outline is built

Every catalog path is constructed, then fitted into a box of 228.44 centered at 114.2705. The fit shifts the bbox onto that center and scales it into `[0.9, 1.35]`. `bodyPath(shape)` returns that fitted `d`.

These constructions match the Grok Bot 0.70.2 outline builder path for path:

| Body | Construction |
|---|---|
| pebble, bean, egg, leaf | Closed polar sample, smoothed to cubics |
| squircle, gem | Superellipse |
| square, hex, house, wedge | Rounded polygon |
| tablet, capsule, cylinder, dome, arch | Bezier arcs |
| shield | Four cubics |
| cloud, clover | Union of circles |
| teardrop | Rounded tip into a circular foot |
| heart, sparkle, star | The shipped vector, then the same fit |

`blob` is a circle of radius 108, then the same fit. The desktop client revolves a sphere. The front view is that circle.

`crystal` is fourteen separate front-view circles, the same non-overlapping ball cluster the client meshes. A single union from the center pinches on the empty rays, so each disc stays its own subpath. `flower` is the six-petal union sampled at 240 angles. The client extrudes that petal outline. The front view is the union.

`bodyPath('nope')` throws `AVATAR_SHAPE_UNKNOWN:nope`.

![Twenty-five shapes at idle](/shapes.png)

## Eyes

The eye table stores the 0.70.2 design fractions. Hex is the reference: width 0.26, height 0.57, gap 0.64. Every other body is scaled from that reference onto one SVG capsule (`EYE_UNIT`). Positive `shiftY` moves the pair up. Heart and wedge use a narrower capsule (`squashX` 0.6 and 0.55).

Eyes are `#141414` with a small white highlight. They are not a separate pupil.

## The star

On a 60-unit viewBox the disc has diameter 16 and its center is at `(52, 52)`, flush to the bottom right. The hole radius is `8 + 2.7`. The disc is `#f59312`, the star is white, and the hairline is `#1c1c1c` at stroke width 0.6. The body and the eyes are masked by the hole. The star is not.

`size` only changes the SVG width and height. It does not change these ratios. Below 48, or with `compact: true`, idle uses the compact clip list. That flag does not resize the star.
