import type { TranslationKey } from "./vi";

export const en: Record<TranslationKey, string> = {
  // ── Home page ──
  "hero.heading1": "More than code.",
  "hero.heading2": "This is a personal platform.",
  "hero.description":
    "A living ecosystem where every aspect of the career development journey has its place. No templates, no off-the-shelf platforms.",

  // ── Tools page ──
  "tools.description":
    "Small dev tools, running entirely in the browser. No login required, no data sent to any server.",
  "tools.notReady": "not ready yet...",

  // ── JWT tool ──
  "jwt.description":
    "Decode, verify and encode JSON Web Tokens right in your browser. No data sent to any server.",
  "jwt.secretPlaceholder": "Enter secret key to verify...",
  "jwt.secretPlaceholderShort": "Enter secret key...",
  "jwt.expStatus": "status (exp)",
  "jwt.expired": "Token expired at: ",
  "jwt.expiresAt": "Token expires at: ",

  // ── JSON Formatter tool ──
  "json.description":
    "Format, validate and compare JSON right in your browser. Supports auto-fix syntax errors and tree view.",
  "json.invalid": "Invalid JSON",
  "json.cantFix": "Cannot auto-fix this JSON",
  "json.placeholder": "Paste JSON here...",
  "json.placeholderA": "Paste JSON A here...",
  "json.placeholderB": "Paste JSON B here...",
  "json.autoFixed": "JSON syntax errors were auto-fixed.",
  "json.identical": "Both JSONs are identical.",
  "json.outputHere": "output will appear here",
  "json.treeHere": "tree will appear here",
  "json.comparePlaceholder":
    "Paste JSON into both panels to compare automatically.",

  // ── Text Compare tool ──
  "textCompare.description":
    "Compare two text blocks — display line-by-line differences.",
  "textCompare.placeholderA": "Paste original text here...",
  "textCompare.placeholderB": "Paste modified text here...",
  "textCompare.identical": "Both texts are identical.",
  "textCompare.comparePlaceholder":
    "Paste text into both panels to compare automatically.",
};
