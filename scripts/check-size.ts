// Fails if the engine or any component exceeds its min+gzip budget.
import { build } from "esbuild";
import { gzipSync } from "node:zlib";
import { components } from "../registry/meta/index.ts";

const BUDGETS = { engine: 15_000, component: 3_000 };

async function size(entry: string, external: string[]): Promise<number> {
  const result = await build({ entryPoints: [entry], bundle: true, minify: true, format: "esm", write: false, external: ["react", "react/*", "react-dom", ...external] });
  return gzipSync(result.outputFiles[0].contents).length;
}

const rows: Array<[string, number, number]> = [["engine", await size("registry/engine/index.ts", []), BUDGETS.engine]];
for (const c of components) {
  for (const file of c.files) rows.push([c.name, await size(file, ["@/lib/ditherui/*"]), BUDGETS.component]);
}

let failed = false;
for (const [name, bytes, budget] of rows) {
  const over = bytes > budget;
  failed ||= over;
  console.log(`${over ? "✗" : "✓"} ${name.padEnd(20)} ${(bytes / 1000).toFixed(2)} kB / ${budget / 1000} kB`);
}
if (failed) process.exit(1);
