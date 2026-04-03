"use client";

import Link from "next/link";
import { useLayout } from "@/context/LayoutContext";

const sections = [
  {
    index: "01",
    title: "Showcase",
    desc: "Trưng bày dự án — không chỉ là link GitHub mà còn là câu chuyện kỹ thuật.",
    href: "/showcase",
  },
  {
    index: "02",
    title: "Tools",
    desc: "Dev utilities nhỏ chạy trên browser — mỗi tool giải quyết một vấn đề thật.",
    href: "/tools",
  },
  {
    index: "03",
    title: "Lab",
    desc: "Communication & language lab — luyện kỹ năng làm việc quốc tế.",
    href: "/lab",
  },
  {
    index: "04",
    title: "Blog",
    desc: "TIL + bài viết dài + changelog — ghi lại quá trình trưởng thành.",
    href: "/blog",
  },
  {
    index: "05",
    title: "Journal",
    desc: "Decision records — kho tàng kinh nghiệm ra quyết định.",
    href: "/journal",
  },
];

const connectLinks = [
  { name: "github", href: "#" },
  { name: "linkedin", href: "#" },
  { name: "email", href: "#" },
];

export default function Home() {
  const { maxWidthClass, transitionClass } = useLayout();

  return (
    <main className="w-full">
      {/* ── Hero ── */}
      <section className={`${maxWidthClass} ${transitionClass} mx-auto`}>
        <div className="border-b-2 border-ink">
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr]">
            {/* Left: Heading */}
            <div className="py-16 md:py-24 md:pr-16 md:border-r-2 border-ink flex flex-col justify-between gap-12">
              <div>
                <div
                  className="animate-fade-up text-terracotta text-[11px] font-medium tracking-[0.15em] lowercase mb-8"
                  style={{ animationDelay: "0ms" }}
                >
                  {"// software engineer · building folio"}
                </div>

                <h1
                  className="animate-fade-up font-display text-[44px] md:text-[58px] leading-[1.1] tracking-[-0.02em] mb-10"
                  style={{ animationDelay: "80ms" }}
                >
                  Không chỉ là code.
                  <br />
                  <span className="italic text-faded-ink">
                    Đây là nền tảng cá nhân.
                  </span>
                </h1>

                <p
                  className="animate-fade-up text-ink text-base md:text-lg leading-relaxed max-w-115"
                  style={{ animationDelay: "160ms" }}
                >
                  Một hệ sinh thái sống nơi mọi khía cạnh của hành trình phát
                  triển sự nghiệp đều có chỗ đứng. Không template, không
                  platform có sẵn.
                </p>
              </div>
            </div>

            {/* Right: Status + Connect */}
            <div className="py-16 md:py-24 md:pl-12 flex flex-col gap-10">
              {/* Status */}
              <div
                className="animate-fade-up"
                style={{ animationDelay: "200ms" }}
              >
                <div className="text-terracotta text-[11px] font-medium tracking-[0.15em] lowercase mb-5">
                  {"// current status"}
                </div>
                <p className="text-[10px] uppercase tracking-widest text-ghost-ink mb-2">
                  building
                </p>
                <p className="text-xl font-medium text-ink leading-snug">
                  Đợt 1 — POC & Tools
                </p>
                <p className="text-sm text-faded-ink mt-3 leading-relaxed">
                  Xây dựng nền tảng cơ sở và bộ công cụ dev đầu tiên.
                </p>
              </div>

              {/* Divider */}
              <div className="border-t border-dashed border-ghost-ink/40" />

              {/* Connect */}
              <div
                className="animate-fade-up"
                style={{ animationDelay: "260ms" }}
              >
                <div className="text-terracotta text-[11px] font-medium tracking-[0.15em] lowercase mb-5">
                  {"// connect"}
                </div>
                <ul className="flex flex-col">
                  {connectLinks.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="group flex items-center justify-between py-3 text-sm text-ink hover:text-terracotta transition-colors duration-150 cursor-pointer"
                      >
                        <span className="lowercase tracking-[0.08em]">
                          {link.name}
                        </span>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                          ↗
                        </span>
                      </a>
                      <div className="border-t-[0.5px] border-parchment-border" />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Architecture ── */}
      <section
        className={`${maxWidthClass} ${transitionClass} mx-auto py-20 md:py-24`}
      >
        <div className="text-terracotta text-[11px] font-medium tracking-[0.15em] lowercase mb-4">
          {"// architecture"}
        </div>

        <div className="flex flex-col">
          {sections.map((item) => (
            <Link
              key={item.index}
              href={item.href}
              className="group flex items-center gap-6 md:gap-10 py-7 hover:bg-warm-canvas/50 transition-colors duration-200 border-t border-dashed border-ghost-ink/40"
            >
              {/* Index */}
              <span className="hidden md:block w-10 shrink-0 text-[11px] tracking-widest text-ghost-ink font-mono pt-1">
                {item.index}
              </span>

              {/* Title */}
              <h2 className="w-1/3 md:w-1/4 shrink-0 text-[28px] md:text-[34px] font-display leading-tight group-hover:text-terracotta transition-colors duration-200">
                {item.title}
              </h2>

              {/* Desc */}
              <p className="hidden md:block flex-1 text-sm text-faded-ink leading-relaxed">
                {item.desc}
              </p>

              {/* Arrow */}
              <span className="ml-auto text-terracotta opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 font-mono text-lg">
                →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
