"use client";

import { Terminal } from "@/registry/ui/terminal";

export default function TerminalDemo() {
  return <Terminal style={{ maxWidth: 520 }} typing lines={["$ npx shadcn@latest add @dotgrain/terminal", "✔ Done. 1 file added.", "$ "]} />;
}
