"use client";

import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { useEffect } from "react";

export default function CodeHighlighted({ code, lang, onReady }: { code: string; lang: string; onReady: () => void }) {
  useEffect(onReady, [onReady]);
  return <DynamicCodeBlock lang={lang} code={code} />;
}
