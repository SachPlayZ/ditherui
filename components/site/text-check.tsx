"use client";

import { useState } from "react";
import { Quantize } from "@/lib/dotgrain/quantize";
import type { Mode } from "@/lib/dotgrain/types";

/** Real text with a text-source Quantize over its box, for the text e2e spec. */
export function TextCheck({ mode, width, size }: { mode?: Mode; width: number; size: number }) {
  const [element, setElement] = useState<HTMLElement | null>(null);
  return (
    <div id="visual" style={{ position: "relative", width }}>
      <p ref={setElement} id="text" style={{ margin: 0, font: `700 ${size}px/1.2 sans-serif`, color: "rgb(255 0 0 / 0.35)" }}>
        Hello dotgrain, text as the browser lays it out
      </p>
      {element && (
        <Quantize source={{ kind: "text", element }} mode={mode} cell={mode === "ascii" ? undefined : 2} palette={["#000", "#fff"]} style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.6 }} />
      )}
    </div>
  );
}
