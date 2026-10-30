"use client";

import Link from "next/link";
import { examples } from "@/registry/examples";
import { components } from "@/registry/meta";

/** Mode badges, as on each component page. */
export function Badges({ modes }: { modes: string[] }) {
  return (
    <span className="flex gap-1.5">
      {modes.map((mode) => (
        <span key={mode} className="rounded-full border px-2 py-0.5 font-mono text-xs text-fd-muted-foreground">
          {mode}
        </span>
      ))}
    </span>
  );
}

/**
 * Every component's live example in a tile. Each renders through the one shared WebGL context, and the
 * engine's scheduler pauses tiles that are offscreen.
 */
export function Wall() {
  return (
    <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(100%,340px),1fr))]">
      {components.map((meta) => {
        const Example = examples[`${meta.name}-demo`];
        return (
          // The caption link stretches over the tile, so the inert example never sits inside an <a>.
          <div key={meta.name} className="relative flex flex-col overflow-hidden rounded-xl border hover:border-fd-primary">
            {/* Tiles are previews, not controls: their contents are inert and hidden from the accessibility tree. */}
            <div inert aria-hidden="true" className="relative h-56 overflow-hidden">
              <div className="flex h-full items-center justify-center p-4 [&>*]:max-w-full">{Example && <Example />}</div>
            </div>
            <div className="flex items-center justify-between gap-2 border-t px-4 py-3">
              <Link href={`/docs/components/${meta.name}`} className="font-medium after:absolute after:inset-0">
                {meta.title}
              </Link>
              <Badges modes={meta.modes} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
