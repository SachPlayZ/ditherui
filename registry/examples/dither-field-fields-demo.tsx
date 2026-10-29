"use client";

import { DitherField } from "@/registry/ui/dither-field";

export default function DitherFieldFieldsDemo() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
      <DitherField field="noise" params={{ scale: 6 }} style={{ height: 140 }} />
      <DitherField field="radial" params={{ radius: 0.6 }} style={{ height: 140 }} />
      <DitherField field="linear" params={{ angle: 30 }} style={{ height: 140 }} />
    </div>
  );
}
