"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { en } from "@/i18n/en";
import type { TranslationKey } from "@/i18n/vi";
import { vi } from "@/i18n/vi";

type Locale = "vi" | "en";

interface LocaleContextType {
  locale: Locale;
  toggleLocale: () => void;
  t: (key: TranslationKey) => string;
}

const dictionaries: Record<Locale, Record<string, string>> = { vi, en };

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("vi");

  useEffect(() => {
    const saved = localStorage.getItem("folio-locale") as Locale | null;
    if (saved === "en") {
      setLocale("en");
      document.documentElement.lang = "en";
    }
  }, []);

  const toggleLocale = () => {
    const next: Locale = locale === "vi" ? "en" : "vi";
    setLocale(next);
    localStorage.setItem("folio-locale", next);
    document.documentElement.lang = next;
  };

  const t = (key: TranslationKey): string => {
    return dictionaries[locale][key] ?? key;
  };

  return (
    <LocaleContext.Provider value={{ locale, toggleLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used within LocaleProvider");
  return context;
}
