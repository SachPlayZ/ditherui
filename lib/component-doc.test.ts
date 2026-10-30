import { describe, expect, it } from "vitest";
import { DEFAULT_TOKENS } from "@/registry/engine/provider";
import ditherField from "@/registry/meta/dither-field";
import ditherImage from "@/registry/meta/dither-image";
import { knobsFor, openIn, prompt, snippet, tuned } from "./component-doc";

describe("component docs", () => {
  it("token knob defaults match the provider", () => {
    for (const knob of knobsFor(ditherField)) {
      if (knob.name in DEFAULT_TOKENS) expect(knob.default).toBe(DEFAULT_TOKENS[knob.name as keyof typeof DEFAULT_TOKENS]);
    }
  });

  it("prints only tuned knobs, hiding ones the mode ignores", () => {
    expect(tuned(ditherField, { mode: "dither", cell: 3, palette: "amber", glyphs: "blocks" })).toEqual({ palette: "amber" });
    // ASCII: pattern is ignored, cell defaults to 10.
    expect(tuned(ditherField, { mode: "ascii", pattern: "bayer8", cell: 10, glyphs: "blocks" })).toEqual({ mode: "ascii", glyphs: "blocks" });
  });

  it("renders the example as JSX", () => {
    expect(snippet(ditherField, {})).toBe(
      'import { DitherField } from "@/components/ui/dither-field";\n\n<DitherField style={{ height: 320 }}>\n  Hello\n</DitherField>',
    );
    expect(snippet(ditherField, { field: "radial", interactive: false, cursorRadius: 80 })).toContain(
      '<DitherField\n  style={{ height: 320 }}\n  field="radial"\n  interactive={false}\n  cursorRadius={80}\n>',
    );
    expect(snippet(ditherImage, {})).toMatch(/<DitherImage\n  src="\/examples\/landscape.svg"\n[\s\S]*\n\/>$/);
  });

  it("prompt carries the install command and knob values; links carry the prompt", () => {
    const text = prompt(ditherField, { palette: "cga" });
    expect(text).toContain("npx shadcn@latest add @dotgrain/dither-field");
    expect(text).toContain('palette="cga"');
    expect(text).toContain('"@dotgrain": "https://dotgrain.space/r/{name}.json"');
    for (const { href } of openIn(text)) expect(decodeURIComponent(href)).toContain('palette="cga"');
  });
});
