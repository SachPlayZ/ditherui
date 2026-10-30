"use client";

import { Fragment, type ReactNode, useState } from "react";
import { DitherProvider } from "@/lib/dotgrain/provider";
import { INK_PALETTES } from "@/lib/dotgrain/palettes";

type Scheme = "system" | "light" | "dark";

const toggle = (active: boolean) =>
  `rounded-md px-2 py-0.5 ${active ? "bg-fd-accent text-fd-accent-foreground" : "text-fd-muted-foreground hover:text-fd-foreground"}`;

/** Frame for a live example: replay, light/dark (`ink` follows it) and mobile/desktop width. */
export function Preview({ children }: { children: ReactNode }) {
  const [run, setRun] = useState(0);
  const [scheme, setScheme] = useState<Scheme>("system");
  const [mobile, setMobile] = useState(false);
  // Forced schemes also paint the frame, so the example reads as it would on such a page.
  const background = scheme === "system" ? undefined : INK_PALETTES[scheme][0];
  return (
    <div className="not-prose my-4 overflow-hidden rounded-xl border">
      <div className="flex flex-wrap items-center gap-1 border-b px-2 py-1.5 text-xs">
        <button type="button" className={toggle(false)} onClick={() => setRun(run + 1)} aria-label="Replay">
          ↻ Replay
        </button>
        <span className="mx-1 h-4 border-l" />
        {(["system", "light", "dark"] as const).map((s) => (
          <button key={s} type="button" className={toggle(scheme === s)} aria-pressed={scheme === s} onClick={() => setScheme(s)}>
            {s === "system" ? "site" : s}
          </button>
        ))}
        <span className="mx-1 h-4 border-l" />
        {[false, true].map((m) => (
          <button key={String(m)} type="button" className={toggle(mobile === m)} aria-pressed={mobile === m} onClick={() => setMobile(m)}>
            {m ? "mobile" : "desktop"}
          </button>
        ))}
      </div>
      <div style={{ background, colorScheme: scheme === "system" ? undefined : scheme }}>
        <div style={{ maxWidth: mobile ? 375 : undefined, margin: "0 auto" }}>
          <DitherProvider colorScheme={scheme}>
            {/* Remounting restarts animation and easing from the first frame. */}
            <Fragment key={run}>{children}</Fragment>
          </DitherProvider>
        </div>
      </div>
    </div>
  );
}
