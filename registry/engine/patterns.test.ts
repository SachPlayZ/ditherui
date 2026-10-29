import { describe, expect, it } from "vitest";
import { bayer, blueNoise, thresholdMap } from "./patterns";

/** Fraction of "on" marks (threshold < density) with another "on" mark among their 8 neighbours. */
function clumping(map: Float32Array, size: number, density: number) {
  const on = (x: number, y: number) => map[((y + size) % size) * size + ((x + size) % size)] < density;
  let lit = 0, touching = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!on(x, y)) continue;
      lit++;
      let near = false;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && on(x + dx, y + dy)) near = true;
      if (near) touching++;
    }
  }
  return touching / lit;
}

describe("thresholdMap", () => {
  it("builds every ordered pattern once and caches it", () => {
    expect(thresholdMap("bayer2").size).toBe(2);
    expect(thresholdMap("bayer4").data).toEqual(bayer(4));
    expect(thresholdMap("bayer8").size).toBe(8);
    expect(thresholdMap("blueNoise").size).toBe(64);
    expect(thresholdMap("blueNoise")).toBe(thresholdMap("blueNoise"));
  });

  it("uses bayer4 for diffusion patterns on the ordered path", () => {
    expect(thresholdMap("atkinson")).toBe(thresholdMap("bayer4"));
    expect(thresholdMap("floyd")).toBe(thresholdMap("bayer4"));
  });
});

describe("blueNoise", () => {
  const map = thresholdMap("blueNoise").data;

  it("is a permutation of every threshold level", () => {
    const ranks = Array.from(map, (t) => Math.round(t * 4096 - 0.5)).sort((a, b) => a - b);
    expect(ranks).toEqual([...Array(4096).keys()]);
  });

  it("is deterministic", () => {
    expect(blueNoise(16)).toEqual(blueNoise(16));
  });

  it("spreads sparse marks apart instead of clumping like white noise", () => {
    // White noise at 10% density: ~57% of marks touch another. Blue noise keeps them apart.
    expect(clumping(map, 64, 0.1)).toBeLessThan(0.15);
  });
});
