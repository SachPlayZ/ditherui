"use client";

import { CodeBlock, Pre } from "fumadocs-ui/components/codeblock";
import dynamic from "next/dynamic";
import { useState } from "react";

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
