"use client";

import { Backdrop } from "@/registry/ui/backdrop";

export default function BackdropDemo() {
  return (
    <Backdrop contrast={0.6} style={{ height: 240, display: "grid", placeItems: "center" }}>
      <h2 style={{ margin: 0, padding: "0.5rem 1rem", background: "#0a0a0a", color: "#f2f0e9" }}>A textured section</h2>
    </Backdrop>
  );
}
