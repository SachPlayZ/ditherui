"use client";

import { Card } from "@/registry/ui/card";

export default function CardDemo() {
  return (
    <Card style={{ width: 320 }}>
      <h3 style={{ margin: "0 0 8px" }}>Starter</h3>
      <p style={{ margin: 0 }}>Every component, one engine, no runtime dependencies.</p>
    </Card>
  );
}
