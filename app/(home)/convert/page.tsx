import type { Metadata } from "next";
import { Converter } from "@/components/site/converter";

export const metadata: Metadata = {
  title: "Convert",
  description: "Turn an image into dither or ASCII in your browser, download it, and copy the matching DitherImage code.",
};

export default function ConvertPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold">Convert</h1>
        <p className="text-fd-muted-foreground">Dither or ASCII any image, then download it or copy the component code. Everything runs in your browser.</p>
      </div>
      <Converter />
    </main>
  );
}
