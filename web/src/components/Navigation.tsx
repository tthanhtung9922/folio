"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useLayout } from "@/context/LayoutContext";
import { useLocale } from "@/context/LocaleContext";

export function Navigation() {
  const {
    isWide,
    toggleWide,
    maxWidthClass,
    transitionClass,
    isCustomCursor,
    toggleCustomCursor,
    isAnimated,
    toggleAnimated,
    isDarkMode,
    toggleDarkMode,
  } = useLayout();
  const { locale, toggleLocale } = useLocale();

  const [prefsOpen, setPrefsOpen] = useState(false);
  const prefsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (prefsRef.current && !prefsRef.current.contains(e.target as Node)) {
        setPrefsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { name: "showcase", href: "/showcase" },
    { name: "tools", href: "/tools" },
    { name: "lab", href: "/lab" },
    { name: "blog", href: "/blog" },
    { name: "journal", href: "/journal" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full h-14 bg-background border-b-2 border-ink flex items-center">
      <div
        className={`${maxWidthClass} ${transitionClass} w-full mx-auto flex justify-between items-center`}
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-baseline text-ink hover:text-terracotta transition-colors duration-150 cursor-pointer"
        >
          <span className="font-medium text-lg tracking-tight">folio_</span>
          <span className="w-2 h-2 ml-0.5 rounded-full bg-terracotta animate-[pulse_3s_ease-in-out_infinite]" />
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-muted-foreground hover:text-terracotta transition-colors duration-150 lowercase tracking-[0.08em] cursor-pointer"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Preferences panel */}
        <div ref={prefsRef} className="relative hidden sm:block">
          <button
            type="button"
            onClick={() => setPrefsOpen((v) => !v)}
            className={`text-[11px] tracking-[0.15em] border px-2 py-1 rounded-xs transition-all duration-150 cursor-pointer active:scale-95 ${
              prefsOpen
                ? "border-ink text-ink"
                : "border-parchment-border text-ghost-ink hover:border-ink hover:text-ink"
            }`}
            title="Preferences"
          >
            {"//"}
          </button>

          {prefsOpen && (
            <div className="absolute top-[calc(100%+22px)] right-0 w-52.5 bg-background border-2 border-ink rounded-xs shadow-[4px_4px_0px_0px_rgba(44,36,32,0.08)]">
              <div className="px-3 pt-3 pb-2">
                <span className="text-[10px] tracking-[0.15em] text-terracotta lowercase">
                  {"// preferences"}
                </span>
              </div>

              <div className="border-t-[0.5px] border-parchment-border" />

              {/* Layout toggle */}
              <button
                type="button"
                onClick={toggleWide}
                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-warm-canvas transition-colors duration-150 cursor-pointer group"
              >
                <span className="text-[11px] lowercase tracking-[0.08em] text-faded-ink group-hover:text-ink transition-colors duration-150">
                  layout
                </span>
                <span className="text-[10px] uppercase tracking-widest border border-parchment-border group-hover:border-ink px-1.5 py-0.5 rounded-xs transition-colors duration-150">
                  {isWide ? "wide" : "standard"}
                </span>
              </button>

              <div className="border-t-[0.5px] border-parchment-border mx-3" />

              {/* Cursor toggle */}
              <button
                type="button"
                onClick={toggleCustomCursor}
                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-warm-canvas transition-colors duration-150 cursor-pointer group"
              >
                <span className="text-[11px] lowercase tracking-[0.08em] text-faded-ink group-hover:text-ink transition-colors duration-150">
                  cursor
                </span>
                <span
                  className={`text-[10px] uppercase tracking-widest border px-1.5 py-0.5 rounded-xs transition-colors duration-150 ${
                    isCustomCursor
                      ? "border-terracotta text-terracotta"
                      : "border-parchment-border group-hover:border-ink"
                  }`}
                >
                  {isCustomCursor ? "custom" : "default"}
                </span>
              </button>

              <div className="border-t-[0.5px] border-parchment-border mx-3" />

              {/* Animation toggle */}
              <button
                type="button"
                onClick={toggleAnimated}
                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-warm-canvas transition-colors duration-150 cursor-pointer group"
              >
                <span className="text-[11px] lowercase tracking-[0.08em] text-faded-ink group-hover:text-ink transition-colors duration-150">
                  background
                </span>
                <span
                  className={`text-[10px] uppercase tracking-widest border px-1.5 py-0.5 rounded-xs transition-colors duration-150 ${
                    isAnimated
                      ? "border-terracotta text-terracotta"
                      : "border-parchment-border group-hover:border-ink"
                  }`}
                >
                  {isAnimated ? "live" : "static"}
                </span>
              </button>

              <div className="border-t-[0.5px] border-parchment-border mx-3" />

              {/* Theme toggle */}
              <button
                type="button"
                onClick={toggleDarkMode}
                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-warm-canvas transition-colors duration-150 cursor-pointer group"
              >
                <span className="text-[11px] lowercase tracking-[0.08em] text-faded-ink group-hover:text-ink transition-colors duration-150">
                  theme
                </span>
                <span
                  className={`text-[10px] uppercase tracking-widest border px-1.5 py-0.5 rounded-xs transition-colors duration-150 ${
                    isDarkMode
                      ? "border-terracotta text-terracotta"
                      : "border-parchment-border group-hover:border-ink"
                  }`}
                >
                  {isDarkMode ? "dark" : "light"}
                </span>
              </button>

              <div className="border-t-[0.5px] border-parchment-border mx-3" />

              {/* Language toggle */}
              <button
                type="button"
                onClick={toggleLocale}
                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-warm-canvas transition-colors duration-150 cursor-pointer group"
              >
                <span className="text-[11px] lowercase tracking-[0.08em] text-faded-ink group-hover:text-ink transition-colors duration-150">
                  language
                </span>
                <span
                  className={`text-[10px] uppercase tracking-widest border px-1.5 py-0.5 rounded-xs transition-colors duration-150 ${
                    locale === "en"
                      ? "border-terracotta text-terracotta"
                      : "border-parchment-border group-hover:border-ink"
                  }`}
                >
                  {locale}
                </span>
              </button>

              <div className="pb-1" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
