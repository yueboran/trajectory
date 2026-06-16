/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  speed: number;
}

export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let stars: Star[] = [];
    let width = 0;
    let height = 0;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: entryWidth, height: entryHeight } = entry.contentRect;
        width = canvas.width = entryWidth;
        height = canvas.height = entryHeight;
        initStars();
      }
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    function initStars() {
      stars = [];
      const density = Math.floor((width * height) / 3200); // celestial density
      for (let i = 0; i < density; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.4 + 0.1,
          alpha: Math.random(),
          speed: Math.random() * 0.015 + 0.003,
        });
      }
    }

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = "#ffffff";
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        ctx.globalAlpha = star.alpha;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();

        // Twinkle update
        star.alpha += star.speed;
        if (star.alpha > 0.95 || star.alpha < 0.05) {
          star.speed = -star.speed;
        }

        // Slow cosmic drift upward
        star.y -= 0.15;
        if (star.y < 0) {
          star.y = height;
          star.x = Math.random() * width;
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      id="starfield"
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-40 bg-transparent"
    />
  );
}
