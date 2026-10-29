"use client";

import { DitherImage } from "@/registry/ui/dither-image";

const PATTERNS = ["bayer4", "atkinson", "floyd"] as const;

export default function DitherImagePatternsDemo() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
      {PATTERNS.map((pattern) => (
        <figure key={pattern} style={{ margin: 0 }}>
          <DitherImage src="/examples/landscape.svg" alt="A sun setting behind mountains over the sea" width={1200} height={800} pattern={pattern} cell={2} />
          <figcaption style={{ fontFamily: "monospace", fontSize: 12 }}>{pattern}</figcaption>
        </figure>
      ))}
    </div>
  );
}
