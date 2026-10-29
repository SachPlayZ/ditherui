// Renders every docs page's OG image to public/og/docs/<slugs>/image.png at build time,
// so the image renderer (resvg wasm) never ships in the Cloudflare Worker.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { dirname, join } from "node:path";
import { appName, docsImageRoute } from "../lib/shared.ts";

// `next` has no exports map, so plain Node ESM can't resolve the extensionless `next/og` that fumadocs imports.
registerHooks({ resolve: (specifier, context, next) => next(specifier === "next/og" ? "next/og.js" : specifier, context) });
const { generateOGImage } = await import("fumadocs-ui/og");

const root = "content/docs";
const files = readdirSync(root, { recursive: true, encoding: "utf8" }).filter((f) => f.endsWith(".mdx"));

for (const file of files) {
  const source = readFileSync(join(root, file), "utf8");
  // shortcut: reads single-line `title:` / `description:` frontmatter only; use a YAML parser if pages need more.
  const field = (key: string) => source.match(new RegExp(`^${key}:\\s*(.+)$`, "m"))?.[1].trim().replace(/^(['"])(.*)\1$/, "$2");
  const title = field("title");
  if (!title) throw new Error(`${file}: missing title`);
  // Same slugs as fumadocs: path without extension, `index` collapses into its folder.
  const slugs = file.replace(/\.mdx$/, "").split("/").filter((s) => s !== "index");
  const out = join("public", docsImageRoute, ...slugs, "image.png");
  const image = generateOGImage({ title, description: field("description"), site: appName });
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, Buffer.from(await image.arrayBuffer()));
  console.log(out);
}
