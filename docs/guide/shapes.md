# Shapes and colour

```js
import { SHAPES, BODIES, COLORS, bodyFor, pinnedColor, colorValue } from 'grok-bot-avatar-engine';

SHAPES.length;        // 26, the picker list (ln) in the client's order
BODIES.length;        // 26, what the renderer takes (ei)
bodyFor('flower');    // 'starFlower'
COLORS[3];            // { id: 'orange', label: 'Orange', value: '#FF6700' }
pinnedColor('pumpkin'); // 'orange'
```

Four picker names are aliases of a body: `blob` is the sphere, `flower` is
`starFlower`, `heart` is `heartChubby`, `star` is `star6`. `bodyFor` is the
client's own map (`i_`), not a list kept here.

## How a body is drawn

The client builds each body as a solid and projects it; this package runs that
same code. A silhouette is one of the kinds in the client's `_l` table —
revolve, loft, extrusion, rounded slab, pill, inscribed balls, crystal, or a
signed-distance field — and the projection turns it into the outline you see, so
a large yaw is a mesh turn rather than a squeeze.

Two numbers shape every outline: the fit centres the contour on `L` and scales it
to a target radius, clamped to a range. Both are read from the bundle, and their
offsets are in `data/extracted/manifest.json` as `canvas-centre`, `fit-params`
and `fit-apply`.

`crystal` is a cluster of balls, so its outline is several loops that the
client's union pass (`ru`, an even-odd merge) resolves into one path. `cloud` and
`clover` are unions too. This is why a body can carry more than one `<path>`.

`pumpkin` is the one body the client does not build from a contour. It raymarches
a superellipsoid with ridges, takes the widest surface point across tilt bands,
and adds a separate stem mesh painted from its own two-tone table. Every constant
in that walk is in the manifest: `pumpkin-radius`, `pumpkin-silhouette`,
`pumpkin-contours`, `pumpkin-contour-walk`, `pumpkin-stem` and `pumpkin-paints`.
The stem is why a pumpkin is never a single path.

## Eyes are cut out

Nothing paints an eye. On the mesh path the emitter writes a `<mask>` — a white
rect minus the eye shapes — and the body is drawn through it, so the page shows
through the eyes. On the flat path the eye loops are spliced into the body
outline as extra subpaths. Both are the client's code; the difference is which
renderer a body goes to.

The eye seats come from the client's `Oo` table (`eye-seats` in the manifest),
with `Do` as the reference capsule. That table has no row for the sphere and none
for the pumpkin, and the client projects eye shapes onto those surfaces instead.

## Colour

`COLORS` is the client's `nn` table: eleven ids, one flat hex each. There is no
light and dark variant for an avatar body — the `light-dark()` pairs in the
bundle belong to UI ink, not to the character.

```js
renderAvatarSvg({ shape: 'pumpkin', color: 'blue', size: 96 }); // still orange
```

`pinnedColor` reads the client's `cn` table. In 0.78.1 the pumpkin is the only
entry, it pins `orange`, and it sits behind the `sand_pumpkin_2026` experiment.
The avatar editor drops the whole colour row for a pinned shape, which is what
`showcase.html` does too.

## Not here

The orange main-bot star is not part of the 0.78.1 renderer. `#f59312` is the
`yellow/0` token in the app's theme palette, and the star that older versions of
this package drew was built from the front-view approximation, not from the
client. It is gone with that code.

![Twenty-six shapes](/shapes.png)
