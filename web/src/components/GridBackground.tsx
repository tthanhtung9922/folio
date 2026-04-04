"use client";

import { useEffect, useRef } from "react";

const GRID = 32;
const RADIUS = 200;
const MAX_DISP = 20;
const LERP_SPEED = 0.07;
const GRID_ALPHA = 0.28;
const STEP = 6;

const ACCENT_R = 196;
const ACCENT_G = 98;
const ACCENT_B = 45;

const GRID_R = 228;
const GRID_G = 216;
const GRID_B = 204;

export function GridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const ctxEl = canvasEl.getContext("2d");
    if (!ctxEl) return;

    // Re-declare với kiểu non-null để TypeScript không complain trong closures
    const canvas: HTMLCanvasElement = canvasEl;
    const ctx: CanvasRenderingContext2D = ctxEl;

    let mouseX = -9999;
    let mouseY = -9999;
    let lerpX = -9999;
    let lerpY = -9999;
    let rafId: number;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function draw() {
      const W = canvas.width;
      const H = canvas.height;

      lerpX += (mouseX - lerpX) * LERP_SPEED;
      lerpY += (mouseY - lerpY) * LERP_SPEED;

      ctx.clearRect(0, 0, W, H);

      // ── Layer 1: Nền parchment ──────────────────────────────────────
      ctx.fillStyle = "#FBF8F4";
      ctx.fillRect(0, 0, W, H);

      // ── Layer 2: Terracotta glow dưới cursor ────────────────────────
      if (mouseX > -100) {
        const accentGrd = ctx.createRadialGradient(
          lerpX,
          lerpY,
          0,
          lerpX,
          lerpY,
          RADIUS * 1.2,
        );
        accentGrd.addColorStop(
          0,
          `rgba(${ACCENT_R},${ACCENT_G},${ACCENT_B},0.13)`,
        );
        accentGrd.addColorStop(
          0.5,
          `rgba(${ACCENT_R},${ACCENT_G},${ACCENT_B},0.05)`,
        );
        accentGrd.addColorStop(
          1,
          `rgba(${ACCENT_R},${ACCENT_G},${ACCENT_B},0)`,
        );
        ctx.fillStyle = accentGrd;
        ctx.fillRect(0, 0, W, H);
      }

      // ── Layer 3: Lưới bị biến dạng theo cursor ─────────────────────
      ctx.lineWidth = 0.8;

      // Đường ngang
      for (let gy = 0; gy <= H + GRID; gy += GRID) {
        ctx.beginPath();
        let firstPoint = true;

        for (let gx = 0; gx <= W + STEP; gx += STEP) {
          const dx = lerpX - gx;
          const dy = lerpY - gy;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const rawForce = Math.max(0, 1 - dist / RADIUS);
          const force = rawForce * rawForce;

          const px = gx + (dx / dist) * force * MAX_DISP;
          const py = gy + (dy / dist) * force * MAX_DISP;
          const alpha = GRID_ALPHA * (1 - force * 0.75);

          ctx.strokeStyle = `rgba(${GRID_R},${GRID_G},${GRID_B},${alpha.toFixed(3)})`;

          if (firstPoint) {
            ctx.moveTo(px, py);
            firstPoint = false;
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.stroke();
      }

      // Đường dọc
      for (let gx = 0; gx <= W + GRID; gx += GRID) {
        ctx.beginPath();
        let firstPoint = true;

        for (let gy = 0; gy <= H + STEP; gy += STEP) {
          const dx = lerpX - gx;
          const dy = lerpY - gy;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const rawForce = Math.max(0, 1 - dist / RADIUS);
          const force = rawForce * rawForce;

          const px = gx + (dx / dist) * force * MAX_DISP;
          const py = gy + (dy / dist) * force * MAX_DISP;
          const alpha = GRID_ALPHA * (1 - force * 0.75);

          ctx.strokeStyle = `rgba(${GRID_R},${GRID_G},${GRID_B},${alpha.toFixed(3)})`;

          if (firstPoint) {
            ctx.moveTo(px, py);
            firstPoint = false;
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.stroke();
      }

      // ── Layer 4: Vignette cạnh màn hình ────────────────────────────
      const vigGrd = ctx.createRadialGradient(
        W / 2,
        H / 2,
        Math.min(W, H) * 0.18,
        W / 2,
        H / 2,
        Math.max(W, H) * 0.75,
      );
      vigGrd.addColorStop(0, "rgba(251,248,244,0)");
      vigGrd.addColorStop(1, "rgba(251,248,244,0.82)");
      ctx.fillStyle = vigGrd;
      ctx.fillRect(0, 0, W, H);

      rafId = requestAnimationFrame(draw);
    }

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const onMouseLeave = () => {
      mouseX = -9999;
      mouseY = -9999;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("resize", resize);

    resize();
    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[-1]">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
