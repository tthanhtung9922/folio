"use client";

import { useEffect, useState } from "react";
import { codeToHtml } from "shiki";

interface CodeHighlightProps {
  code: string;
  lang?: string;
}

export function CodeHighlight({ code, lang = "json" }: CodeHighlightProps) {
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    if (!code) {
      setHtml("");
      return;
    }

    async function highlight() {
      try {
        const result = await codeToHtml(code, {
          lang,
          theme: "github-light-default",
        });
        setHtml(result);
      } catch (error) {
        console.error("Lỗi khi render Shiki:", error);
        setHtml(`<pre><code>${code}</code></pre>`);
      }
    }

    highlight();
  }, [code, lang]);

  if (!html) {
    return (
      <div className="h-full min-h-30 w-full bg-warm-canvas border-[0.5px] border-parchment-border rounded-xs animate-pulse" />
    );
  }

  return (
    <div
      className="border-[0.5px] border-parchment-border rounded-xs font-mono text-[14px] leading-relaxed [&>pre]:bg-warm-canvas! [&>pre]:p-4 [&>pre]:whitespace-pre-wrap [&>pre]:break-all [&>pre]:rounded-xs!"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
