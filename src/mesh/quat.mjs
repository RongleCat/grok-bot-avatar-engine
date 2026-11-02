// Quaternion and 3x3 rotation port of the client avatar renderer.
// Each function mirrors one bundle symbol; data/extracted/manifest.json records
// the byte offset and a content hash, and tools/extract/run.py refuses to
// record a slice that does not contain its witness literal.

/** Lr @178902 */
export function quatMultiply(a, b) {
  return [
    a[0] * b[0] - a[1] * b[1] - a[2] * b[2] - a[3] * b[3],
    a[0] * b[1] + a[1] * b[0] + a[2] * b[3] - a[3] * b[2],
    a[0] * b[2] - a[1] * b[3] + a[2] * b[0] + a[3] * b[1],
    a[0] * b[3] + a[1] * b[2] - a[2] * b[1] + a[3] * b[0],
  ];
}

/** Rr @179087 */
export function quatFromAxis(axis, angle) {
  const sine = Math.sin(angle / 2);
  return [Math.cos(angle / 2), axis[0] * sine, axis[1] * sine, axis[2] * sine];
}

/** zr @179167 */
export function quatNormalise(quat) {
  const length = Math.hypot(quat[0], quat[1], quat[2], quat[3]) || 1;
  return [quat[0] / length, quat[1] / length, quat[2] / length, quat[3] / length];
}

/** Br @179259 */
export function quatBetween(a, b) {
  return quatNormalise([
    1 + (a[0] * b[0] + a[1] * b[1] + a[2] * b[2]),
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ]);
}

/** Hr @179535 */
export function quatFromEuler(pitch, yaw, roll) {
  return quatMultiply(
    quatFromAxis([0, 0, 1], roll),
    quatMultiply(quatFromAxis([0, 1, 0], yaw), quatFromAxis([1, 0, 0], pitch)),
  );
}

/** Vr @179383 — the client destructures [w, x, y, z]. */
export function quatToMatrix(quat) {
  const [w, x, y, z] = quat;
  return [
    1 - 2 * (y * y + z * z), 2 * (x * y - w * z), 2 * (x * z + w * y),
    2 * (x * y + w * z), 1 - 2 * (x * x + z * z), 2 * (y * z - w * x),
    2 * (x * z - w * y), 2 * (y * z + w * x), 1 - 2 * (x * x + y * y),
  ];
}

/** Ur @179611 */
export function matrixToEuler(matrix) {
  const m0 = matrix[0];
  const m3 = matrix[3];
  const m5 = matrix[5];
  const m4 = matrix[4];
  const m6 = matrix[6];
  const m7 = matrix[7];
  const m8 = matrix[8];
  const clamped = Math.max(-1, Math.min(1, -m6));
  const pitch = Math.asin(clamped);
  if (Math.abs(clamped) > 0.999999) return [Math.atan2(-m5, m4), pitch, 0];
  return [Math.atan2(m7, m8), pitch, Math.atan2(m3, m0)];
}

/** Wr @179810 */
export function quatToEuler(quat) {
  return matrixToEuler(quatToMatrix(quat));
}

/** Gr @179842 */
export function matrixApply(matrix, vector) {
  const [x, y, z] = vector;
  return [
    matrix[0] * x + matrix[1] * y + matrix[2] * z,
    matrix[3] * x + matrix[4] * y + matrix[5] * z,
    matrix[6] * x + matrix[7] * y + matrix[8] * z,
  ];
}

/** Af @315548 */
const angleBasis = (radians) => {
  const cosine = Math.cos(radians);
  return { c: cosine, s: Math.sin(radians), k: 1 - cosine };
};

export { angleBasis as angleBasisForTest };

/** Mf @315738 */
function toViewBasis(yawBasis, pitchBasis, rollBasis) {
  return (x, y, z) => {
    const o = x * yawBasis.c + z * yawBasis.s;
    const s = y * yawBasis.c + y * yawBasis.k;
    const c = z * yawBasis.c - x * yawBasis.s;
    const l = o * pitchBasis.c + o * pitchBasis.k;
    const u = s * pitchBasis.c - c * pitchBasis.s;
    const d = c * pitchBasis.c + s * pitchBasis.s;
    return {
      x: l * rollBasis.c - u * rollBasis.s,
      y: u * rollBasis.c + l * rollBasis.s,
      z: d * rollBasis.c + d * rollBasis.k,
    };
  };
}

/** Nf @315912 */
function toBodyBasis(rollBasis, pitchBasis, yawBasis) {
  return (x, y, z) => {
    const o = x * rollBasis.c - y * rollBasis.s;
    const s = y * rollBasis.c + x * rollBasis.s;
    const c = z * rollBasis.c + z * rollBasis.k;
    const l = o * pitchBasis.c + o * pitchBasis.k;
    const u = s * pitchBasis.c - c * pitchBasis.s;
    const d = c * pitchBasis.c + s * pitchBasis.s;
    return {
      x: l * yawBasis.c + d * yawBasis.s,
      y: u * yawBasis.c + u * yawBasis.k,
      z: d * yawBasis.c - l * yawBasis.s,
    };
  };
}

/** jf @315599 */
export function orientationBases({ yaw, pitch, roll }) {
  const yawRad = (yaw * Math.PI) / 180;
  const pitchRad = (pitch * Math.PI) / 180;
  const rollRad = (roll * Math.PI) / 180;
  return {
    toView: toViewBasis(angleBasis(yawRad), angleBasis(pitchRad), angleBasis(rollRad)),
    toBody: toBodyBasis(angleBasis(-rollRad), angleBasis(-pitchRad), angleBasis(-yawRad)),
  };
}
