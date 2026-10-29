// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render } from "./cpu";
import { luminance, videoValues } from "./images";
import { DEFAULT_TOKENS } from "./provider";

describe("luminance", () => {
  it("uses Rec. 709 weights", () => {
    const v = luminance(new Uint8ClampedArray([255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 255, 255, 255, 255]));
    expect(Array.from(v, (x) => +x.toFixed(4))).toEqual([0.2126, 0.7152, 0.0722, 1]);
  });
});

describe("image frames", () => {
  it("quantize the given per-mark luminance", () => {
    const values = new Float32Array([0, 0.05, 0.95, 1]);
    const data = render({ source: { kind: "image", src: "x" }, tokens: DEFAULT_TOKENS, width: 4, height: 1, time: 0, values });
    expect([data[0], data[4], data[8], data[12]]).toEqual([10, 10, 242, 242]);
  });

  it("require values", () => {
    expect(() => render({ source: { kind: "image", src: "x" }, tokens: DEFAULT_TOKENS, width: 1, height: 1, time: 0 })).toThrow(/values/);
  });
});

describe("video frames", () => {
  const video = () => document.createElement("video");

  it("quantize like image frames with the same values", () => {
    const values = new Float32Array([0, 0.3, 0.6, 1]);
    const base = { tokens: DEFAULT_TOKENS, width: 4, height: 1, time: 0, values };
    expect(render({ ...base, source: { kind: "video", element: video() } })).toEqual(render({ ...base, source: { kind: "image", src: "x" } }));
  });

  it("require values", () => {
    expect(() => render({ source: { kind: "video", element: video() }, tokens: DEFAULT_TOKENS, width: 1, height: 1, time: 0 })).toThrow(/values/);
  });

  it("report loading until a frame is available, and errors", () => {
    const v = video();
    expect(videoValues(v, 4, 4, 1)).toBe("loading");
    Object.defineProperty(v, "error", { value: { code: 4 } });
    expect(videoValues(v, 4, 4, 1)).toBe("error");
  });
});
