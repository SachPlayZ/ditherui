"use client";

import { DitherReveal } from "@/registry/ui/dither-reveal";

export default function DitherRevealDemo() {
  return (
    <DitherReveal as="h2" cell={2} style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.1, margin: 0 }}>
      Out of the noise
    </DitherReveal>
  );
}
