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

/**
 * size×size blue-noise threshold map via void-and-cluster (Ulichney 1993), deterministic.
 * Energy is a toroidal Gaussian; each pixel change updates every energy in O(n), so 64×64 is ~20M ops.
 */
export function blueNoise(size = 64, sigma = 1.5): Float32Array {
  const n = size * size;
  const kernel = new Float32Array(n);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = Math.min(x, size - x), dy = Math.min(y, size - y);
      kernel[y * size + x] = Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));
    }
  }
  const on = new Uint8Array(n);
  const energy = new Float32Array(n);
  const toggle = (i: number, sign: number) => {
    on[i] = sign > 0 ? 1 : 0;
    const ix = i % size, iy = (i / size) | 0;
    for (let y = 0; y < size; y++) {
      const row = ((y - iy + size) % size) * size;
      for (let x = 0; x < size; x++) energy[y * size + x] += sign * kernel[row + ((x - ix + size) % size)];
    }
  };
  // Tightest cluster = highest-energy "on" pixel; largest void = lowest-energy "off" pixel.
  const extreme = (state: number, pickMax: boolean) => {
    let best = -1;
    for (let i = 0; i < n; i++) {
      if (on[i] === state && (best < 0 || (pickMax ? energy[i] > energy[best] : energy[i] < energy[best]))) best = i;
    }
    return best;
  };

  let seed = 0x9e3779b9;
  const random = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const initial = Math.round(n * 0.1);
  for (let placed = 0; placed < initial; ) {
    const i = Math.floor(random() * n);
    if (!on[i]) (toggle(i, 1), placed++);
  }
  // Phase 0: move cluster pixels into voids until the prototype pattern is stable.
  for (;;) {
    const cluster = extreme(1, true);
    toggle(cluster, -1);
    const void_ = extreme(0, false);
    toggle(void_, 1);
    if (void_ === cluster) break;
  }
  const prototype = on.slice(), prototypeEnergy = energy.slice();
  const rank = new Float32Array(n);
  // Phase 1: rank prototype pixels by removing tightest clusters.
  for (let r = initial - 1; r >= 0; r--) {
    const cluster = extreme(1, true);
    toggle(cluster, -1);
    rank[cluster] = r;
  }
  on.set(prototype);
  energy.set(prototypeEnergy);
  // Phase 2: fill the remaining pixels into the largest voids.
  for (let r = initial; r < n; r++) {
    const void_ = extreme(0, false);
    toggle(void_, 1);
    rank[void_] = r;
  }
  return rank.map((r) => (r + 0.5) / n);
}

export interface ThresholdMap {
  size: number;
  data: Float32Array;
}

const cache = new Map<string, ThresholdMap>();

/** Threshold map for an ordered pattern, built on first use; diffusion patterns use bayer4 here. */
export function thresholdMap(pattern: Pattern): ThresholdMap {
  const key = pattern === "bayer2" || pattern === "bayer8" || pattern === "blueNoise" ? pattern : "bayer4";
  let map = cache.get(key);
  if (!map) {
    const size = key === "blueNoise" ? 64 : Number(key.slice(5));
    cache.set(key, (map = { size, data: key === "blueNoise" ? blueNoise(size) : bayer(size) }));
  }
  return map;
}

/** Quantize a 0–1 value to a palette index of n levels against threshold t. */
export function level(v: number, contrast: number, threshold: number, t: number, n: number): number {
  const s = Math.min(1, Math.max(0, (v - 0.5) * contrast + 1 - threshold)) * (n - 1);
  const b = Math.floor(s);
  return Math.min(n - 1, b + (s - b > t ? 1 : 0));
}
