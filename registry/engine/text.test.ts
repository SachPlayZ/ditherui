import { describe, expect, it } from "vitest";
import { revealAmount, revealed, scrambled } from "./text";

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

describe("reveal", () => {
  const run = { start: 1000, duration: 500 };

  it("eases 0 → 1 over the run and clamps outside it", () => {
    expect(revealAmount(run, 900, false)).toBe(0);
    expect(revealAmount(run, 1250, false)).toBe(0.5);
    expect(revealAmount(run, 2000, false)).toBe(1);
  });

  it("runs 1 → 0 when dithering out, and jumps to the end when still", () => {
    expect(revealAmount({ ...run, out: true }, 1000, false)).toBe(1);
    expect(revealAmount({ ...run, out: true }, 1000, true)).toBe(0);
    expect(revealAmount(run, 1000, true)).toBe(1);
  });

  it("scales the mask, returning it as is when fully shown", () => {
    const mask = new Float32Array([0, 1, 0.5]);
    expect(revealed(mask, 1)).toBe(mask);
    expect(Array.from(revealed(mask, 0.5))).toEqual([0, 0.5, 0.25]);
  });
});
