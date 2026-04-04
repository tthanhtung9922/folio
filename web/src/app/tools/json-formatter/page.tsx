"use client";

import {
  ArrowLeftRight,
  Braces,
  Check,
  Copy,
  GitBranch,
  Wand2,
} from "lucide-react";
import { useState } from "react";
import { CodeHighlight } from "@/components/CodeHighlight";
import { Badge } from "@/components/ui/badge";
import { useLayout } from "@/context/LayoutContext";
import { useLocale } from "@/context/LocaleContext";

type Mode = "format" | "compare" | "tree";
type DiffType = "added" | "removed" | "modified";
type DiffEntry = {
  path: string;
  type: DiffType;
  valueA?: unknown;
  valueB?: unknown;
};

// ── JSON repair ──────────────────────────────────────────────────────────────

function attemptFix(raw: string): string {
  let s = raw.trim();
  // single quotes → double quotes
  s = s.replace(/'/g, '"');
  // unquoted object keys
  s = s.replace(/([{,]\s*)([a-zA-Z_$][\w$]*)\s*:/g, '$1"$2":');
  // trailing commas before } or ]
  s = s.replace(/,(\s*[}\]])/g, "$1");
  return s;
}

// ── JSON diff ────────────────────────────────────────────────────────────────

function diffJson(a: unknown, b: unknown, path = ""): DiffEntry[] {
  if (
    typeof a !== "object" ||
    typeof b !== "object" ||
    a === null ||
    b === null ||
    Array.isArray(a) !== Array.isArray(b)
  ) {
    if (JSON.stringify(a) !== JSON.stringify(b)) {
      return [{ path: path || "root", type: "modified", valueA: a, valueB: b }];
    }
    return [];
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    const results: DiffEntry[] = [];
    const len = Math.max(a.length, b.length);
    for (let i = 0; i < len; i++) {
      const p = `${path}[${i}]`;
      if (i >= a.length) results.push({ path: p, type: "added", valueB: b[i] });
      else if (i >= b.length)
        results.push({ path: p, type: "removed", valueA: a[i] });
      else results.push(...diffJson(a[i], b[i], p));
    }
    return results;
  }

  const aObj = a as Record<string, unknown>;
  const bObj = b as Record<string, unknown>;
  const results: DiffEntry[] = [];
  for (const key of new Set([...Object.keys(aObj), ...Object.keys(bObj)])) {
    const p = path ? `${path}.${key}` : key;
    if (!(key in aObj))
      results.push({ path: p, type: "added", valueB: bObj[key] });
    else if (!(key in bObj))
      results.push({ path: p, type: "removed", valueA: aObj[key] });
    else results.push(...diffJson(aObj[key], bObj[key], p));
  }
  return results;
}

function valuePreview(v: unknown): string {
  if (v === null) return "null";
  if (typeof v === "string") return `"${v}"`;
  if (Array.isArray(v)) return `[… ${v.length}]`;
  if (typeof v === "object") return `{… ${Object.keys(v as object).length}}`;
  return String(v);
}

// ── Tree Node ─────────────────────────────────────────────────────────────────

