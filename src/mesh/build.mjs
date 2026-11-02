// Mesh construction ported from the client avatar renderer.
// Offsets and content hashes live in data/extracted/manifest.json; the parity
// tests execute the bundle text itself, so these functions are checked against
// the client's code rather than against a reading of it.

export const CANVAS_CENTRE = 114.2705; // L @255266
export const TAU = Math.PI * 2; // Js @278891
export const LOFT_RINGS = 16; // rc @278957
export const LOFT_RESAMPLE = 160; // ic @278963
export const LOFT_POWER = 0.72; // nc @278950
export const BALL_GRID = 40; // tc @278944
export const REVOLVE_RADIAL = 64; // $s @278932
export const SCAN_BUCKETS = 64; // oc @278977
export const SCAN_EPSILON = 1e-5; // sc @278983

const clamp = (value, low, high) => (value < low ? low : value > high ? high : value); // cs @264086

/**
 * Dc @283693 — a lookup that answers "how wide is this contour at height y".
 * The client buckets segments by span so a revolve can ask for the width at
 * each latitude without scanning the whole outline.
 */
export function contourSpan(points) {
  const count = points.length;
  let low = Infinity;
  let high = -Infinity;
  for (const [, y] of points) {
    if (y < low) low = y;
    if (y > high) high = y;
  }
  low -= SCAN_EPSILON;
  high += SCAN_EPSILON;
  const bucket = (value) => Math.min(SCAN_BUCKETS - 1, Math.floor(((value - low) / (high - low)) * SCAN_BUCKETS));
  const buckets = Array.from({ length: SCAN_BUCKETS }, () => []);
  for (let index = 0; index < count; index++) {
    const start = points[index][1];
    const end = points[(index + 1) % count][1];
    const last = bucket(Math.max(start, end) + SCAN_EPSILON);
    for (let at = bucket(Math.min(start, end) - SCAN_EPSILON); at <= last; at++) buckets[at].push(index);
  }
  return (y) => {
    let minX = Infinity;
    let maxX = -Infinity;
    if (!(y >= low && y <= high)) return maxX - minX;
    for (const index of buckets[bucket(y)]) {
      const [x0, y0] = points[index];
      const [x1, y1] = points[(index + 1) % count];
      if (Math.abs(y1 - y0) < 1e-9) {
        if (Math.abs(y0 - y) < 1e-6) {
          minX = Math.min(minX, x0, x1);
          maxX = Math.max(maxX, x0, x1);
        }
        continue;
      }
      if ((y0 <= y && y1 >= y) || (y1 <= y && y0 >= y)) {
        const at = x0 + ((x1 - x0) * (y - y0)) / (y1 - y0);
        if (at < minX) minX = at;
        if (at > maxX) maxX = at;
      }
    }
    return maxX - minX;
  };
}

/** Ac @285029 — one ring of a solid of revolution at height y with radius r. */
export function ringPoints(y, radius) {
  const ring = [];
  for (let index = 0; index < REVOLVE_RADIAL; index++) {
    const angle = (index / REVOLVE_RADIAL) * TAU;
    ring.push({ x: radius * Math.sin(angle), y, z: radius * Math.cos(angle) });
  }
  return ring;
}

/** kc @284306 — revolves a front-view contour about the vertical axis. */
export function revolve(points) {
  let low = Infinity;
  let high = -Infinity;
  for (const [, y] of points) {
    if (y < low) low = y;
    if (y > high) high = y;
  }
  const rings = [];
  const top = -(low - CANVAS_CENTRE) / CANVAS_CENTRE;
  const bottom = -(high - CANVAS_CENTRE) / CANVAS_CENTRE;
  const span = contourSpan(points);
  const radiusAt = (y) => {
    const value = span(y);
    return value < 0 ? 0 : value / 2 / CANVAS_CENTRE;
  };
  const height = high - low;
  const join = (yEdge, sign) => {
    if (radiusAt(yEdge) >= 0.06) return null;
    const base = radiusAt(yEdge);
    let distance = height * 0.02;
    for (let step = height / 512; step <= height * 0.05; step += height / 512) {
      if (Math.abs(radiusAt(yEdge + sign * step) - base) > 1e-4) {
        distance = step;
        break;
      }
    }
    return { yEdge, sign, dJoin: distance, rJoin: radiusAt(yEdge + sign * distance) };
  };
  const joins = [join(low, 1), join(high, -1)].filter((entry) => entry !== null);
  const pinch = (y) => {
    let radius = radiusAt(y);
    for (const entry of joins) {
      const along = (y - entry.yEdge) * entry.sign;
      if (along >= 0 && along < entry.dJoin) {
        radius = Math.min(radius, (entry.rJoin * Math.sqrt(along / entry.dJoin)));
      }
    }
    return radius;
  };
  const push = (y, at) => {
    const radius = pinch(at);
    if (radius < 0.06) rings.push({ x: 0, y, z: 0 });
    else rings.push(...ringPoints(y, radius));
  };
  push(top, low);
  for (let step = 1; step < 95; step++) {
    const weight = (1 - Math.cos((step / 95) * Math.PI)) / 2;
    const at = low + (high - low) * weight;
    const radius = pinch(at);
    const y = -(at - CANVAS_CENTRE) / CANVAS_CENTRE;
    if (radius < 1e-4) rings.push({ x: 0, y, z: 0 });
    else rings.push(...ringPoints(y, radius));
  }
  push(bottom, high);
  return rings;
}

