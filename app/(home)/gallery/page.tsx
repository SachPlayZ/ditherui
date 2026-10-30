import type { Metadata } from "next";
import Link from "next/link";
import { Badges } from "@/components/site/wall";
import { components } from "@/registry/meta";

export const metadata: Metadata = { title: "Gallery", description: "Every dotgrain component, by category." };

export default function GalleryPage() {
  const categories = [...new Set(components.map((c) => c.category))];
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-8">
      <h1 className="text-3xl font-semibold">Gallery</h1>
      {categories.map((category) => (
        <section key={category} className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold capitalize">{category}</h2>
          <ul className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(min(100%,280px),1fr))]">
            {components
              .filter((c) => c.category === category)
              .map((c) => (
                <li key={c.name}>
                  <Link href={`/docs/components/${c.name}`} className="flex h-full flex-col gap-2 rounded-xl border p-4 hover:border-fd-primary">
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-medium">{c.title}</span>
                      <Badges modes={c.modes} />
                    </span>
                    <span className="text-sm text-fd-muted-foreground">{c.description}</span>
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
