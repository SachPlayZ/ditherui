"use client";

import { DitherProvider } from "@/lib/ditherui/provider";
import type { Mode, PaletteName } from "@/lib/ditherui/types";
import { examples } from "@/registry/examples";

/** One example frozen at time 0 in a given palette and mode, for screenshots. */
export function VisualExample({ name, palette, mode }: { name: string; palette?: PaletteName; mode?: Mode }) {
  const Example = examples[name];
  return (
    <div id="visual" style={{ width: 800, padding: 16 }}>
      <DitherProvider palette={palette} mode={mode} speed={0} colorScheme="dark">
        <Example />
      </DitherProvider>
    </div>
  );
}