/** Rc @287145 — lofts a contour through depth, used by cloud and heartChubby. */
export function loft(points, depth) {
  const stride = points.length / LOFT_RESAMPLE;
  const ring = stride > 1
    ? Array.from({ length: LOFT_RESAMPLE }, (_, index) => points[Math.floor(index * stride)])
    : points;
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const point of ring) {
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
    minY = Math.min(minY, point.y);
    maxY = Math.max(maxY, point.y);
  }
  const centre = { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
  const rings = [];
  for (let step = 0; step <= LOFT_RINGS; step++) {
    const angle = -Math.PI / 2 + (Math.PI * step) / LOFT_RINGS;
    const scale = Math.max(0, Math.cos(angle)) ** LOFT_POWER;
    const z = depth * Math.sin(angle);
    rings.push(ring.map((point) => ({
      x: centre.x + (point.x - centre.x) * scale,
      y: centre.y + (point.y - centre.y) * scale,
      z,
    })));
  }
  return { rings, center: centre, depth };
}

/**
 * Fc @285672 — the largest circles that fit inside a contour, thinned so the
 * ball cloud does not double up. Takes sampled outline points; the client
 * reaches them through `z(body)`, which this package does at the emit layer.
 */
export function inscribedBalls(points) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const [x, y] of points) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
  const inside = (x, y) => {
    let hit = false;
    const count = points.length;
    for (let index = 0, previous = count - 1; index < count; previous = index++) {
      const [xi, yi] = points[index];
      const [xj, yj] = points[previous];
      if (yi > y !== yj > y && x < xi + ((xj - xi) * (y - yi)) / (yj - yi)) hit = !hit;
    }
    return hit;
  };
  const step = Math.max(maxX - minX, maxY - minY) / BALL_GRID;
  const found = [];
  for (let y = minY + step / 2; y < maxY; y += step) {
    for (let x = minX + step / 2; x < maxX; x += step) {
      if (!inside(x, y)) continue;
      let nearest = Infinity;
      for (const [px, py] of points) nearest = Math.min(nearest, (px - x) ** 2 + (py - y) ** 2);
      const radius = Math.sqrt(nearest);
      if (radius > step) found.push({ x, y, r: radius });
    }
  }
  found.sort((a, b) => b.r - a.r);
  const kept = [];
  for (const ball of found) {
    if (!kept.some((other) => Math.hypot(ball.x - other.x, ball.y - other.y) + ball.r <= other.r + step * 0.25)) {
      kept.push(ball);
    }
  }
  return kept.map((ball) => [(ball.x - CANVAS_CENTRE) / CANVAS_CENTRE, -((ball.y - CANVAS_CENTRE) / CANVAS_CENTRE), 0, ball.r / CANVAS_CENTRE]);
}

/** Ec @283305 — the crystal body: fourteen balls, sampled as one point cloud. */
export function crystalBalls() {
  const radius = 0.12;
  const centres = [{ x: 0, y: 1.04, z: 0 }, { x: 0, y: -1.04, z: 0 }];
  const belt = 0.52;
  for (const side of [-1, 1]) {
    for (let index = 0; index < 6; index++) {
      const angle = (index / 6) * TAU;
      centres.push({ x: belt * Math.cos(angle), y: side * 0.51, z: belt * Math.sin(angle) });
    }
  }
  const points = [];
  for (const centre of centres) {
    for (let row = 0; row <= 8; row++) {
      const phi = (row / 8) * Math.PI;
      const sine = Math.sin(phi);
      const meridians = row === 0 || row === 8 ? 1 : 14;
      for (let index = 0; index < meridians; index++) {
        const theta = (index / meridians) * TAU;
        points.push({
          x: centre.x + radius * sine * Math.sin(theta),
          y: centre.y + radius * Math.cos(phi),
          z: centre.z + radius * sine * Math.cos(theta),
        });
      }
    }
  }
  return points;
}

/** Lc @286766 — the flower body: a centre disc plus six lobes, walked by ray. */
export function starFlower() {
  const offset = 0.58;
  const circles = [{ x: 0, y: 0, r: 0.36 }];
  for (let index = 0; index < 6; index++) {
    const angle = -Math.PI / 2 + (index * TAU) / 6;
    circles.push({ x: offset * Math.cos(angle), y: offset * Math.sin(angle), r: 0.33 });
  }
  const points = [];
  for (let index = 0; index < 240; index++) {
    const angle = (index / 240) * TAU;
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    let inside = 0;
    let outside = 0.9099999999999999;
    for (let step = 0; step < 22; step++) {
      const mid = (inside + outside) / 2;
      const x = mid * dx;
      const y = mid * dy;
      if (circles.some((circle) => (x - circle.x) * (x - circle.x) + (y - circle.y) * (y - circle.y) <= circle.r * circle.r)) {
        inside = mid;
      } else {
        outside = mid;
      }
    }
    points.push({ x: inside * dx, y: inside * dy, z: 0 });
  }
  return points;
}

export { clamp };
