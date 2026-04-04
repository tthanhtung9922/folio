"use client";

import { Check, Copy, Download, FileUp } from "lucide-react";
import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useLayout } from "@/context/LayoutContext";
import { useLocale } from "@/context/LocaleContext";

type Tab = "text" | "file";
type TextOp = "encode" | "decode";

function encodeBase64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}

function decodeBase64(str: string): string {
  return decodeURIComponent(escape(atob(str)));
}

function isValidBase64(str: string): boolean {
  try {
    return btoa(atob(str)) === str.replace(/\s/g, "");
  } catch {
    return false;
  }
}

export default function Base64CodecClient() {
  const { maxWidthClass, transitionClass } = useLayout();
  const { t } = useLocale();

  const [tab, setTab] = useState<Tab>("text");

  // ── Text state ──────────────────────────────────────────────────────────────
  const [textInput, setTextInput] = useState("");
  const [textOutput, setTextOutput] = useState("");
  const [textError, setTextError] = useState<string | null>(null);
  const [textOp, setTextOp] = useState<TextOp>("encode");
  const [copiedText, setCopiedText] = useState(false);

  // ── File state ──────────────────────────────────────────────────────────────
  const [file, setFile] = useState<File | null>(null);
  const [fileOutput, setFileOutput] = useState("");
  const [b64Input, setB64Input] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);
  const [copiedFile, setCopiedFile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Text handlers ────────────────────────────────────────────────────────────

  const handleTextInput = (val: string) => {
    setTextInput(val);
    setTextError(null);
    if (!val) {
      setTextOutput("");
      return;
    }
    try {
      if (textOp === "encode") {
        setTextOutput(encodeBase64(val));
      } else {
        if (!isValidBase64(val.trim())) throw new Error("invalid");
        setTextOutput(decodeBase64(val.trim()));
      }
    } catch {
      setTextOutput("");
      setTextError(t("base64.invalidBase64"));
    }
  };

  const handleOpChange = (op: TextOp) => {
    setTextOp(op);
    setTextError(null);
    if (!textInput) return;
    try {
      if (op === "encode") {
        setTextOutput(encodeBase64(textInput));
      } else {
        if (!isValidBase64(textInput.trim())) throw new Error("invalid");
        setTextOutput(decodeBase64(textInput.trim()));
      }
    } catch {
      setTextOutput("");
      setTextError(t("base64.invalidBase64"));
    }
  };

  const copyText = async () => {
    if (!textOutput) return;
    await navigator.clipboard.writeText(textOutput);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // ── File handlers ─────────────────────────────────────────────────────────────

  const readFile = (f: File) => {
    setFile(f);
    setFileOutput("");
    setFileError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      // dataUrl = "data:<mime>;base64,<data>"
      const base64 = dataUrl.split(",")[1];
      setFileOutput(base64);
    };
    reader.readAsDataURL(f);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) readFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) readFile(f);
  };

  const handleB64Input = (val: string) => {
    setB64Input(val);
    setFileError(null);
  };

  const decodeAndDownload = () => {
    const clean = b64Input.replace(/\s/g, "");
    if (!clean) return;
    try {
      const binary = atob(clean);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "decoded-file";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setFileError(t("base64.invalidFileBase64"));
    }
  };

  const copyFile = async () => {
    if (!fileOutput) return;
    await navigator.clipboard.writeText(fileOutput);
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 2000);
  };

  return (
    <main
      className={`${maxWidthClass} ${transitionClass} mx-auto py-12 md:py-16`}
    >
      {/* ── Header ── */}
      <div className="mb-10 border-b-2 border-ink pb-8">
        <div className="text-terracotta text-[11px] font-medium tracking-[0.15em] lowercase mb-4">
          {"// tools · base64 codec"}
        </div>
        <h1 className="text-[44px] font-display leading-tight mb-4">
          Base64 Codec
        </h1>
        <p className="text-[15px] text-ink font-normal italic border-l-2 border-terracotta pl-4 max-w-xl">
          {t("base64.description")}
        </p>
      </div>

      {/* ── Tabs ── */}
      <div className="inline-flex border border-parchment-border rounded-xs overflow-hidden mb-8">
        {(["text", "file"] as Tab[]).map((id, i) => (
          <div key={id} className="flex">
            {i > 0 && <div className="w-px bg-parchment-border self-stretch" />}
            <button
              type="button"
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 text-[11px] font-medium tracking-[0.12em] lowercase transition-all duration-150 cursor-pointer ${
                tab === id
                  ? "bg-ink text-parchment"
                  : "text-ghost-ink hover:bg-warm-canvas hover:text-ink"
              }`}
            >
              {id === "text" ? (
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <path d="M4 7V4h16v3M9 20h6M12 4v16" />
                </svg>
              ) : (
                <FileUp size={13} strokeWidth={1.5} />
              )}
              {id}
            </button>
          </div>
        ))}
      </div>

      {/* ── Text tab ── */}
      {tab === "text" && (
        <div className="flex flex-col gap-6">
          {/* Op selector */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-medium tracking-[0.15em] lowercase text-ghost-ink">
              {"// operation"}
            </span>
            <div className="flex gap-2">
              {(["encode", "decode"] as TextOp[]).map((op) => (
                <button
                  key={op}
                  type="button"
                  onClick={() => handleOpChange(op)}
                  className={`text-[10px] uppercase tracking-widest border px-2.5 py-1 rounded-xs font-mono transition-colors duration-150 cursor-pointer ${
                    textOp === op
                      ? "border-terracotta text-terracotta bg-terracotta/8"
                      : "border-parchment-border text-ghost-ink hover:border-faded-ink hover:text-faded-ink"
                  }`}
                >
                  {op}
                </button>
              ))}
            </div>
          </div>

          {/* Input / Output side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Input */}
            <div className="flex flex-col gap-3">
              <span className="text-[11px] font-medium tracking-[0.15em] lowercase text-terracotta">
                {"// input"}
              </span>
              <textarea
                value={textInput}
                onChange={(e) => handleTextInput(e.target.value)}
                placeholder={t("base64.inputPlaceholder")}
                spellCheck={false}
                className={`w-full min-h-72 bg-warm-canvas/30 border-[0.5px] ${
                  textError
                    ? "border-terracotta"
                    : "border-parchment-border focus:border-terracotta"
                } rounded-xs p-4 font-mono text-[13px] leading-relaxed text-ink outline-none resize-none transition-colors duration-150 placeholder:text-ghost-ink/60`}
              />
              {textError && (
                <p className="text-[12px] text-terracotta font-mono">
                  {textError}
                </p>
              )}
            </div>

            {/* Output */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium tracking-[0.15em] lowercase text-terracotta">
                  {"// output"}
                </span>
                <div className="flex items-center gap-2">
                  {textOutput && !textError && (
                    <Badge variant="verified">✓ ok</Badge>
                  )}
                  <button
                    type="button"
                    onClick={copyText}
                    disabled={!textOutput}
                    className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest border border-parchment-border px-2 py-0.5 rounded-xs text-ghost-ink hover:border-ink hover:text-ink transition-colors duration-150 cursor-pointer font-mono disabled:opacity-30 disabled:cursor-default"
                  >
                    {copiedText ? (
                      <Check size={11} strokeWidth={1.5} />
                    ) : (
                      <Copy size={11} strokeWidth={1.5} />
                    )}
                    {copiedText ? "copied" : "copy"}
                  </button>
                </div>
              </div>
              <div className="min-h-72 bg-warm-canvas border-[0.5px] border-parchment-border rounded-xs p-4 font-mono text-[13px] leading-relaxed text-ink break-all select-all">
                {textOutput || (
                  <span className="text-ghost-ink/50">
                    {t("base64.outputPlaceholder")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── File tab ── */}
      {tab === "file" && (
        <div className="flex flex-col gap-10">
          {/* Encode section */}
          <div className="flex flex-col gap-4">
            <span className="text-[11px] font-medium tracking-[0.15em] lowercase text-terracotta">
              {"// encode file → base64"}
            </span>

            {/* Drop zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-3 min-h-32 border-[0.5px] rounded-xs cursor-pointer transition-colors duration-150 ${
                isDragging
                  ? "border-terracotta bg-terracotta-pale"
                  : "border-parchment-border hover:border-faded-ink bg-warm-canvas/30 hover:bg-warm-canvas/50"
              }`}
            >
              <FileUp
                size={20}
                strokeWidth={1.5}
                className="text-ghost-ink"
              />
              <span className="text-[12px] text-ghost-ink lowercase tracking-[0.08em]">
                {file ? (
                  <span className="text-ink">
                    {t("base64.fileSelected")}:{" "}
                    <span className="text-terracotta">{file.name}</span>{" "}
                    <span className="text-ghost-ink">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </span>
                ) : (
                  t("base64.dropOrClick")
                )}
              </span>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* File output */}
            {fileOutput && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium tracking-[0.15em] lowercase text-ghost-ink">
                    {"// base64 output"}
                  </span>
                  <button
                    type="button"
                    onClick={copyFile}
                    className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest border border-parchment-border px-2 py-0.5 rounded-xs text-ghost-ink hover:border-ink hover:text-ink transition-colors duration-150 cursor-pointer font-mono"
                  >
                    {copiedFile ? (
                      <Check size={11} strokeWidth={1.5} />
                    ) : (
                      <Copy size={11} strokeWidth={1.5} />
                    )}
                    {copiedFile ? "copied" : "copy"}
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto bg-warm-canvas border-[0.5px] border-parchment-border rounded-xs p-4 font-mono text-[12px] leading-relaxed text-ink break-all select-all">
                  {fileOutput}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-dashed border-ghost-ink/40" />

          {/* Decode section */}
          <div className="flex flex-col gap-4">
            <span className="text-[11px] font-medium tracking-[0.15em] lowercase text-terracotta">
              {"// decode base64 → file"}
            </span>

            <textarea
              value={b64Input}
              onChange={(e) => handleB64Input(e.target.value)}
              placeholder={t("base64.pasteBase64")}
              spellCheck={false}
              className="w-full min-h-36 bg-warm-canvas/30 border-[0.5px] border-parchment-border focus:border-terracotta rounded-xs p-4 font-mono text-[13px] leading-relaxed text-ink outline-none resize-none transition-colors duration-150 placeholder:text-ghost-ink/60"
            />

            {fileError && (
              <p className="text-[12px] text-terracotta font-mono">
                {fileError}
              </p>
            )}

            <button
              type="button"
              onClick={decodeAndDownload}
              disabled={!b64Input.trim()}
              className="self-start flex items-center gap-2 text-[11px] uppercase tracking-widest border border-parchment-border px-4 py-2 rounded-xs text-ghost-ink hover:border-ink hover:text-ink transition-colors duration-150 cursor-pointer font-mono disabled:opacity-30 disabled:cursor-default"
            >
              <Download size={13} strokeWidth={1.5} />
              {t("base64.decodeAndDownload")}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
