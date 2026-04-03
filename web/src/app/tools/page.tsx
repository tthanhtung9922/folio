"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useLayout } from "@/context/LayoutContext";
import rawTools from "@/data/tools.json";

interface Tool {
  name: string;
  desc: string;
  category: string;
  href: string;
  available: boolean;
  enabled: boolean;
}

const tools: Tool[] = rawTools.filter((t) => t.enabled);
const availableCount = tools.filter((t) => t.available).length;

export default function ToolsPage() {
  const { maxWidthClass, transitionClass } = useLayout();

  return (
    <main className="w-full">
      {/* ── Header ── */}
      <section className={`${maxWidthClass} ${transitionClass} mx-auto`}>
        <div className="border-b-2 border-ink py-10 md:py-14">
          <div
            className="animate-fade-up text-terracotta text-[11px] font-medium tracking-[0.15em] lowercase mb-8"
            style={{ animationDelay: "0ms" }}
          >
            {"// tools · "}
            <span>{availableCount} available</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8 md:gap-16">
            <h1
              className="animate-fade-up font-display text-[56px] md:text-[80px] leading-[0.93] tracking-[-0.02em]"
              style={{ animationDelay: "80ms" }}
            >
              Tools
            </h1>

            {/* Right meta column */}
            <div
              className="animate-fade-up flex flex-col justify-between gap-6"
              style={{ animationDelay: "160ms" }}
            >
              {/* Category tags */}
              <div className="flex flex-wrap gap-2 pt-1">
                {[...new Set(tools.map((t) => t.category))].map((cat) => (
                  <span
                    key={cat}
                    className="text-[10px] uppercase tracking-widest border border-parchment-border px-1.5 py-0.5 rounded-xs text-ghost-ink font-mono"
                  >
                    {cat}
                  </span>
                ))}
              </div>

              {/* Description */}
              <p className="border-l-2 border-terracotta pl-4 text-sm text-faded-ink leading-relaxed pb-1">
                Công cụ dev nhỏ, chạy hoàn toàn trên trình duyệt. Không cần
                đăng nhập, không gửi dữ liệu về server.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tool Grid ── */}
      <section
        className={`${maxWidthClass} ${transitionClass} mx-auto py-10 md:py-14`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0">
          {tools.map((tool, i) => (
            <ToolCard key={tool.name} tool={tool} index={i} />
          ))}
        </div>
      </section>
    </main>
  );
}

function ToolCard({ tool, index }: { tool: Tool; index: number }) {
  const delay = `${100 + index * 60}ms`;

  const inner = (
    <div
      className={`animate-fade-up group flex flex-col gap-5 py-8 px-5 border-t-[0.5px] border-parchment-border h-full ${
        tool.available
          ? "hover:bg-warm-canvas/40 transition-colors duration-200"
          : "opacity-50"
      }`}
      style={{ animationDelay: delay }}
    >
      {/* Top row: category + status badge */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium tracking-[0.15em] lowercase text-terracotta">
          {"// "}
          {tool.category}
        </span>
        <Badge variant={tool.available ? "available" : "soon"}>
          {tool.available ? "available" : "soon"}
        </Badge>
      </div>

      {/* Name */}
      <h2
        className={`font-display text-[26px] md:text-[28px] leading-tight ${
          tool.available
            ? "group-hover:text-terracotta transition-colors duration-200"
            : ""
        }`}
      >
        {tool.name}
      </h2>

      {/* Description */}
      <p className="text-sm text-faded-ink leading-relaxed flex-1">
        {tool.desc}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-end">
        {tool.available ? (
          <span className="text-sm text-terracotta opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 font-mono">
            open →
          </span>
        ) : (
          <span className="text-[11px] text-ghost-ink lowercase tracking-[0.08em]">
            em chưa làm xong...
          </span>
        )}
      </div>
    </div>
  );

  if (tool.available) {
    return (
      <Link href={tool.href} className="cursor-pointer">
        {inner}
      </Link>
    );
  }

  return <div>{inner}</div>;
}
