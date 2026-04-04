import type { Metadata } from "next";
import Base64CodecClient from "./_client";

export const metadata: Metadata = {
  title: "Base64 Codec",
  description:
    "Mã hóa và giải mã Base64 — hỗ trợ text thuần và file nhị phân. Chạy hoàn toàn trên trình duyệt, không gửi dữ liệu về server.",
  openGraph: {
    title: "Base64 Codec · Folio",
    description:
      "Encode and decode Base64 — supports plain text and binary files. Runs entirely in your browser.",
    url: "https://folio.dev/tools/base64-codec",
  },
};

export default function Base64CodecPage() {
  return <Base64CodecClient />;
}
