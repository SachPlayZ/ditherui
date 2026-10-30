import Link from "next/link";
import { Wall } from "@/components/site/wall";
import { HeroTerminal } from "@/registry/ui/hero-terminal";

const cta = "inline-flex items-center rounded-md px-4 py-2 font-medium";

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-8">
      <HeroTerminal
        title="Grain for the web"
        description="Dither and ASCII components for React. Real DOM text, one tiny WebGL2 engine, installed with the shadcn CLI."
        actions={
          <>
            <Link href="/docs" className={`${cta} bg-fd-primary text-fd-primary-foreground`}>
              Get started
            </Link>
            <Link href="/gallery" className={`${cta} border`}>
              Browse components
            </Link>
          </>
        }
        lines={["$ npx shadcn@latest add https://dotgrain.space/r/dither-field.json", "✔ Done. dither-field + engine added.", "$ "]}
      />
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">Every component, live</h2>
        <Wall />
      </section>
    </main>
  );
}
