import type { FieldName } from "./types";

// Each field exists twice: GLSL for the GPU and an identical JS twin for the CPU path and tests.
// The integer hash keeps both sides bit-compatible (sin-based hashes drift between GPU and CPU).

// Param order is the vec4 slot order the shader reads.
const FIELD_PARAMS: Record<FieldName, Record<string, number>> = {
  noise: { scale: 3 },
  radial: { x: 0.5, y: 0.5, radius: 0.5 },
  linear: { angle: 0 },
  progress: { value: 0.5, softness: 0.05 },
  // Share of columns raining; tail length as a share of the height; columns across the width, more than any
  // glyph grid has so each glyph column falls on its own. The speed token scales time, so fall speed needs no param.
  rain: { density: 0.7, length: 0.4, columns: 1024 },
  // Ring radius and thickness in heights; turns once per second at speed 1.
  spin: { radius: 0.32, thickness: 0.16 },
  // Resting level; band half-width as a share of the width. One sweep every ~1.7 s at speed 1.
  shimmer: { base: 0.3, width: 0.25 },
};

/** Index the shader switches on. */
export const FIELD_IDS: Record<FieldName, number> = { noise: 0, radial: 1, linear: 2, progress: 3, rain: 4, spin: 5, shimmer: 6 };

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
float field(int kind, vec2 uv, float aspect, float t, vec4 params) {
  if (kind == 1) return clamp(1.0 - length((uv - params.xy) * vec2(aspect, 1.0)) / params.z, 0.0, 1.0);
  if (kind == 2) {
    float a = radians(params.x);
    return clamp(dot(uv - 0.5, vec2(cos(a), sin(a))) + 0.5, 0.0, 1.0);
  }
  if (kind == 3) return clamp((params.x - uv.x) / max(params.y, 1e-4) * 0.5 + 0.5, 0.0, 1.0);
  if (kind == 4) {
    // Each column: hashed on/off, phase and speed; a head falls and its tail fades behind it, wrapping.
    int c = int(floor(uv.x * params.z));
    if (hash3(ivec3(c, 2, 0)) > params.x) return 0.0;
    float head = fract(hash3(ivec3(c, 1, 0)) + t * (0.3 + 0.7 * hash3(ivec3(c, 0, 0))));
    float d = fract(head - uv.y);
    return d < params.y ? 1.0 - d / params.y : 0.0;
  }
  if (kind == 5) {
    // A ring whose brightness sweeps round it: brightest at the head, fading over one turn behind it.
    vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
    if (abs(length(p) - params.x) > params.y * 0.5) return 0.0;
    return fract(atan(p.y, p.x) / 6.2831853 + 0.5 - t);
  }
  if (kind == 6) {
    // A slightly slanted bright band sweeping left to right over a flat base, off-screen between sweeps.
    float d = abs(uv.x + uv.y * 0.15 - (fract(t * 0.6) * 1.8 - 0.4));
    return params.x + (1.0 - params.x) * clamp(1.0 - d / max(params.y, 1e-4), 0.0, 1.0);
  }
  vec2 p = vec2(uv.x * aspect, uv.y) * params.x;
  float z = t * 0.25;
  return 0.65 * vnoise(vec3(p, z)) + 0.35 * vnoise(vec3(p * 2.0 + 17.0, z * 2.0));
}
// Soft radial bump at the pointer, added to the field value.
float cursorBump(vec2 uv, float aspect, vec4 cursor) {
  vec2 d = (uv - cursor.xy) * vec2(aspect, 1.0);
  return cursor.z * 0.6 * exp(-dot(d, d) / max(cursor.w * cursor.w, 1e-6));
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

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const fract = (x: number) => x - Math.floor(x);

/** JS twin of the GLSL `field`: value 0–1 at uv for the given time. */
export function field(name: FieldName, u: number, v: number, aspect: number, t: number, params: number[]): number {
  if (name === "radial") return clamp01(1 - Math.hypot((u - params[0]) * aspect, v - params[1]) / params[2]);
  if (name === "linear") {
    const a = (params[0] * Math.PI) / 180;
    return clamp01((u - 0.5) * Math.cos(a) + (v - 0.5) * Math.sin(a) + 0.5);
  }
  if (name === "progress") return clamp01(((params[0] - u) / Math.max(params[1], 1e-4)) * 0.5 + 0.5);
  if (name === "rain") {
    const c = Math.floor(u * params[2]);
    if (hash3(c, 2, 0) > params[0]) return 0;
    const head = fract(hash3(c, 1, 0) + t * (0.3 + 0.7 * hash3(c, 0, 0)));
    const d = fract(head - v);
    return d < params[1] ? 1 - d / params[1] : 0;
  }
  if (name === "spin") {
    const px = (u - 0.5) * aspect, py = v - 0.5;
    if (Math.abs(Math.hypot(px, py) - params[0]) > params[1] * 0.5) return 0;
    return fract(Math.atan2(py, px) / 6.2831853 + 0.5 - t);
  }
  if (name === "shimmer") {
    const d = Math.abs(u + v * 0.15 - (fract(t * 0.6) * 1.8 - 0.4));
    return params[0] + (1 - params[0]) * clamp01(1 - d / Math.max(params[1], 1e-4));
  }
  const px = u * aspect * params[0], py = v * params[0], z = t * 0.25;
  return 0.65 * vnoise(px, py, z) + 0.35 * vnoise(px * 2 + 17, py * 2 + 17, z * 2);
}

/** JS twin of the GLSL `cursorBump`. */
export function cursorBump(u: number, v: number, aspect: number, [x, y, strength, radius]: number[]): number {
  const dx = (u - x) * aspect, dy = v - y;
  return strength * 0.6 * Math.exp(-(dx * dx + dy * dy) / Math.max(radius * radius, 1e-6));
}
