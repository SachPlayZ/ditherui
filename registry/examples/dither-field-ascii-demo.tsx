"use client";

import { DitherField } from "@/registry/ui/dither-field";

export default function DitherFieldAsciiDemo() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 8 }}>
      <DitherField mode="ascii" style={{ height: 180 }} />
      <DitherField mode="ascii" glyphs="blocks" cell={12} palette="cga" style={{ height: 180 }} />
    </div>
  );
}
