"use client";

import { Button } from "@/registry/ui/button";
import { HeroTerminal } from "@/registry/ui/hero-terminal";

export default function HeroTerminalDemo() {
  return (
    <HeroTerminal
      style={{ width: "100%" }}
      title="Grain for the web"
      description="Dither and ASCII components for React, installed with one command."
      actions={
        <>
          <Button size="lg">Get started</Button>
          <Button size="lg" variant="outline">
            Browse components
          </Button>
        </>
      }
      lines={["$ npx shadcn@latest add @dotgrain/hero-terminal", "✔ Done. 3 files added."]}
    />
  );
}