function TreeNode({ data, depth = 0 }: { data: unknown; depth?: number }) {
  const [collapsed, setCollapsed] = useState(depth > 1);

  if (data === null)
    return <span className="font-mono text-[13px] text-ghost-ink">null</span>;
  if (typeof data === "boolean")
    return (
      <span className="font-mono text-[13px] text-[#5B7A70]">
        {String(data)}
      </span>
    );
  if (typeof data === "number")
    return <span className="font-mono text-[13px] text-[#5B7A70]">{data}</span>;
  if (typeof data === "string")
    return (
      <span className="font-mono text-[13px] text-[#8C6B77]">"{data}"</span>
    );

  if (Array.isArray(data)) {
    if (data.length === 0)
      return <span className="font-mono text-[13px] text-ghost-ink">[]</span>;
    return (
      <div>
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-1.5 font-mono text-[13px] text-faded-ink hover:text-ink transition-colors duration-150 cursor-pointer"
        >
          <span className="text-[9px] text-ghost-ink w-3 leading-none">
            {collapsed ? "▶" : "▼"}
          </span>
          <span className="text-ghost-ink">[</span>
          <span className="text-terracotta text-[11px] tracking-widest">
            {data.length}
          </span>
          <span className="text-ghost-ink">]</span>
        </button>
        {!collapsed && (
          <div className="ml-3 pl-3 border-l border-parchment-border mt-0.5">
            {data.map((item, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: index is the structural key for arrays
              <div key={i} className="flex gap-2 py-0.5 items-baseline">
                <span className="font-mono text-[12px] text-ghost-ink shrink-0 min-w-[1.5rem] text-right">
                  {i}
                </span>
                <span className="text-ghost-ink font-mono text-[13px]">:</span>
                <TreeNode data={item} depth={depth + 1} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  const obj = data as Record<string, unknown>;
  const keys = Object.keys(obj);
  if (keys.length === 0)
    return <span className="font-mono text-[13px] text-ghost-ink">{"{}"}</span>;

  return (
    <div>
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-1.5 font-mono text-[13px] text-faded-ink hover:text-ink transition-colors duration-150 cursor-pointer"
      >
        <span className="text-[9px] text-ghost-ink w-3 leading-none">
          {collapsed ? "▶" : "▼"}
        </span>
        <span className="text-ghost-ink">{"{"}</span>
        <span className="text-terracotta text-[11px] tracking-widest">
          {keys.length}
        </span>
        <span className="text-ghost-ink">{"}"}</span>
      </button>
      {!collapsed && (
        <div className="ml-3 pl-3 border-l border-parchment-border mt-0.5">
          {keys.map((key) => (
            <div
              key={key}
              className="flex gap-2 py-0.5 items-baseline flex-wrap"
            >
              <span className="font-mono text-[13px] text-terracotta shrink-0">
                "{key}"
              </span>
              <span className="text-ghost-ink font-mono text-[13px]">:</span>
              <TreeNode data={obj[key]} depth={depth + 1} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function JsonFormatter() {
  const { maxWidthClass, transitionClass } = useLayout();
  const { t } = useLocale();
  const [mode, setMode] = useState<Mode>("format");

  // Format + Tree shared state
  const [input, setInput] = useState("");
  const [parsed, setParsed] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [wasFixed, setWasFixed] = useState(false);

  // Format-only state
  const [minified, setMinified] = useState(false);
  const [copied, setCopied] = useState(false);

  // Compare state
  const [inputA, setInputA] = useState("");
  const [parsedA, setParsedA] = useState<unknown>(null);
  const [errorA, setErrorA] = useState<string | null>(null);
  const [inputB, setInputB] = useState("");
  const [parsedB, setParsedB] = useState<unknown>(null);
  const [errorB, setErrorB] = useState<string | null>(null);
  const [diffEntries, setDiffEntries] = useState<DiffEntry[]>([]);
  const [diffComputed, setDiffComputed] = useState(false);

  // ── Format / Tree handlers ────────────────────────────────────────────────

  const processInput = (raw: string) => {
    setInput(raw);
    setWasFixed(false);
    if (!raw.trim()) {
      setParsed(null);
      setError(null);
      return;
    }
    try {
      setParsed(JSON.parse(raw));
      setError(null);
    } catch (e) {
      setParsed(null);
      setError(e instanceof Error ? e.message : t("json.invalid"));
    }
  };

  const handleFix = () => {
    const fixed = attemptFix(input);
    setInput(fixed);
    setWasFixed(false);
    if (!fixed.trim()) return;
    try {
      setParsed(JSON.parse(fixed));
      setError(null);
      setWasFixed(true);
    } catch (e) {
      setParsed(null);
      setError(e instanceof Error ? e.message : t("json.cantFix"));
    }
  };

  const outputStr =
    parsed !== null
      ? minified
        ? JSON.stringify(parsed)
        : JSON.stringify(parsed, null, 2)
      : "";

  const handleCopy = async () => {
    if (!outputStr) return;
    await navigator.clipboard.writeText(outputStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Compare handlers ──────────────────────────────────────────────────────

  const handleChangeA = (raw: string) => {
    setInputA(raw);
    setDiffComputed(false);
    if (!raw.trim()) {
      setParsedA(null);
      setErrorA(null);
      return;
    }
    try {
      const result = JSON.parse(raw);
      setParsedA(result);
      setErrorA(null);
      if (parsedB !== null) {
        setDiffEntries(diffJson(result, parsedB));
        setDiffComputed(true);
      }
    } catch {
      setParsedA(null);
      setErrorA(t("json.invalid"));
    }
  };

  const handleChangeB = (raw: string) => {
    setInputB(raw);
    setDiffComputed(false);
    if (!raw.trim()) {
      setParsedB(null);
      setErrorB(null);
      return;
    }
    try {
      const result = JSON.parse(raw);
      setParsedB(result);
      setErrorB(null);
      if (parsedA !== null) {
        setDiffEntries(diffJson(parsedA, result));
        setDiffComputed(true);
      }
    } catch {
      setParsedB(null);
      setErrorB(t("json.invalid"));
    }
  };

  // ── Tab config ────────────────────────────────────────────────────────────

  const MODES: { id: Mode; label: string; icon: React.ReactNode }[] = [
    {
      id: "format",
      label: "format",
      icon: <Braces size={13} strokeWidth={1.5} />,
    },
    {
      id: "compare",
      label: "compare",
      icon: <ArrowLeftRight size={13} strokeWidth={1.5} />,
    },
    {
      id: "tree",
      label: "tree",
      icon: <GitBranch size={13} strokeWidth={1.5} />,
    },
  ];

  const addedCount = diffEntries.filter((d) => d.type === "added").length;
  const removedCount = diffEntries.filter((d) => d.type === "removed").length;
  const modifiedCount = diffEntries.filter((d) => d.type === "modified").length;

  // ── Shared input textarea ─────────────────────────────────────────────────

  const sharedTextarea = (
    <div className="flex flex-col gap-3">
      <div className="h-8 flex items-center justify-between">
        <span className="text-[11px] font-medium tracking-[0.15em] lowercase text-terracotta">
          {"// input"}
        </span>
        <div className="flex items-center gap-2">
          {wasFixed && <Badge variant="verified">✓ fixed</Badge>}
          {error && <Badge variant="error">✗ invalid</Badge>}
          {parsed !== null && !error && !wasFixed && (
            <Badge variant="verified">✓ valid</Badge>
          )}
        </div>
      </div>
      <textarea
        value={input}
        onChange={(e) => processInput(e.target.value)}
        placeholder={t("json.placeholder")}
        spellCheck={false}
        className={`w-full min-h-[420px] bg-warm-canvas/30 border-[0.5px] ${
          error
            ? "border-terracotta"
            : "border-parchment-border focus:border-terracotta"
        } rounded-xs p-4 font-mono text-[13px] leading-relaxed text-ink outline-none resize-none transition-colors duration-150 placeholder:text-ghost-ink/60`}
      />
      {error && (
        <div className="flex items-center justify-between gap-4">
          <p className="text-[12px] text-terracotta font-mono truncate">
            {error}
          </p>
          <button
            type="button"
            onClick={handleFix}
            className="shrink-0 flex items-center gap-1.5 text-[10px] uppercase tracking-widest border border-parchment-border px-2.5 py-1 rounded-xs text-ghost-ink hover:border-terracotta hover:text-terracotta transition-colors duration-150 cursor-pointer font-mono"
          >
            <Wand2 size={11} strokeWidth={1.5} />
            auto fix
          </button>
        </div>
      )}
      {wasFixed && (
        <p className="text-[12px] text-[#5B7A70] font-mono">
          {t("json.autoFixed")}
        </p>
      )}
    </div>
  );

  return (
    <main
      className={`${maxWidthClass} ${transitionClass} mx-auto py-12 md:py-16`}
    >
      {/* ── Header ── */}
      <div className="mb-10 border-b-2 border-ink pb-8">
        <div className="text-terracotta text-[11px] font-medium tracking-[0.15em] lowercase mb-4">
          {"// tools · json formatter"}
        </div>
        <h1 className="text-[44px] font-display leading-tight mb-4">
          JSON Formatter
        </h1>
        <p className="text-[15px] text-ink font-normal italic border-l-2 border-terracotta pl-4 max-w-xl">
          {t("json.description")}
        </p>
      </div>

      {/* ── Mode tabs ── */}
      <div className="inline-flex border border-parchment-border rounded-xs overflow-hidden mb-8">
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

      {/* ── Format mode ── */}
      {mode === "format" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          {/* Left: input */}
          {sharedTextarea}

          {/* Right: output */}
          <div className="flex flex-col gap-3">
            <div className="h-8 flex items-center justify-between">
              <span className="text-[11px] font-medium tracking-[0.15em] lowercase text-terracotta">
                {"// output"}
              </span>
              <div className="flex items-center gap-2">
                {/* Beautify / Minify toggle */}
                <div className="inline-flex border border-parchment-border rounded-xs overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setMinified(false)}
                    className={`px-3 py-1 text-[10px] uppercase tracking-widest font-mono transition-colors duration-150 cursor-pointer ${
                      !minified
                        ? "bg-ink text-parchment"
                        : "text-ghost-ink hover:text-ink"
                    }`}
                  >
                    beautify
                  </button>
                  <div className="w-px bg-parchment-border self-stretch" />
                  <button
                    type="button"
                    onClick={() => setMinified(true)}
                    className={`px-3 py-1 text-[10px] uppercase tracking-widest font-mono transition-colors duration-150 cursor-pointer ${
                      minified
                        ? "bg-ink text-parchment"
                        : "text-ghost-ink hover:text-ink"
                    }`}
                  >
                    minify
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!outputStr}
                  className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest border border-parchment-border px-2 py-0.5 rounded-xs text-ghost-ink hover:border-ink hover:text-ink transition-colors duration-150 cursor-pointer font-mono disabled:opacity-30 disabled:cursor-default"
                >
                  {copied ? (
                    <Check size={11} strokeWidth={1.5} />
                  ) : (
                    <Copy size={11} strokeWidth={1.5} />
                  )}
                  {copied ? "copied" : "copy"}
                </button>
              </div>
            </div>

            {outputStr ? (
              <CodeHighlight code={outputStr} lang="json" />
            ) : (
              <div className="min-h-[420px] bg-warm-canvas/20 border-[0.5px] border-parchment-border rounded-xs flex items-center justify-center">
                <span className="text-[12px] text-ghost-ink/60 font-mono">
                  {t("json.outputHere")}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Compare mode ── */}
      {mode === "compare" && (
        <div className="flex flex-col gap-8">
          {/* Two input panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* JSON A */}
            <div className="flex flex-col gap-3">
              <div className="h-8 flex items-center justify-between">
                <span className="text-[11px] font-medium tracking-[0.15em] lowercase text-terracotta">
                  {"// json a"}
                </span>
                {errorA ? (
                  <Badge variant="error">✗ invalid</Badge>
                ) : parsedA !== null ? (
                  <Badge variant="verified">✓ valid</Badge>
                ) : null}
              </div>
              <textarea
                value={inputA}
                onChange={(e) => handleChangeA(e.target.value)}
                placeholder={t("json.placeholderA")}
                spellCheck={false}
                className={`w-full min-h-[280px] bg-warm-canvas/30 border-[0.5px] ${
                  errorA
                    ? "border-terracotta"
                    : "border-parchment-border focus:border-terracotta"
                } rounded-xs p-4 font-mono text-[13px] leading-relaxed text-ink outline-none resize-none transition-colors duration-150 placeholder:text-ghost-ink/60`}
              />
              {errorA && (
                <p className="text-[12px] text-terracotta font-mono">
                  {errorA}
                </p>
              )}
            </div>

            {/* JSON B */}
            <div className="flex flex-col gap-3">
              <div className="h-8 flex items-center justify-between">
                <span className="text-[11px] font-medium tracking-[0.15em] lowercase text-[#8C6B77]">
                  {"// json b"}
                </span>
                {errorB ? (
                  <Badge variant="error">✗ invalid</Badge>
                ) : parsedB !== null ? (
                  <Badge variant="verified">✓ valid</Badge>
                ) : null}
              </div>
              <textarea
                value={inputB}
                onChange={(e) => handleChangeB(e.target.value)}
                placeholder={t("json.placeholderB")}
                spellCheck={false}
                className={`w-full min-h-[280px] bg-warm-canvas/30 border-[0.5px] ${
                  errorB
                    ? "border-terracotta"
                    : "border-parchment-border focus:border-terracotta"
                } rounded-xs p-4 font-mono text-[13px] leading-relaxed text-ink outline-none resize-none transition-colors duration-150 placeholder:text-ghost-ink/60`}
              />
              {errorB && (
                <p className="text-[12px] text-terracotta font-mono">
                  {errorB}
                </p>
              )}
            </div>
          </div>

          {/* Diff results */}
          {diffComputed && (
            <div className="flex flex-col gap-4">
              {/* Summary bar */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium tracking-[0.15em] lowercase text-terracotta">
                  {"// diff results"}
                </span>
                <div className="flex items-center gap-3 font-mono text-[11px]">
                  {diffEntries.length === 0 ? (
                    <span className="text-ghost-ink">identical</span>
                  ) : (
                    <>
                      {addedCount > 0 && (
                        <span className="text-[#5B7A70]">
                          +{addedCount} added
                        </span>
                      )}
                      {removedCount > 0 && (
                        <span className="text-terracotta">
                          −{removedCount} removed
                        </span>
                      )}
                      {modifiedCount > 0 && (
                        <span className="text-[#8C6B77]">
                          ~{modifiedCount} modified
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Diff list */}
              <div className="border-[0.5px] border-parchment-border rounded-xs overflow-hidden">
                {diffEntries.length === 0 ? (
                  <div className="py-10 flex items-center justify-center">
                    <span className="text-[13px] text-ghost-ink font-mono">
                      {t("json.identical")}
                    </span>
                  </div>
                ) : (
                  diffEntries.map((entry, idx) => (
                    <div
                      // biome-ignore lint/suspicious/noArrayIndexKey: diff entries are positionally ordered
                      key={idx}
                      className={`flex items-baseline gap-4 px-4 py-3 font-mono text-[13px] border-b-[0.5px] border-parchment-border last:border-0 ${
                        entry.type === "added"
                          ? "bg-[#5B7A70]/6"
                          : entry.type === "removed"
                            ? "bg-terracotta/6"
                            : "bg-warm-canvas/40"
                      }`}
                    >
                      <span
                        className={`shrink-0 w-4 font-medium ${
                          entry.type === "added"
                            ? "text-[#5B7A70]"
                            : entry.type === "removed"
                              ? "text-terracotta"
                              : "text-[#8C6B77]"
                        }`}
                      >
                        {entry.type === "added"
                          ? "+"
                          : entry.type === "removed"
                            ? "−"
                            : "~"}
                      </span>
                      <span className="text-faded-ink flex-1 break-all">
                        {entry.path}
                      </span>
                      <div className="shrink-0 text-right max-w-[45%] break-all">
                        {entry.type === "modified" ? (
                          <span className="flex items-center gap-2 justify-end flex-wrap">
                            <span className="text-terracotta line-through opacity-70">
                              {valuePreview(entry.valueA)}
                            </span>
                            <span className="text-ghost-ink">→</span>
                            <span className="text-[#5B7A70]">
                              {valuePreview(entry.valueB)}
                            </span>
                          </span>
                        ) : entry.type === "added" ? (
                          <span className="text-[#5B7A70]">
                            {valuePreview(entry.valueB)}
                          </span>
                        ) : (
                          <span className="text-terracotta">
                            {valuePreview(entry.valueA)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {!diffComputed && parsedA === null && parsedB === null && (
            <div className="border-[0.5px] border-dashed border-ghost-ink/30 rounded-xs py-10 flex items-center justify-center">
              <span className="text-[12px] text-ghost-ink/60 font-mono">
                {t("json.comparePlaceholder")}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Tree mode ── */}
      {mode === "tree" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          {/* Left: input (shared with format) */}
          {sharedTextarea}

          {/* Right: tree */}
          <div className="flex flex-col gap-3">
            <div className="h-8 flex items-center">
              <span className="text-[11px] font-medium tracking-[0.15em] lowercase text-terracotta">
                {"// structure"}
              </span>
            </div>
            {parsed !== null ? (
              <div className="p-5 bg-warm-canvas/20 border-[0.5px] border-parchment-border rounded-xs min-h-[420px] overflow-auto">
                <TreeNode data={parsed} depth={0} />
              </div>
            ) : (
              <div className="min-h-[420px] bg-warm-canvas/20 border-[0.5px] border-parchment-border rounded-xs flex items-center justify-center">
                <span className="text-[12px] text-ghost-ink/60 font-mono">
                  {t("json.treeHere")}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
