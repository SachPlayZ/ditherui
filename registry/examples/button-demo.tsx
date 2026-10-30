"use client";

import { Button } from "@/registry/ui/button";

export default function ButtonDemo() {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
      <Button size="lg">Get started</Button>
      <Button variant="outline" size="lg">Read the docs</Button>
      <Button size="sm" disabled>Disabled</Button>
    </div>
  );
}
