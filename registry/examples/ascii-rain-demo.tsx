"use client";

import { AsciiRain } from "@/registry/ui/ascii-rain";

export default function AsciiRainDemo() {
  return (
    <AsciiRain style={{ height: 320, display: "grid", placeItems: "center" }}>
      <h2 style={{ margin: 0, padding: "0.5rem 1rem", background: "#0a0a0a", color: "#f2f0e9" }}>Real DOM text</h2>
    </AsciiRain>
  );
}
