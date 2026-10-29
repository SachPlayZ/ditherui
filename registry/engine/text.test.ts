import { describe, expect, it } from "vitest";
import { scrambled } from "./text";

describe("scrambled", () => {
  const mask = new Float32Array([0, 1, 0.8, 0, 1, 0.5]);

  it("leaves empty marks empty and keeps lit marks within their level", () => {
    const out = scrambled(mask, 1, 3);
    mask.forEach((v, i) => {
      if (v === 0) expect(out[i]).toBe(0);
      else expect(out[i]).toBeLessThanOrEqual(v);
    });
  });

  it("is the mask at amount 0", () => {
    expect(scrambled(mask, 0, 7)).toEqual(mask);
  });

  it("is stable within a tick and changes between ticks", () => {
    expect(scrambled(mask, 1, 4)).toEqual(scrambled(mask, 1, 4));
    expect(scrambled(mask, 1, 4)).not.toEqual(scrambled(mask, 1, 5));
  });
});
