import { notFound } from "next/navigation";
import { TextCheck } from "@/components/site/text-check";

// Test-only route: a text source over real text for the e2e text spec; not part of the production site.
export default async function Page(props: PageProps<"/visual/text">) {
  if (process.env.NODE_ENV === "production") notFound();
  const { mode, width, size } = await props.searchParams;
  return <TextCheck mode={mode === "ascii" ? "ascii" : undefined} width={Number(width) || 640} size={Number(size) || 48} />;
}
