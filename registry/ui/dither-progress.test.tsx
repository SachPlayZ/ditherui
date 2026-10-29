// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { glyphGrid } from "@/lib/dotgrain/cpu";
import { DEFAULT_TOKENS } from "@/lib/dotgrain/provider";
import { DitherProgress } from "./dither-progress";

afterEach(cleanup);

describe("DitherProgress", () => {
  it("is a native progressbar with ARIA values and a decorative canvas", () => {
    const { container } = render(<DitherProgress value={42} label="Uploading" />);
    const bar = screen.getByRole("progressbar", { name: "Uploading" });
    expect(bar.getAttribute("aria-valuenow")).toBe("42");
    expect(bar.getAttribute("aria-valuemin")).toBe("0");
    expect(bar.getAttribute("aria-valuemax")).toBe("100");
    expect(container.querySelector("canvas")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("clamps the value to 0–100", () => {
    render(<DitherProgress value={140} />);
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("100");
  });

  it("ASCII fills with the ramp's foreground extreme up to the value and its background extreme after", () => {
    const ramp = " .:-=+*#%@";
    const width = 20;
    const { glyphs } = glyphGrid({
      // What DitherProgress hands the engine in ASCII mode: the ramp's two extremes.
      source: { kind: "field", field: "progress", params: { value: 0.4, softness: 0.05 } },
      tokens: { ...DEFAULT_TOKENS, mode: "ascii", glyphs: ramp[0] + ramp[ramp.length - 1] },
      width,
      height: 1,
      time: 0,
    });
    const text = [...glyphs].map((g) => (g === 1 ? "@" : " ")).join("");
    expect(text).toBe("@".repeat(8) + " ".repeat(12));
  });
});
