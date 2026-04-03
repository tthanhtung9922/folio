"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

interface LayoutContextType {
  isWide: boolean;
  toggleWide: () => void;
  maxWidthClass: string;
  transitionClass: string; // Thêm class dùng chung cho animation
  isCustomCursor: boolean;
  toggleCustomCursor: () => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [isWide, setIsWide] = useState(false);
  const [isCustomCursor, setIsCustomCursor] = useState(true);

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

  // MẸO: Dùng 2560px thay vì 100% (hoặc full) để CSS có thể tính toán animation mượt mà
  const maxWidthClass = isWide
    ? "max-w-[2560px] px-8 md:px-12"
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
