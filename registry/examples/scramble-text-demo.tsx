"use client";

import { ScrambleText } from "@/registry/ui/scramble-text";

export default function ScrambleTextDemo() {
  return (
    <ScrambleText as="h2" cell={4} style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.1, margin: 0 }}>
      Signal acquired
    </ScrambleText>
  );
}
