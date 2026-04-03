"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { useLayout } from "@/context/LayoutContext";
import homeData from "@/data/home.json";

function IconGithub({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function IconLinkedin({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

const ICON_MAP: Record<
  string,
  ({ size }: { size?: number }) => React.ReactElement
> = {
  github: ({ size }) => <IconGithub size={size} />,
  linkedin: ({ size }) => <IconLinkedin size={size} />,
  email: ({ size }) => <Mail size={size} strokeWidth={1.5} />,
};

const sections = homeData.sections.filter((s) => s.enabled);
const connectLinks = homeData.connect.filter((c) => c.enabled);
const { status } = homeData;

export default function Home() {
  const { maxWidthClass, transitionClass } = useLayout();

  return (
    <main className="w-full">
      {/* ── Hero ── */}
      <section className={`${maxWidthClass} ${transitionClass} mx-auto`}>
        <div className="border-b-2 border-ink">
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr]">
            {/* Left: Heading */}
            <div className="py-10 md:py-14 md:pr-16 md:border-r-2 border-ink flex flex-col justify-between gap-12">
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
                  <div className="mt-4">
                    <span className="italic text-faded-ink">
                      Đây là nền tảng cá nhân.
                    </span>
                  </div>
                </h1>

                <p
                  className="animate-fade-up border-l-2 border-terracotta pl-4 text-sm text-faded-ink leading-relaxed max-w-96"
                  style={{ animationDelay: "160ms" }}
                >
                  Một hệ sinh thái sống nơi mọi khía cạnh của hành trình phát
                  triển sự nghiệp đều có chỗ đứng. Không template, không
                  platform có sẵn.
                </p>
              </div>
            </div>

            {/* Right: Status + Connect */}
            <div className="py-10 md:py-14 md:pl-12 flex flex-col gap-10">
              {/* Status */}
              <div
                className="animate-fade-up"
                style={{ animationDelay: "200ms" }}
              >
                <div className="text-terracotta text-[11px] font-medium tracking-[0.15em] lowercase mb-5">
                  {"// current status"}
                </div>
                <div className="border-l-2 border-terracotta pl-4">
                  <p className="text-[10px] uppercase tracking-widest text-ghost-ink mb-2">
                    {status.label}
                  </p>
                  <p className="font-display text-[22px] leading-snug text-ink">
                    {status.title.split("—")[0]}
                    {status.title.includes("—") && (
                      <span className="italic text-faded-ink">
                        {"— "}
                        {status.title.split("—")[1]}
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-faded-ink mt-2 leading-relaxed">
                    {status.description}
                  </p>
                </div>
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
                  {connectLinks.map((link) => {
                    const Icon = ICON_MAP[link.icon];
                    return (
                      <li key={link.name}>
                        <a
                          href={link.href}
                          className="group flex items-center justify-between py-3 text-sm text-ink hover:text-terracotta transition-colors duration-150 cursor-pointer"
                        >
                          <span className="flex items-center gap-2.5 lowercase tracking-[0.08em]">
                            <span className="text-ghost-ink group-hover:text-terracotta transition-colors duration-150">
                              {Icon && <Icon size={14} />}
                            </span>
                            {link.name}
                          </span>
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                            ↗
                          </span>
                        </a>
                        <div className="border-t-[0.5px] border-parchment-border" />
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Architecture ── */}
      <section
        className={`${maxWidthClass} ${transitionClass} mx-auto py-10 md:py-14`}
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
              <span className="hidden md:block w-10 shrink-0 text-[11px] tracking-widest text-ghost-ink font-mono pt-1">
                {item.index}
              </span>
              <h2 className="w-1/3 md:w-1/4 shrink-0 text-[28px] md:text-[34px] font-display leading-tight group-hover:text-terracotta transition-colors duration-200">
                {item.title}
              </h2>
              <p className="hidden md:block flex-1 text-sm text-faded-ink leading-relaxed">
                {item.desc}
              </p>
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
