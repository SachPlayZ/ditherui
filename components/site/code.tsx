"use client";

import { CodeBlock, Pre } from "fumadocs-ui/components/codeblock";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Browser only: Shiki in the server bundle would push the Worker past its size limit.
const Highlighted = dynamic(() => import("./code-highlighted"), { ssr: false });

/** Plain code block on the server and first paint, swapped for the highlighted one once Shiki loads. */
export function Code({ code, lang }: { code: string; lang: string }) {
  const [ready, setReady] = useState(false);
  return (
    <>
      <div hidden={!ready}>
        <Highlighted code={code} lang={lang} onReady={() => setReady(true)} />
      </div>
      {!ready && (
        <CodeBlock>
          <Pre>
            <code>{code}</code>
          </Pre>
        </CodeBlock>
      )}
    </>
  );
}

/** A registry item's file contents, read from the published `/r/<name>.json` (the docs Worker has no source files). */
export function RegistryFile({ name }: { name: string }) {
  const [code, setCode] = useState<string>();
  useEffect(() => {
    fetch(`/r/${name}.json`)
      .then((r) => r.json() as Promise<{ files: { content: string }[] }>)
      .then((item) => setCode(item.files[0].content))
      .catch(() => setCode(`// Couldn't load /r/${name}.json; run \`pnpm registry:build\`.`));
  }, [name]);
  return code === undefined ? <a href={`/r/${name}.json`}>/r/{name}.json</a> : <Code code={code} lang="tsx" />;
}
