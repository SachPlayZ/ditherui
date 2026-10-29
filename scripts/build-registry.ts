// Generates registry.json from registry/meta. Usage: node scripts/build-registry.ts [out]
// REGISTRY_URL sets where components fetch the engine from (e.g. http://localhost:3000/r for local installs).
import { readdirSync, writeFileSync } from "node:fs";
import { components } from "../registry/meta/index.ts";

const out = process.argv[2] ?? "registry.json";
// shortcut: engine is referenced by URL because `@ditherui/engine` only resolves once the namespace
// is configured by the user or listed in the shadcn index; switch after the index listing (phase 2).
const base = process.env.REGISTRY_URL ?? "https://ditherui.com/r";
const engineFiles = readdirSync("registry/engine")
  .filter((f) => /\.tsx?$/.test(f) && !f.includes(".test."))
  .sort();

const registry = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "ditherui",
  homepage: "https://ditherui.com",
  items: [
    {
      name: "engine",
      type: "registry:lib",
      title: "Engine",
      description: "The shared WebGL2 render engine every ditherui component uses.",
      files: engineFiles.map((f) => ({ path: `registry/engine/${f}`, type: "registry:lib", target: `lib/ditherui/${f}` })),
    },
    ...components.map((c) => ({
      name: c.name,
      type: "registry:ui",
      title: c.title,
      description: c.description,
      categories: [c.category],
      registryDependencies: [`${base}/engine.json`],
      dependencies: [],
      files: c.files.map((path) => ({ path, type: "registry:ui" })),
      meta: { modes: c.modes },
    })),
  ],
};

writeFileSync(out, JSON.stringify(registry, null, 2) + "\n");
