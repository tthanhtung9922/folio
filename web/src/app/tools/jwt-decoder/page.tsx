"use client";

import * as jose from "jose";
import { useEffect, useState } from "react";
import { CodeHighlight } from "@/components/CodeHighlight";
import { useLayout } from "@/context/LayoutContext";

export default function JwtDecoder() {
  const { maxWidthClass, transitionClass } = useLayout();

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

  // biome-ignore lint/correctness/useExhaustiveDependencies: chạy một lần khi mount để khởi tạo giá trị mặc định
  useEffect(() => {
    handleDataChange(headerStr, payloadStr, secret);
  }, []);

  const handleTokenChange = async (newToken: string) => {
    setToken(newToken);
    if (!newToken) return;

    try {
      const parsedHeader = jose.decodeProtectedHeader(newToken);
      const parsedPayload = jose.decodeJwt(newToken);

      setHeaderStr(JSON.stringify(parsedHeader, null, 2));
      setPayloadStr(JSON.stringify(parsedPayload, null, 2));

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

      if (newSecret && hObj.alg && hObj.alg.startsWith("HS")) {
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
      <div className="mb-12 border-b-2 border-ink pb-8">
        <div className="text-terracotta text-[11px] font-medium tracking-[0.15em] lowercase mb-4">
          {"// tools · jwt encoder & decoder"}
        </div>
        <h1 className="text-[44px] font-display leading-tight mb-4">
          JWT Studio
        </h1>
        <p className="text-faded-ink">
          Giải mã, xác thực và mã hóa JSON Web Token ngay trên trình duyệt.
          Không gửi dữ liệu về máy chủ.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-12 items-start">
        {/* CỘT TRÁI: Ô nhập Token */}
        <div className="flex flex-col gap-4">
          <label
            htmlFor="token-input"
            className="lowercase tracking-[0.08em] font-medium text-ink flex justify-between"
          >
            <span>encoded token</span>
          </label>

          <div className="relative w-full border-[0.5px] border-parchment-border rounded-xs bg-warm-canvas/30 focus-within:border-terracotta focus-within:ring-1 focus-within:ring-terracotta transition-all group">
            {/* Lớp hiển thị giãn theo nội dung */}
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
              {/* Giữ chỗ nếu xóa hết token */}
              {token === "" && <span className="opacity-0">&#8203;</span>}
            </div>

            {/* Ô nhập đè lên khớp 100%, ẩn scrollbar */}
            <textarea
              id="token-input"
              value={token}
              onChange={(e) => handleTokenChange(e.target.value)}
              spellCheck="false"
              className="absolute inset-0 w-full h-full p-4 font-mono text-[14px] leading-relaxed break-all bg-transparent text-transparent caret-ink resize-none outline-none overflow-hidden"
            />
          </div>
        </div>

        {/* CỘT PHẢI: Chỉnh sửa và Xác thực */}
        <div className="flex flex-col gap-6">
          {/* Header Editor */}
          <div className="flex flex-col gap-2">
            <div className="lowercase tracking-[0.08em] font-medium flex justify-between items-end">
              <span className="text-terracotta">header</span>
            </div>
            <div className="relative w-full rounded-xs focus-within:ring-1 focus-within:ring-terracotta transition-all">
              {/* Shiki render bên dưới */}
              <div className="pointer-events-none min-h-25">
                <CodeHighlight code={headerStr} lang="json" />
              </div>
              {/* Khớp với padding và border của Shiki */}
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

          {/* Payload Editor */}
          <div className="flex flex-col gap-2">
            <div className="lowercase tracking-[0.08em] font-medium flex justify-between items-end">
              <span className="text-[#8C6B77]">payload</span>
            </div>
            <div className="relative w-full rounded-xs focus-within:ring-1 focus-within:ring-[#8C6B77] transition-all">
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

          {/* Verify Signature */}
          <div className="flex flex-col gap-2">
            <div className="lowercase tracking-[0.08em] font-medium text-[#5B7A70] flex justify-between items-end">
              <span>verify signature</span>
              {signatureStatus === "valid" && (
                <span className="text-[10px] bg-[#5B7A70] text-background px-2 py-1 rounded-xs">
                  ✓ verified
                </span>
              )}
              {signatureStatus === "invalid" && (
                <span className="text-[10px] bg-terracotta text-background px-2 py-1 rounded-xs">
                  ✗ invalid
                </span>
              )}
            </div>
            <div className="p-4 bg-warm-canvas border-[0.5px] border-parchment-border rounded-xs text-[14px] font-mono flex flex-col gap-2">
              <span className="text-ink font-medium">HMACSHA256(</span>
              <span className="pl-4 text-faded-ink">
                base64UrlEncode(header) + "." +
              </span>
              <span className="pl-4 text-faded-ink">
                base64UrlEncode(payload),
              </span>
              <div className="pl-4 flex items-center mt-1">
                <input
                  type="text"
                  value={secret}
                  onChange={(e) =>
                    handleDataChange(headerStr, payloadStr, e.target.value)
                  }
                  placeholder="Nhập secret key..."
                  className="bg-transparent border-b border-ink focus:border-[#5B7A70] outline-none text-[#5B7A70] w-full max-w-62.5 py-1 font-bold"
                />
              </div>
              <span className="text-ink font-medium mt-1">)</span>
            </div>
          </div>

          {/* Cảnh báo Expired */}
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
    </main>
  );
}
