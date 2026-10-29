import type { Mode } from "../engine/types";

export interface PropMeta {
  name: string;
  type: string;
  default?: string;
  description: string;
}

/** Single source of truth for a component: feeds registry.json and its docs page. */
export interface ComponentMeta {
  name: string;
  title: string;
  /** One plain sentence; reused for search, llms.txt and the copy prompt. */
  description: string;
  category: "background" | "media" | "feedback";
  modes: Mode[];
  tier: "free";
  files: string[];
  props: PropMeta[];
}
