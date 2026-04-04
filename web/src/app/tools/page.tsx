import type { Metadata } from "next";
import ToolsClient from "./_tools_client";

export const metadata: Metadata = {
  title: "Tools",
  description:
    "Công cụ dev nhỏ chạy hoàn toàn trên trình duyệt — JWT, JSON, Base64, Text Compare và nhiều hơn nữa. Không cần đăng nhập, không gửi dữ liệu về server.",
  openGraph: {
    title: "Tools · Folio",
    description:
      "Small dev tools running entirely in the browser — JWT, JSON, Base64, Text Compare and more.",
    url: "https://folio.dev/tools",
  },
};

export default function ToolsPage() {
  return <ToolsClient />;
}
