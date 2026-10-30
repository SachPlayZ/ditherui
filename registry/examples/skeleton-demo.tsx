"use client";

import { Skeleton } from "@/registry/ui/skeleton";

export default function SkeletonDemo() {
  return (
    <div aria-busy="true" aria-label="Loading profile" style={{ display: "flex", gap: 16, alignItems: "center", width: 360 }}>
      <Skeleton style={{ width: 56, height: 56, flex: "none" }} />
      <div style={{ display: "grid", gap: 8, flex: 1 }}>
        <Skeleton style={{ height: 18 }} />
        <Skeleton style={{ height: 14, width: "70%" }} />
      </div>
    </div>
  );
}
