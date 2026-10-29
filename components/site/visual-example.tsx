"use client";

import { DitherProvider } from "@/lib/ditherui/provider";
import type { PaletteName } from "@/lib/ditherui/types";
import { examples } from "@/registry/examples";

/** One example frozen at time 0 in a given palette, for screenshots. */
export function VisualExample({ name, palette }: { name: string; palette?: PaletteName }) {
  const Example = examples[name];
  return (
    <div id="visual" style={{ width: 800, padding: 16 }}>
      <DitherProvider palette={palette} speed={0} colorScheme="dark">
        <Example />
      </DitherProvider>
    </div>
  );
}
