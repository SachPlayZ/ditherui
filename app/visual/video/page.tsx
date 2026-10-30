import { notFound } from "next/navigation";
import { VideoCheck } from "@/components/site/video-check";

// Test-only route: a video source for the e2e video spec; not part of the production site.
export default async function Page(props: PageProps<"/visual/video">) {
  if (process.env.NODE_ENV === "production") notFound();
  const { mode } = await props.searchParams;
  return <VideoCheck mode={mode === "ascii" ? "ascii" : undefined} />;
}
