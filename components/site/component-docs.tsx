import { Code, RegistryFile } from "./code";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import { TypeTable } from "fumadocs-ui/components/type-table";
import { addCommand, PACKAGE_MANAGERS, type PackageManager, REGISTRY_URL } from "@/lib/install";
import { gitConfig } from "@/lib/shared";
import { components } from "@/registry/meta";
import { CopyPrompt } from "./playground";

const metaOf = (name: string) => {
  const meta = components.find((c) => c.name === name);
  if (!meta) throw new Error(`Unknown component "${name}"`);
  return meta;
};

/** Mode badges and the copy-prompt action, under the page title. */
export function ComponentHeader({ name }: { name: string }) {
  return (
    <div className="not-prose flex flex-wrap items-center justify-between gap-3">
      <div className="flex gap-2">
        {metaOf(name).modes.map((mode) => (
          <span key={mode} className="rounded-full border px-2.5 py-0.5 font-mono text-xs text-fd-muted-foreground">
            {mode}
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <a
          href={`https://v0.dev/chat/api/open?url=${encodeURIComponent(`${REGISTRY_URL}/${name}.json`)}`}
          target="_blank"
          rel="noreferrer"
          className="rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-fd-accent"
        >
          Open in v0
        </a>
        <CopyPrompt name={name} />
      </div>
    </div>
  );
}

/** CLI (per package manager) and manual install instructions. */
export function Install({ name }: { name: string }) {
  const meta = metaOf(name);
  const engine = `https://github.com/${gitConfig.user}/${gitConfig.repo}/tree/${gitConfig.branch}/registry/engine`;
  return (
    <Tabs items={["CLI", "Manual"]}>
      <Tab value="CLI">
        <Tabs groupId="package-manager" persist items={Object.keys(PACKAGE_MANAGERS)}>
          {(Object.keys(PACKAGE_MANAGERS) as PackageManager[]).map((pm) => (
            <Tab key={pm} value={pm}>
              <Code lang="bash" code={addCommand(`${REGISTRY_URL}/${meta.name}.json`, pm)} />
            </Tab>
          ))}
        </Tabs>
      </Tab>
      <Tab value="Manual">
        <ol>
          <li>
            Copy the <a href={engine}>engine files</a> into <code>lib/dotgrain/</code>.
          </li>
          <li>
            Copy this into <code>components/ui/{meta.name}.tsx</code>. Imports assume the <code>@/</code> path alias.
          </li>
        </ol>
        <RegistryFile name={meta.name} />
      </Tab>
    </Tabs>
  );
}

/** Props table generated from the component's metadata only. */
export function PropsTable({ name }: { name: string }) {
  return (
    <TypeTable
      type={Object.fromEntries(
        metaOf(name).props.map((p) => [p.name, { type: p.type, default: p.default, description: p.description }]),
      )}
    />
  );
}
