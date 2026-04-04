"use client";

import { useEffect, useState } from "react";
import { useLayout } from "@/context/LayoutContext";

export function CustomCursor() {
  const { isCustomCursor, isDarkMode } = useLayout();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  // Ẩn cursor lúc mới load trang chưa di chuyển chuột để tránh bị giật
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Kiểm tra xem chuột có đang nằm trên các thẻ có thể click không
      const isClickable =
        target.tagName.toLowerCase() === "button" ||
        target.closest("button") !== null ||
        target.tagName.toLowerCase() === "a" ||
        target.closest("a") !== null ||
        target.classList.contains("cursor-pointer") ||
        window.getComputedStyle(target).cursor === "pointer";

      setIsHovering(isClickable);
    };

    window.addEventListener("mousemove", updatePosition);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", updatePosition);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [isVisible]);

  // Không hiển thị trên màn hình điện thoại/tablet (vì dùng cảm ứng)
  if (typeof window !== "undefined" && window.innerWidth < 768) return null;
  if (!isCustomCursor || !isVisible) return null;

  return (
    <div
      className="fixed top-0 left-0 pointer-events-none z-9999 rounded-full bg-terracotta transition-all ease-out"
      style={{
        // Thiết lập kích thước mặc định là 10px
        width: "10px",
        height: "10px",
        // Thời gian chuyển đổi 0.15s
        transitionDuration: "150ms",
        // mix-blend-mode để tạo hiệu ứng xuyên thấu màu sắc với nền
        mixBlendMode: isDarkMode ? "screen" : "multiply",
        // Di chuyển chấm tròn đến đúng tọa độ chuột (trừ đi 5px để căn giữa)
        // Khi isHovering = true -> Phóng to gấp 2.8 lần (thành 28px)
        transform: `translate3d(${position.x - 5}px, ${position.y - 5}px, 0) scale(${isHovering ? 2.8 : 1})`,
        // Khi hover -> giảm opacity xuống 0.25
        opacity: isHovering ? 0.25 : 1,
      }}
    />
  );
}
