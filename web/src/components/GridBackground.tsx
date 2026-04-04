"use client";

import { useEffect, useRef } from "react";
import { useLayout } from "@/context/LayoutContext";

const TILE = 88;
const GROUT = 1.5;
const RADIUS = 200;
const LERP_SPEED = 0.06;

// Parchment tile surface
const TILE_R = 251;
const TILE_G = 248;
const TILE_B = 244;
// Sub-surface — whisper darker than parchment, grout lines barely visible
const SUB_R = 244;
const SUB_G = 240;
const SUB_B = 235;
// Terracotta accent
const TC_R = 196;
const TC_G = 98;
const TC_B = 45;

export function GridBackground() {
  const { isAnimated } = useLayout();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const ctxEl = canvasEl.getContext("2d");
    if (!ctxEl) return;

    const canvas: HTMLCanvasElement = canvasEl;
    const ctx: CanvasRenderingContext2D = ctxEl;

    let mouseX = -9999;
    let mouseY = -9999;
    let lerpX = -9999;
    let lerpY = -9999;
    let rafId: number;
    let running = true;

    const g2 = GROUT / 2;
    const tileW = TILE - GROUT;

    function drawVignette(W: number, H: number) {
      const vg = ctx.createRadialGradient(
        W / 2,
        H / 2,
        Math.min(W, H) * 0.18,
        W / 2,
        H / 2,
        Math.max(W, H) * 0.75,
      );
      vg.addColorStop(0, "rgba(251,248,244,0)");
      vg.addColorStop(1, "rgba(251,248,244,0.94)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);
    }

    function drawGrid(W: number, H: number) {
      const cols = Math.ceil(W / TILE) + 1;
      const rows = Math.ceil(H / TILE) + 1;
      ctx.fillStyle = `rgb(${TILE_R},${TILE_G},${TILE_B})`;
      for (let row = 0; row <= rows; row++) {
        for (let col = 0; col <= cols; col++) {
          ctx.fillRect(col * TILE + g2, row * TILE + g2, tileW, tileW);
        }
      }
    }

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (!isAnimated) drawStatic();
    }

    function drawStatic() {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = `rgb(${SUB_R},${SUB_G},${SUB_B})`;
      ctx.fillRect(0, 0, W, H);
      drawGrid(W, H);
      drawVignette(W, H);
    }

    function drawFrame() {
      const W = canvas.width;
      const H = canvas.height;

      lerpX += (mouseX - lerpX) * LERP_SPEED;
      lerpY += (mouseY - lerpY) * LERP_SPEED;

      ctx.clearRect(0, 0, W, H);

      // Layer 1: Sub-surface
      ctx.fillStyle = `rgb(${SUB_R},${SUB_G},${SUB_B})`;
      ctx.fillRect(0, 0, W, H);

      // Layer 2: Terracotta glow on sub-surface — shows through grout gaps
      if (mouseX > -100) {
        const grd = ctx.createRadialGradient(
          lerpX,
          lerpY,
          0,
          lerpX,
          lerpY,
          RADIUS,
        );
        grd.addColorStop(0, `rgba(${TC_R},${TC_G},${TC_B},0.65)`);
        grd.addColorStop(0.35, `rgba(${TC_R},${TC_G},${TC_B},0.22)`);
        grd.addColorStop(1, `rgba(${TC_R},${TC_G},${TC_B},0)`);
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, W, H);
      }

      // Layer 3: Fixed tile grid (covers sub-surface, grout gaps expose the glow)
      drawGrid(W, H);

      // Layer 4: Vignette
      drawVignette(W, H);

      if (running) {
        rafId = requestAnimationFrame(drawFrame);
      }
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

    if (isAnimated) {
      rafId = requestAnimationFrame(drawFrame);
    } else {
      drawStatic();
    }

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("resize", resize);
    };
  }, [isAnimated]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[-1]">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
