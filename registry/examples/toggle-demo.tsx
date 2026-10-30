"use client";

import { Toggle } from "@/registry/ui/toggle";

export default function ToggleDemo() {
  return (
    <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
      <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <Toggle defaultChecked /> Notifications
      </label>
      <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <Toggle /> Sound
      </label>
      <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <Toggle size={32} disabled /> Disabled
      </label>
    </div>
  );
}
