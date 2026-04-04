import type { Metadata } from "next";
import HomeClient from "./_home_client";

export const metadata: Metadata = {
  title: "Folio — Trần Thanh Tùng",
  description:
    "Nền tảng cá nhân của Trần Thanh Tùng — developer tools, showcase, blog và journal. Xây dựng bởi một software engineer.",
  openGraph: {
    title: "Folio — Trần Thanh Tùng",
    description:
      "Nền tảng cá nhân — tools, showcase, blog, journal. Local-first, built in public.",
    url: "https://folio.dev",
  },
};

export default function Home() {
  return <HomeClient />;
}
