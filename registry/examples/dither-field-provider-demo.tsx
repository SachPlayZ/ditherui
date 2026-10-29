"use client";

import { DitherProvider } from "@/lib/dotgrain/provider";
import { DitherField } from "@/registry/ui/dither-field";

export default function DitherFieldProviderDemo() {
  return (
    <DitherProvider palette="gameboy" cell={4}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <DitherField style={{ height: 160 }} />
        <DitherField style={{ height: 160 }} palette="amber" pattern="bayer8" />
      </div>
    </DitherProvider>
  );
}
