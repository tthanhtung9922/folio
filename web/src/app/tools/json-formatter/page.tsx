import type { Metadata } from "next";
import JsonFormatterClient from "./_client";

export const metadata: Metadata = {
  title: "JSON Formatter",
  description:
    "Format, validate, so sánh và xem cấu trúc JSON ngay trên trình duyệt. Hỗ trợ tự sửa lỗi cú pháp và tree view.",
  openGraph: {
    title: "JSON Formatter · Folio",
    description:
      "Format, validate, compare and view JSON structure in your browser. Supports auto-fix and tree view.",
    url: "https://folio.dev/tools/json-formatter",
  },
};

export default function JsonFormatterPage() {
  return <JsonFormatterClient />;
}
