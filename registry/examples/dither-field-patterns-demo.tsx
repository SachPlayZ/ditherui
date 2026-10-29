"use client";

import { DitherField } from "@/registry/ui/dither-field";

const PATTERNS = ["bayer2", "bayer4", "bayer8", "blueNoise"] as const;

export default function DitherFieldPatternsDemo() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8 }}>
      {PATTERNS.map((pattern) => (
        <figure key={pattern} style={{ margin: 0 }}>
          <DitherField pattern={pattern} cell={4} style={{ height: 120 }} />
          <figcaption style={{ fontFamily: "monospace", fontSize: 12 }}>{pattern}</figcaption>
        </figure>
      ))}
    </div>
  );
}
