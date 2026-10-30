"use client";

import { Loader } from "@/registry/ui/loader";

export default function LoaderDemo() {
  return (
    <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
      <Loader size={32} />
      <Loader size={64} />
      <Loader size={120} mode="ascii" label="Loading results" />
    </div>
  );
}
