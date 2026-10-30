"use client";

import { useDocsSearch } from "fumadocs-core/search/client";
import { staticClient } from "fumadocs-core/search/client/orama-static";
import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogFooter,
  SearchDialogHeader,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
} from "fumadocs-ui/components/dialog/search";
import type { SharedProps } from "fumadocs-ui/contexts/search";

const client = staticClient();

/** ⌘K search styled as a terminal prompt; keyboard handling is fumadocs' own (arrows, Enter, Esc). */
export function TerminalSearch(props: SharedProps) {
  const search = useDocsSearch({ client });
  return (
    <SearchDialog {...search} {...props}>
      <SearchDialogOverlay />
      <SearchDialogContent className="font-mono">
        <SearchDialogHeader>
          <span aria-hidden="true" className="text-lg text-fd-primary">
            $
          </span>
          <SearchDialogInput placeholder="grep components and docs…" className="font-mono" />
          <SearchDialogClose />
        </SearchDialogHeader>
        <SearchDialogList />
        {/* A plain div: it must sit inside the portalled content, or it renders on the page. */}
        <SearchDialogFooter className="font-mono text-xs text-fd-muted-foreground">
          ↑↓ move · ↵ open · esc exit — search by name, description or category
        </SearchDialogFooter>
      </SearchDialogContent>
    </SearchDialog>
  );
}
