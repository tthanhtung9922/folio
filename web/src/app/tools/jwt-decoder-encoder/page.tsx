"use client";

import * as jose from "jose";
import { Check, Copy, KeyRound, ScanSearch } from "lucide-react";
import { useEffect, useState } from "react";
import { CodeHighlight } from "@/components/CodeHighlight";
import { Badge } from "@/components/ui/badge";
import { useLayout } from "@/context/LayoutContext";

type Mode = "decode" | "encode";
type Alg = "HS256" | "HS384" | "HS512";

const ALG_OPTIONS: Alg[] = ["HS256", "HS384", "HS512"];

export default function JwtDecoderEncoder() {
  const { maxWidthClass, transitionClass } = useLayout();
  const [mode, setMode] = useState<Mode>("decode");
  const [token, setToken] = useState("");
  const [headerStr, setHeaderStr] = useState(
    '{\n  "alg": "HS256",\n  "typ": "JWT"\n}',
  );
  const [payloadStr, setPayloadStr] = useState(
    '{\n  "sub": "1234567890",\n  "name": "Folio Developer",\n  "iat": 1516239022\n}',
  );
  const [secret, setSecret] = useState("folio-secret");
  const [signatureStatus, setSignatureStatus] = useState<
    "valid" | "invalid" | "unknown"
  >("unknown");
  const [alg, setAlg] = useState<Alg>("HS256");
  const [copied, setCopied] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: khởi tạo giá trị mặc định một lần
  useEffect(() => {
    handleDataChange(headerStr, payloadStr, secret);
  }, []);

  const handleAlgChange = (newAlg: Alg) => {
    setAlg(newAlg);
    try {
      const hObj = JSON.parse(headerStr);
      hObj.alg = newAlg;
      handleDataChange(JSON.stringify(hObj, null, 2), payloadStr, secret);
    } catch {
      handleDataChange(
        `{\n  "alg": "${newAlg}",\n  "typ": "JWT"\n}`,
        payloadStr,
        secret,
      );
    }
  };

  const handleTokenChange = async (newToken: string) => {
    setToken(newToken);
    if (!newToken) return;
    try {
      const parsedHeader = jose.decodeProtectedHeader(newToken);
      const parsedPayload = jose.decodeJwt(newToken);
      setHeaderStr(JSON.stringify(parsedHeader, null, 2));
      setPayloadStr(JSON.stringify(parsedPayload, null, 2));
      if (parsedHeader.alg && ALG_OPTIONS.includes(parsedHeader.alg as Alg)) {
        setAlg(parsedHeader.alg as Alg);
      }
      if (secret) {
        try {
          const key = new TextEncoder().encode(secret);
          await jose.jwtVerify(newToken, key);
          setSignatureStatus("valid");
        } catch {
          setSignatureStatus("invalid");
        }
      } else {
        setSignatureStatus("unknown");
      }
    } catch {
      setSignatureStatus("invalid");
    }
  };

  const handleDataChange = async (
    newHeader: string,
    newPayload: string,
    newSecret: string,
  ) => {
    setHeaderStr(newHeader);
    setPayloadStr(newPayload);
    setSecret(newSecret);
    try {
      const hObj = JSON.parse(newHeader);
      const pObj = JSON.parse(newPayload);
      if (newSecret && hObj.alg?.startsWith("HS")) {
        const key = new TextEncoder().encode(newSecret);
        const jwt = await new jose.SignJWT(pObj)
          .setProtectedHeader(hObj)
          .sign(key);
        setToken(jwt);
        setSignatureStatus("valid");
      } else {
        setSignatureStatus("unknown");
      }
    } catch {
      setSignatureStatus("invalid");
    }
  };

  const handleSecretChange = async (newSecret: string) => {
    setSecret(newSecret);
    if (!token || !newSecret) {
      setSignatureStatus(newSecret ? "invalid" : "unknown");
      return;
    }
    try {
      const key = new TextEncoder().encode(newSecret);
      await jose.jwtVerify(token, key);
      setSignatureStatus("valid");
    } catch {
      setSignatureStatus("invalid");
    }
  };

  const handleCopy = async () => {
    if (!token) return;
    await navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tokenParts = token.split(".");

  let isExpired = false;
  let expiryDate: Date | null = null;
  try {
    const pObj = JSON.parse(payloadStr);
    if (pObj.exp) {
      expiryDate = new Date(pObj.exp * 1000);
      isExpired = expiryDate.getTime() < Date.now();
    }
  } catch {}

  return (
    <main
      className={`${maxWidthClass} ${transitionClass} mx-auto py-12 md:py-16`}
    >
      {/* ── Header ── */}
      <div className="mb-10 border-b-2 border-ink pb-8">
        <div className="text-terracotta text-[11px] font-medium tracking-[0.15em] lowercase mb-4">
          {"// tools · jwt decoder & encoder"}
        </div>
        <h1 className="text-[44px] font-display leading-tight mb-4">
          JWT Decoder · Encoder
        </h1>
        <p className="text-sm text-faded-ink border-l-2 border-terracotta pl-4 max-w-xl">
          Giải mã, xác thực và mã hóa JSON Web Token ngay trên trình duyệt.
          Không gửi dữ liệu về máy chủ.
        </p>
      </div>

      {/* ── Mode tabs ── */}
      <div className="inline-flex border border-parchment-border rounded-xs overflow-hidden mb-8">
        <button
          type="button"
          onClick={() => setMode("decode")}
          className={`flex items-center gap-2 px-5 py-2.5 text-[11px] font-medium tracking-[0.12em] lowercase transition-all duration-150 cursor-pointer ${
            mode === "decode"
              ? "bg-ink text-parchment"
              : "text-ghost-ink hover:bg-warm-canvas hover:text-ink"
          }`}
        >
          <ScanSearch size={13} strokeWidth={1.5} />
          decode
        </button>
        <div className="w-px bg-parchment-border self-stretch" />
        <button
          type="button"
          onClick={() => setMode("encode")}
          className={`flex items-center gap-2 px-5 py-2.5 text-[11px] font-medium tracking-[0.12em] lowercase transition-all duration-150 cursor-pointer ${
            mode === "encode"
              ? "bg-ink text-parchment"
              : "text-ghost-ink hover:bg-warm-canvas hover:text-ink"
          }`}
        >
          <KeyRound size={13} strokeWidth={1.5} />
          encode
        </button>
      </div>

      {/* ── Decode mode ── */}
      {mode === "decode" && (
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-12 items-start">
          {/* Left: token input */}
          <div className="flex flex-col gap-3">
            <div className="h-8 flex items-center">
              <span className="text-[11px] font-medium tracking-[0.15em] lowercase text-terracotta">
                {"// encoded token"}
              </span>
            </div>
            <div className="relative w-full border-[0.5px] border-parchment-border rounded-xs bg-warm-canvas/30 focus-within:border-terracotta focus-within:ring-1 focus-within:ring-terracotta transition-all">
              <div className="p-4 font-mono text-[14px] leading-relaxed break-all whitespace-pre-wrap pointer-events-none min-h-100">
                <span className="text-terracotta">{tokenParts[0]}</span>
                {tokenParts.length > 1 && (
                  <span className="text-ink font-bold">.</span>
                )}
                <span className="text-[#8C6B77]">{tokenParts[1]}</span>
                {tokenParts.length > 2 && (
                  <span className="text-ink font-bold">.</span>
                )}
                <span className="text-[#5B7A70]">
                  {tokenParts.slice(2).join(".")}
                </span>
                {token === "" && <span className="opacity-0">&#8203;</span>}
              </div>
              <textarea
                id="token-input"
                value={token}
                onChange={(e) => handleTokenChange(e.target.value)}
                spellCheck="false"
                className="absolute inset-0 w-full h-full p-4 font-mono text-[14px] leading-relaxed break-all bg-transparent text-transparent caret-ink resize-none outline-none overflow-hidden"
              />
            </div>
          </div>

          {/* Right: decoded parts */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <div className="h-8 flex items-center">
                <span className="text-[11px] font-medium tracking-[0.15em] lowercase text-terracotta">
                  {"// header"}
                </span>
              </div>
              <CodeHighlight code={headerStr} lang="json" />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-medium tracking-[0.15em] lowercase text-[#8C6B77]">
                {"// payload"}
              </span>
              <CodeHighlight code={payloadStr} lang="json" />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-medium tracking-[0.15em] lowercase text-[#5B7A70]">
                  {"// verify signature"}
                </span>
                {signatureStatus === "valid" && (
                  <Badge variant="verified">✓ verified</Badge>
                )}
                {signatureStatus === "invalid" && (
                  <Badge variant="error">✗ invalid</Badge>
                )}
              </div>
              <input
                type="text"
                value={secret}
                onChange={(e) => handleSecretChange(e.target.value)}
                placeholder="Nhập secret key để xác thực..."
                className="w-full bg-warm-canvas border-[0.5px] border-parchment-border focus:border-terracotta rounded-xs p-3 font-mono text-[14px] text-[#5B7A70] outline-none transition-colors duration-150"
              />
            </div>

            {expiryDate && (
              <div
                className={`p-4 border-[0.5px] rounded-xs ${isExpired ? "bg-terracotta-pale border-terracotta text-terracotta" : "bg-transparent border-parchment-border text-ink"}`}
              >
                <span className="lowercase font-medium tracking-[0.08em] block mb-1">
                  trạng thái (exp)
                </span>
                <span className="text-[14px]">
                  {isExpired
                    ? "Token đã hết hạn vào: "
                    : "Token sẽ hết hạn vào: "}
                  <span className="font-medium">
                    {expiryDate.toLocaleString("vi-VN")}
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Encode mode ── */}
      {mode === "encode" && (
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-12 items-start">
          {/* Left: inputs */}
          <div className="flex flex-col gap-6">
            {/* Algorithm selector */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-medium tracking-[0.15em] lowercase text-terracotta">
                {"// algorithm"}
              </span>
              <div className="flex gap-2">
                {ALG_OPTIONS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => handleAlgChange(a)}
                    className={`text-[10px] uppercase tracking-widest border px-2.5 py-1 rounded-xs font-mono transition-colors duration-150 cursor-pointer ${
                      alg === a
                        ? "border-terracotta text-terracotta bg-terracotta/8"
                        : "border-parchment-border text-ghost-ink hover:border-faded-ink hover:text-faded-ink"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* Header editor */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-medium tracking-[0.15em] lowercase text-terracotta">
                {"// header"}
              </span>
              <div className="relative w-full rounded-xs focus-within:ring-1 focus-within:ring-terracotta/40 transition-all">
                <div className="pointer-events-none min-h-25">
                  <CodeHighlight code={headerStr} lang="json" />
                </div>
                <textarea
                  value={headerStr}
                  onChange={(e) =>
                    handleDataChange(e.target.value, payloadStr, secret)
                  }
                  spellCheck="false"
                  className="absolute inset-0 w-full h-full p-4 border-[0.5px] border-transparent font-mono text-[14px] leading-relaxed whitespace-pre-wrap break-all bg-transparent text-transparent caret-ink resize-none outline-none overflow-hidden"
                />
              </div>
            </div>

            {/* Payload editor */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-medium tracking-[0.15em] lowercase text-[#8C6B77]">
                {"// payload"}
              </span>
              <div className="relative w-full rounded-xs focus-within:ring-1 focus-within:ring-terracotta/40 transition-all">
                <div className="pointer-events-none min-h-25">
                  <CodeHighlight code={payloadStr} lang="json" />
                </div>
                <textarea
                  value={payloadStr}
                  onChange={(e) =>
                    handleDataChange(headerStr, e.target.value, secret)
                  }
                  spellCheck="false"
                  className="absolute inset-0 w-full h-full p-4 border-[0.5px] border-transparent font-mono text-[14px] leading-relaxed whitespace-pre-wrap break-all bg-transparent text-transparent caret-ink resize-none outline-none overflow-hidden"
                />
              </div>
            </div>

            {/* Secret key */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-medium tracking-[0.15em] lowercase text-[#5B7A70]">
                {"// secret key"}
              </span>
              <input
                type="text"
                value={secret}
                onChange={(e) =>
                  handleDataChange(headerStr, payloadStr, e.target.value)
                }
                placeholder="Nhập secret key..."
                className="w-full bg-warm-canvas border-[0.5px] border-parchment-border focus:border-terracotta rounded-xs p-3 font-mono text-[14px] text-[#5B7A70] outline-none transition-colors duration-150"
              />
            </div>
          </div>

          {/* Right: generated token */}
          <div className="flex flex-col gap-4">
            <div className="h-8 flex justify-between items-center">
              <span className="text-[11px] font-medium tracking-[0.15em] lowercase text-terracotta">
                {"// generated token"}
              </span>
              <div className="flex items-center gap-2">
                {signatureStatus === "valid" && (
                  <Badge variant="verified">✓ signed</Badge>
                )}
                {signatureStatus === "invalid" && (
                  <Badge variant="error">✗ error</Badge>
                )}
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!token}
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

            <div className="p-4 bg-warm-canvas border-[0.5px] border-parchment-border rounded-xs font-mono text-[14px] leading-relaxed break-all min-h-40 select-all">
              <span className="text-terracotta">{tokenParts[0]}</span>
              {tokenParts.length > 1 && (
                <span className="text-ink font-bold">.</span>
              )}
              <span className="text-[#8C6B77]">{tokenParts[1]}</span>
              {tokenParts.length > 2 && (
                <span className="text-ink font-bold">.</span>
              )}
              <span className="text-[#5B7A70]">
                {tokenParts.slice(2).join(".")}
              </span>
            </div>

            {expiryDate && (
              <div
                className={`p-4 border-[0.5px] rounded-xs ${isExpired ? "bg-terracotta-pale border-terracotta text-terracotta" : "bg-transparent border-parchment-border text-ink"}`}
              >
                <span className="lowercase font-medium tracking-[0.08em] block mb-1">
                  trạng thái (exp)
                </span>
                <span className="text-[14px]">
                  {isExpired
                    ? "Token đã hết hạn vào: "
                    : "Token sẽ hết hạn vào: "}
                  <span className="font-medium">
                    {expiryDate.toLocaleString("vi-VN")}
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
