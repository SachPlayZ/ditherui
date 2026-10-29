import type { FieldName } from "./types";

// Each field exists twice: GLSL for the GPU and an identical JS twin for the CPU path and tests.
// The integer hash keeps both sides bit-compatible (sin-based hashes drift between GPU and CPU).

const FIELD_PARAMS: Record<FieldName, Record<string, number>> = {
  noise: { scale: 3 },
};

/** Field params packed into the vec4 the shader reads, defaults filled in. */
export function fieldParams(field: FieldName, params: Record<string, number> = {}): number[] {
  const out = Object.entries(FIELD_PARAMS[field]).map(([k, d]) => params[k] ?? d);
  while (out.length < 4) out.push(0);
  return out;
}

export const FIELD_GLSL = `
float hash3(ivec3 c) {
  uint h = (uint(c.x) * 0x27d4eb2du) ^ (uint(c.y) * 0x165667b1u) ^ (uint(c.z) * 0x9e3779b1u);
  h = (h ^ (h >> 15u)) * 0x85ebca6bu;
  h ^= h >> 13u;
  return float(h) / 4294967295.0;
}
float vnoise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = p - i;
  vec3 u = f * f * (3.0 - 2.0 * f);
  ivec3 c = ivec3(i);
  float a = mix(hash3(c), hash3(c + ivec3(1, 0, 0)), u.x);
  float b = mix(hash3(c + ivec3(0, 1, 0)), hash3(c + ivec3(1, 1, 0)), u.x);
  float d = mix(hash3(c + ivec3(0, 0, 1)), hash3(c + ivec3(1, 0, 1)), u.x);
  float e = mix(hash3(c + ivec3(0, 1, 1)), hash3(c + ivec3(1, 1, 1)), u.x);
  return mix(mix(a, b, u.y), mix(d, e, u.y), u.z);
}
float field(vec2 uv, float aspect, float t, vec4 params) {
  vec2 p = vec2(uv.x * aspect, uv.y) * params.x;
  float z = t * 0.25;
  return 0.65 * vnoise(vec3(p, z)) + 0.35 * vnoise(vec3(p * 2.0 + 17.0, z * 2.0));
}
`;

function hash3(x: number, y: number, z: number): number {
  let h = Math.imul(x, 0x27d4eb2d) ^ Math.imul(y, 0x165667b1) ^ Math.imul(z, 0x9e3779b1);
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h ^= h >>> 13;
  return (h >>> 0) / 4294967295;
}

const mix = (a: number, b: number, t: number) => a + (b - a) * t;

function vnoise(x: number, y: number, z: number): number {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const fx = x - xi, fy = y - yi, fz = z - zi;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy), uz = fz * fz * (3 - 2 * fz);
  const a = mix(hash3(xi, yi, zi), hash3(xi + 1, yi, zi), ux);
  const b = mix(hash3(xi, yi + 1, zi), hash3(xi + 1, yi + 1, zi), ux);
  const d = mix(hash3(xi, yi, zi + 1), hash3(xi + 1, yi, zi + 1), ux);
  const e = mix(hash3(xi, yi + 1, zi + 1), hash3(xi + 1, yi + 1, zi + 1), ux);
  return mix(mix(a, b, uy), mix(d, e, uy), uz);
}

/** JS twin of the GLSL `field`: value 0–1 at uv for the given time. */
export function field(name: FieldName, u: number, v: number, aspect: number, t: number, params: number[]): number {
  const px = u * aspect * params[0], py = v * params[0], z = t * 0.25;
  return 0.65 * vnoise(px, py, z) + 0.35 * vnoise(px * 2 + 17, py * 2 + 17, z * 2);
}
