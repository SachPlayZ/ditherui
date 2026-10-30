"use client";

import { useDocsSearch } from "fumadocs-core/search/client";
import { fetchClient } from "fumadocs-core/search/client/fetch";
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

const client = fetchClient({ api: "/api/search" });

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
      </SearchDialogContent>
      <SearchDialogFooter className="font-mono text-xs text-fd-muted-foreground">
        ↑↓ move · ↵ open · esc exit — search by name, description or category
      </SearchDialogFooter>
    </SearchDialog>
  );
}
