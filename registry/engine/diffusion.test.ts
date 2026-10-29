import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "./cpu";
import { diffuse, diffused } from "./diffusion";
import { DEFAULT_TOKENS } from "./provider";

// Textbook neighbour-by-neighbour versions, written independently of the kernel table.
function reference(values: number[], w: number, h: number, pattern: "floyd" | "atkinson", n: number): number[] {
  const s = values.map((v) => Math.min(1, Math.max(0, v)) * (n - 1));
  const out: number[] = [];
  const add = (x: number, y: number, e: number) => {
    if (x >= 0 && x < w && y < h) s[y * w + x] += e;
  };
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const q = Math.min(n - 1, Math.max(0, Math.round(s[y * w + x])));
      out.push(q);
      const e = s[y * w + x] - q;
      if (pattern === "floyd") {
        add(x + 1, y, (e * 7) / 16);
        add(x - 1, y + 1, (e * 3) / 16);
        add(x, y + 1, (e * 5) / 16);
        add(x + 1, y + 1, e / 16);
      } else {
        for (const [dx, dy] of [[1, 0], [2, 0], [-1, 1], [0, 1], [1, 1], [0, 2]]) add(x + dx, y + dy, e / 8);
      }
    }
  return out;
}

// Seeded so fixtures are stable.
function fixture(length: number, seed = 7): Float32Array {
  const out = new Float32Array(length);
  for (let i = 0; i < length; i++) out[i] = ((seed = (seed * 16807) % 2147483647) % 1000) / 1000;
  return out;
}

describe("error diffusion", () => {
  it("matches hand-computed 2×2 results", () => {
    const gray = new Float32Array([0.6, 0.6, 0.6, 0.6]);
    expect([...diffuse(gray, 2, 2, "floyd", 1, 0.5, 2)]).toEqual([1, 0, 1, 1]);
    expect([...diffuse(gray, 2, 2, "atkinson", 1, 0.5, 2)]).toEqual([1, 1, 0, 1]);
  });

  for (const pattern of ["floyd", "atkinson"] as const)
    for (const n of [2, 3, 4])
      it(`${pattern} matches the reference with ${n} colours`, () => {
        const values = fixture(12 * 9);
        expect([...diffuse(values, 12, 9, pattern, 1, 0.5, n)]).toEqual(reference([...values], 12, 9, pattern, n));
      });

  it("preserves average tone", () => {
    const flat = new Float32Array(64 * 64).fill(0.3);
    const lit = diffuse(flat, 64, 64, "floyd", 1, 0.5, 2).reduce((a, b) => a + b, 0) / flat.length;
    expect(lit).toBeCloseTo(0.3, 2);
  });
});

describe("diffused", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("runs on the main thread when Worker is undefined, even for large images", () => {
    vi.stubGlobal("Worker", undefined);
    const onReady = vi.fn();
    const indices = diffused(fixture(600 * 600), 600, 600, "atkinson", 1, 0.5, 2, onReady);
    expect(indices).toHaveLength(600 * 600);
    expect(onReady).not.toHaveBeenCalled();
  });

  it("diffuses images over 512×512 in a Worker and reports when ready", () => {
    const posted: { id: number; args: Parameters<typeof diffuse> }[] = [];
    let instance: { onmessage: (e: { data: unknown }) => void } | undefined;
    vi.stubGlobal("URL", { ...URL, createObjectURL: () => "blob:diffuse" });
    vi.stubGlobal(
      "Worker",
      class {
        onmessage = (_: { data: unknown }) => {};
        constructor() {
          instance = this;
        }
        postMessage(data: (typeof posted)[number]) {
          posted.push(data);
        }
      },
    );
    const values = fixture(600 * 520);
    const onReady = vi.fn();
    expect(diffused(values, 600, 520, "floyd", 1, 0.5, 2, onReady)).toBeUndefined();
    expect(posted).toHaveLength(1);
    // Answer as the worker would.
    instance!.onmessage({ data: { id: posted[0].id, out: diffuse(...posted[0].args) } });
    expect(onReady).toHaveBeenCalledOnce();
    expect(diffused(values, 600, 520, "floyd", 1, 0.5, 2, onReady)).toHaveLength(600 * 520);
  });
});

describe("diffusion patterns on non-image sources", () => {
  it("render bayer4 and warn exactly once", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const frame = (pattern: "atkinson" | "floyd" | "bayer4") => ({
      source: { kind: "field" as const, field: "noise" as const },
      tokens: { ...DEFAULT_TOKENS, pattern },
      width: 16,
      height: 16,
      time: 0,
    });
    expect(render(frame("atkinson"))).toEqual(render(frame("bayer4")));
    render(frame("floyd"));
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });
});
