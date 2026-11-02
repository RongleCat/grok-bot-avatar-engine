// Which solid each body becomes, ported from the client's silhouette table.
// _l @295600 and its shared extrusion default gl @295581, both recorded in
// data/extracted/manifest.json.

const EXTRUSION = Object.freeze({ kind: 'extrusion', halfDepth: 0.36, bevel: 0.22 });

export const SILHOUETTES = Object.freeze({
  cloud: Object.freeze({ kind: 'loft', depth: 0.72 }),
  square: EXTRUSION,
  sparkle: EXTRUSION,
  clover: EXTRUSION,
  heartChubby: Object.freeze({ kind: 'loft', depth: 0.62 }),
  starFlower: EXTRUSION,
  teardrop: Object.freeze({ kind: 'revolve' }),
  tablet: Object.freeze({ kind: 'pill', axis: 0 }),
  wedge: Object.freeze({ kind: 'revolve' }),
  house: EXTRUSION,
  star6: Object.freeze({ kind: 'extrusion', halfDepth: 0.3, bevel: 0.18 }),
  pebble: Object.freeze({ kind: 'revolve' }),
  bean: Object.freeze({ kind: 'inscribedBalls' }),
  egg: Object.freeze({ kind: 'revolve' }),
  squircle: Object.freeze({ kind: 'roundedSlab', halfDepth: 0.28, edge: 0.11 }),
  capsule: Object.freeze({ kind: 'pill', axis: 1 }),
  cylinder: Object.freeze({ kind: 'revolve' }),
  hex: EXTRUSION,
  gem: Object.freeze({ kind: 'revolve' }),
  crystal: Object.freeze({ kind: 'crystal' }),
  shield: Object.freeze({ kind: 'revolve' }),
  dome: Object.freeze({ kind: 'revolve' }),
  arch: Object.freeze({ kind: 'revolve' }),
  leaf: Object.freeze({ kind: 'revolve' }),
  sphere: Object.freeze({ kind: 'revolve' }),
  pumpkin: Object.freeze({ kind: 'field' }),
});

export const BODY_SCALES = Object.freeze({
  pebble: 1.2168, bean: 1.17, egg: 1.17, squircle: 1.17, tablet: 1.3923, capsule: 1.17,
  cylinder: 1.17, hex: 1.2519, gem: 1.17, crystal: 1.3806, wedge: 1.359072, shield: 1.17,
  dome: 1.17, arch: 1.17, cloud: 1.3455, teardrop: 1.318122, leaf: 1.17, square: 1.0413,
  starFlower: 1.3923, sparkle: 1.521, clover: 1.0881, heartChubby: 1.3572, house: 1.17,
  star6: 1.4976,
});

export function silhouetteFor(body) {
  return SILHOUETTES[body] ?? EXTRUSION;
}
