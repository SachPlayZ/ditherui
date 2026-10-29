import { notFound } from "next/navigation";
import { VisualExample } from "@/components/site/visual-example";
import { PALETTES } from "@/lib/ditherui/palettes";
import type { PaletteName } from "@/lib/ditherui/types";
import { examples } from "@/registry/examples";

// Test-only route for visual regression; not part of the production site.
export default async function Page(props: PageProps<"/visual/[example]">) {
  const { example } = await props.params;
  const { palette, mode } = await props.searchParams;
  if (process.env.NODE_ENV === "production" || !(example in examples)) notFound();
  const name = typeof palette === "string" && palette in PALETTES ? (palette as PaletteName) : undefined;
  return <VisualExample name={example} palette={name} mode={mode === "ascii" ? "ascii" : undefined} />;
}
