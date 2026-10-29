import type { Pattern } from "./types";

/** n×n Bayer matrix (n a power of 2), row-major thresholds in (0, 1). */
export function bayer(n: number): Float32Array {
  let m = [0];
  for (let s = 1; s < n; s *= 2) {
    const next: number[] = new Array(4 * s * s);
    for (let y = 0; y < s; y++) {
      for (let x = 0; x < s; x++) {
        const v = 4 * m[y * s + x];
        next[y * 2 * s + x] = v;
        next[y * 2 * s + x + s] = v + 2;
        next[(y + s) * 2 * s + x] = v + 3;
        next[(y + s) * 2 * s + x + s] = v + 1;
      }
    }
    m = next;
  }
  return Float32Array.from(m, (v) => (v + 0.5) / (n * n));
}

export interface ThresholdMap {
  size: number;
  data: Float32Array;
}

const cache = new Map<number, ThresholdMap>();

/** Threshold map for an ordered pattern; unsupported patterns use bayer4. */
export function thresholdMap(pattern: Pattern): ThresholdMap {
  const size = pattern === "bayer2" ? 2 : pattern === "bayer8" ? 8 : 4;
  let map = cache.get(size);
  if (!map) cache.set(size, (map = { size, data: bayer(size) }));
  return map;
}

/** Quantize a 0–1 value to a palette index of n levels against threshold t. */
export function level(v: number, contrast: number, threshold: number, t: number, n: number): number {
  const s = Math.min(1, Math.max(0, (v - 0.5) * contrast + 1 - threshold)) * (n - 1);
  const b = Math.floor(s);
  return Math.min(n - 1, b + (s - b > t ? 1 : 0));
}
