import type { Metadata } from "next";
import JwtDecoderEncoderClient from "./_client";

export const metadata: Metadata = {
  title: "JWT Decoder · Encoder",
  description:
    "Giải mã, xác thực và mã hóa JSON Web Token ngay trên trình duyệt. Hỗ trợ HS256, HS384, HS512. Không gửi dữ liệu về máy chủ.",
  openGraph: {
    title: "JWT Decoder · Encoder · Folio",
    description:
      "Decode, verify and encode JSON Web Tokens in your browser. Supports HS256, HS384, HS512. No data sent to any server.",
    url: "https://folio.dev/tools/jwt-decoder-encoder",
  },
};

export default function JwtDecoderEncoderPage() {
  return <JwtDecoderEncoderClient />;
}
