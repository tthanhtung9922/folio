import type { Metadata } from "next";
import TextCompareClient from "./_client";

export const metadata: Metadata = {
  title: "Text Compare",
  description:
    "So sánh hai đoạn văn bản — hiển thị khác biệt theo từng dòng với chế độ inline và side-by-side.",
  openGraph: {
    title: "Text Compare · Folio",
    description:
      "Compare two text blocks — line-by-line diff with inline and side-by-side modes.",
    url: "https://folio.dev/tools/text-compare",
  },
};

export default function TextComparePage() {
  return <TextCompareClient />;
}
