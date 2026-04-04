"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

interface LayoutContextType {
  isWide: boolean;
  toggleWide: () => void;
  maxWidthClass: string;
  transitionClass: string;
  isCustomCursor: boolean;
  toggleCustomCursor: () => void;
  isAnimated: boolean;
  toggleAnimated: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [isWide, setIsWide] = useState(false);
  const [isCustomCursor, setIsCustomCursor] = useState(true);
  const [isAnimated, setIsAnimated] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("folio-wide-mode");
    if (saved === "true") setIsWide(true);

    const savedCursor = localStorage.getItem("folio-custom-cursor");
    // Mặc định bật, chỉ tắt nếu người dùng đã chọn tắt
    const cursorEnabled = savedCursor !== "false";
    setIsCustomCursor(cursorEnabled);
    document.documentElement.classList.toggle(
      "custom-cursor-active",
      cursorEnabled,
    );

    const savedAnim = localStorage.getItem("folio-bg-animation");
    if (savedAnim === "false") setIsAnimated(false);

    const savedDark = localStorage.getItem("folio-dark-mode");
    const darkEnabled = savedDark === "true";
    setIsDarkMode(darkEnabled);
    document.documentElement.classList.toggle("dark", darkEnabled);
  }, []);

  const toggleWide = () => {
    const nextValue = !isWide;
    setIsWide(nextValue);
    localStorage.setItem("folio-wide-mode", String(nextValue));
  };

  const toggleCustomCursor = () => {
    const nextValue = !isCustomCursor;
    setIsCustomCursor(nextValue);
    localStorage.setItem("folio-custom-cursor", String(nextValue));
    document.documentElement.classList.toggle(
      "custom-cursor-active",
      nextValue,
    );
  };

  const toggleAnimated = () => {
    const nextValue = !isAnimated;
    setIsAnimated(nextValue);
    localStorage.setItem("folio-bg-animation", String(nextValue));
  };

  const toggleDarkMode = () => {
    const nextValue = !isDarkMode;
    setIsDarkMode(nextValue);
    localStorage.setItem("folio-dark-mode", String(nextValue));
    document.documentElement.classList.toggle("dark", nextValue);
  };

  // Wide: 1600px ≈ tỷ lệ vàng so với 2560px (62.5%), ≈ √2 × standard (1080px)
  const maxWidthClass = isWide
    ? "max-w-[1600px] px-8 md:px-16"
    : "max-w-[1080px] px-[32px]";

  // Chuẩn hoá animation: thời gian 0.6s, gia tốc cubic-bezier cực mượt của Folio
  const transitionClass =
    "transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)]";

  return (
    <LayoutContext.Provider
      value={{
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
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (!context) throw new Error("useLayout must be used within LayoutProvider");
  return context;
}
