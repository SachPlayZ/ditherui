"use client";

import { DitherProgress } from "@/registry/ui/dither-progress";

export default function DitherProgressDemo() {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <DitherProgress value={25} label="Queued" />
      <DitherProgress value={60} label="Uploading" />
      <DitherProgress value={100} label="Done" />
    </div>
  );
}
