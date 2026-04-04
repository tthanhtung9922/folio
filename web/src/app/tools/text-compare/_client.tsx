"use client";

import { diffLines } from "diff";
import { ArrowLeftRight, Check, Columns2, Copy } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useLayout } from "@/context/LayoutContext";
import { useLocale } from "@/context/LocaleContext";

type Mode = "inline" | "side-by-side";

export default function TextCompareClient() {
  const { maxWidthClass, transitionClass } = useLayout();
  const { t } = useLocale();

  const [mode, setMode] = useState<Mode>("inline");
  const [textA, setTextA] = useState("");
  const [textB, setTextB] = useState("");
  const [copied, setCopied] = useState(false);

  const hasInput = textA.trim() !== "" && textB.trim() !== "";
  const changes = hasInput ? diffLines(textA, textB) : [];
  const addedLines = changes
    .filter((c) => c.added)
    .reduce((sum, c) => sum + (c.count ?? 0), 0);
  const removedLines = changes
    .filter((c) => c.removed)
    .reduce((sum, c) => sum + (c.count ?? 0), 0);
  const isIdentical = hasInput && addedLines === 0 && removedLines === 0;

  const handleCopyDiff = async () => {
    const unified = changes
      .map((part) => {
        const prefix = part.added ? "+ " : part.removed ? "- " : "  ";
        return part.value
          .split("\n")
          .filter((line, i, arr) => !(i === arr.length - 1 && line === ""))
          .map((line) => `${prefix}${line}`)
          .join("\n");
      })
      .join("\n");
    await navigator.clipboard.writeText(unified);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const MODES: { id: Mode; label: string; icon: React.ReactNode }[] = [
    {
      id: "inline",
      label: "inline",
      icon: <ArrowLeftRight size={13} strokeWidth={1.5} />,
    },
    {
      id: "side-by-side",
      label: "side by side",
      icon: <Columns2 size={13} strokeWidth={1.5} />,
    },
  ];

  return (
    <main
      className={`${maxWidthClass} ${transitionClass} mx-auto py-12 md:py-16`}
    >
      {/* ── Header ── */}
      <div className="mb-10 border-b-2 border-ink pb-8">
        <div className="text-terracotta text-[11px] font-medium tracking-[0.15em] lowercase mb-4">
          {"// tools · text-compare"}
        </div>
        <h1 className="text-[44px] font-display leading-tight mb-4">
          Text Compare
        </h1>
        <p className="text-[15px] text-ink font-normal italic border-l-2 border-terracotta pl-4 max-w-xl">
          {t("textCompare.description")}
        </p>
      </div>

      {/* ── Mode tabs ── */}
      <div className="flex items-center justify-between mb-8">
        <div className="inline-flex border border-parchment-border rounded-xs overflow-hidden">
          {MODES.flatMap((m, i) => {
            const items: React.ReactNode[] = [];
            if (i > 0)
              items.push(
                <div
                  key={`sep-${m.id}`}
                  className="w-px bg-parchment-border self-stretch"
                />,
              );
            items.push(
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={`flex items-center gap-2 px-5 py-2.5 text-[11px] font-medium tracking-[0.12em] lowercase transition-all duration-150 cursor-pointer ${
                  mode === m.id
                    ? "bg-ink text-parchment"
                    : "text-ghost-ink hover:bg-warm-canvas hover:text-ink"
                }`}
              >
                {m.icon}
                {m.label}
              </button>,
            );
            return items;
          })}
        </div>

        {hasInput && !isIdentical && (
          <button
            type="button"
            onClick={handleCopyDiff}
            className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest border border-parchment-border px-2 py-0.5 rounded-xs text-ghost-ink hover:border-ink hover:text-ink transition-colors duration-150 cursor-pointer font-mono"
          >
            {copied ? (
              <Check size={11} strokeWidth={1.5} />
            ) : (
              <Copy size={11} strokeWidth={1.5} />
            )}
            {copied ? "copied" : "copy diff"}
          </button>
        )}
      </div>

      {/* ── Input panels ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-8">
        {/* Text A */}
        <div className="flex flex-col gap-3">
          <div className="h-8 flex items-center justify-between">
            <span className="text-[11px] font-medium tracking-[0.15em] lowercase text-terracotta">
              {"// original"}
            </span>
            {textA.trim() && (
              <Badge variant="default">{textA.split("\n").length} lines</Badge>
            )}
          </div>
          <textarea
            value={textA}
            onChange={(e) => setTextA(e.target.value)}
            placeholder={t("textCompare.placeholderA")}
            spellCheck={false}
            className="w-full min-h-70 bg-warm-canvas/30 border-[0.5px] border-parchment-border focus:border-terracotta rounded-xs p-4 font-mono text-[13px] leading-relaxed text-ink outline-none resize-none transition-colors duration-150 placeholder:text-ghost-ink/60"
          />
        </div>

        {/* Text B */}
        <div className="flex flex-col gap-3">
          <div className="h-8 flex items-center justify-between">
            <span className="text-[11px] font-medium tracking-[0.15em] lowercase text-[#8C6B77]">
              {"// modified"}
            </span>
            {textB.trim() && (
              <Badge variant="default">{textB.split("\n").length} lines</Badge>
            )}
          </div>
          <textarea
            value={textB}
            onChange={(e) => setTextB(e.target.value)}
            placeholder={t("textCompare.placeholderB")}
            spellCheck={false}
            className="w-full min-h-70 bg-warm-canvas/30 border-[0.5px] border-parchment-border focus:border-terracotta rounded-xs p-4 font-mono text-[13px] leading-relaxed text-ink outline-none resize-none transition-colors duration-150 placeholder:text-ghost-ink/60"
          />
        </div>
      </div>

      {/* ── Diff output ── */}
      {hasInput && (
        <div className="flex flex-col gap-4">
          {/* Summary bar */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium tracking-[0.15em] lowercase text-terracotta">
              {"// diff results"}
            </span>
            <div className="flex items-center gap-3 font-mono text-[11px]">
              {isIdentical ? (
                <span className="text-ghost-ink">identical</span>
              ) : (
                <>
                  {addedLines > 0 && (
                    <span className="text-[#5B7A70]">+{addedLines} added</span>
                  )}
                  {removedLines > 0 && (
                    <span className="text-terracotta">
                      −{removedLines} removed
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {isIdentical ? (
            <div className="border-[0.5px] border-parchment-border rounded-xs py-10 flex items-center justify-center">
              <span className="text-[13px] text-ghost-ink font-mono">
                {t("textCompare.identical")}
              </span>
            </div>
          ) : mode === "inline" ? (
            <InlineDiff changes={changes} />
          ) : (
            <SideBySideDiff changes={changes} />
          )}
        </div>
      )}

      {!hasInput && (
        <div className="border-[0.5px] border-dashed border-ghost-ink/30 rounded-xs py-10 flex items-center justify-center">
          <span className="text-[12px] text-ghost-ink/60 font-mono">
            {t("textCompare.comparePlaceholder")}
          </span>
        </div>
      )}
    </main>
  );
}

// ── Inline diff ─────────────────────────────────────────────────────────────

function InlineDiff({ changes }: { changes: ReturnType<typeof diffLines> }) {
  let lineNum = 0;

  return (
    <div className="border-[0.5px] border-parchment-border rounded-xs overflow-hidden font-mono text-[13px]">
      {changes.map((part, idx) => {
        const lines = part.value.split("\n");
        // Remove trailing empty string from split
        if (lines[lines.length - 1] === "") lines.pop();

        return lines.map((line, lineIdx) => {
          if (!part.added && !part.removed) lineNum++;
          const num = !part.added && !part.removed ? lineNum : null;

          return (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: diff chunks are positionally ordered
              key={`${idx}-${lineIdx}`}
              className={`flex items-baseline border-b-[0.5px] border-parchment-border last:border-0 ${
                part.added
                  ? "bg-[#5B7A70]/6"
                  : part.removed
                    ? "bg-terracotta/6"
                    : ""
              }`}
            >
              <span className="w-10 shrink-0 text-right pr-3 py-1 text-ghost-ink/50 text-[11px] select-none border-r-[0.5px] border-parchment-border">
                {num ?? ""}
              </span>
              <span
                className={`w-5 shrink-0 text-center py-1 font-medium select-none ${
                  part.added
                    ? "text-[#5B7A70]"
                    : part.removed
                      ? "text-terracotta"
                      : "text-transparent"
                }`}
              >
                {part.added ? "+" : part.removed ? "−" : " "}
              </span>
              <span className="flex-1 py-1 pr-4 break-all whitespace-pre-wrap">
                {line || "\u00A0"}
              </span>
            </div>
          );
        });
      })}
    </div>
  );
}

// ── Side-by-side diff ───────────────────────────────────────────────────────

function SideBySideDiff({
  changes,
}: {
  changes: ReturnType<typeof diffLines>;
}) {
  const leftLines: { text: string; type: "removed" | "unchanged" }[] = [];
  const rightLines: { text: string; type: "added" | "unchanged" }[] = [];

  for (const part of changes) {
    const lines = part.value.split("\n");
    if (lines[lines.length - 1] === "") lines.pop();

    if (part.added) {
      for (const line of lines) {
        rightLines.push({ text: line, type: "added" });
      }
    } else if (part.removed) {
      for (const line of lines) {
        leftLines.push({ text: line, type: "removed" });
      }
    } else {
      // Pad the shorter side before adding unchanged lines
      while (leftLines.length < rightLines.length) {
        leftLines.push({ text: "", type: "unchanged" });
      }
      while (rightLines.length < leftLines.length) {
        rightLines.push({ text: "", type: "unchanged" });
      }
      for (const line of lines) {
        leftLines.push({ text: line, type: "unchanged" });
        rightLines.push({ text: line, type: "unchanged" });
      }
    }
  }

  // Final padding
  while (leftLines.length < rightLines.length) {
    leftLines.push({ text: "", type: "unchanged" });
  }
  while (rightLines.length < leftLines.length) {
    rightLines.push({ text: "", type: "unchanged" });
  }

  const maxLines = Math.max(leftLines.length, rightLines.length);

  return (
    <div className="grid grid-cols-2 gap-0 border-[0.5px] border-parchment-border rounded-xs overflow-hidden font-mono text-[13px]">
      {Array.from({ length: maxLines }, (_, i) => {
        const left = leftLines[i];
        const right = rightLines[i];
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: lines are positionally ordered
          <div key={i} className="contents">
            <div
              className={`flex items-baseline border-b-[0.5px] border-parchment-border border-r-[0.5px] ${
                left?.type === "removed" ? "bg-terracotta/6" : ""
              }`}
            >
              <span className="w-8 shrink-0 text-right pr-2 py-1 text-ghost-ink/50 text-[11px] select-none">
                {i + 1}
              </span>
              <span
                className={`w-4 shrink-0 text-center py-1 font-medium select-none ${
                  left?.type === "removed"
                    ? "text-terracotta"
                    : "text-transparent"
                }`}
              >
                {left?.type === "removed" ? "−" : " "}
              </span>
              <span className="flex-1 py-1 pr-3 break-all whitespace-pre-wrap">
                {left?.text || "\u00A0"}
              </span>
            </div>
            <div
              className={`flex items-baseline border-b-[0.5px] border-parchment-border ${
                right?.type === "added" ? "bg-[#5B7A70]/6" : ""
              }`}
            >
              <span className="w-8 shrink-0 text-right pr-2 py-1 text-ghost-ink/50 text-[11px] select-none">
                {i + 1}
              </span>
              <span
                className={`w-4 shrink-0 text-center py-1 font-medium select-none ${
                  right?.type === "added"
                    ? "text-[#5B7A70]"
                    : "text-transparent"
                }`}
              >
                {right?.type === "added" ? "+" : " "}
              </span>
              <span className="flex-1 py-1 pr-3 break-all whitespace-pre-wrap">
                {right?.text || "\u00A0"}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
