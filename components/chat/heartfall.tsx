"use client";

import { useEffect, useRef } from "react";

export default function Heartfall() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;
    let W = window.innerWidth;
    let H = window.innerHeight;

    canvas.width = W;
    canvas.height = H;

    const HEARTS = ["❤️", "❤️", "❤️", "❤️", "🌺"]; // ~80/20 mix

    const hearts = Array.from({ length: 13 }).map(() => ({
      char: HEARTS[Math.floor(Math.random() * HEARTS.length)],
      x: Math.random() * W,
      y: H + Math.random() * H,
      size: 22 + Math.random() * 32,
      speed: 0.6 + Math.random() * 1.4,
      drift: -0.6 + Math.random() * 1.2,
      opacity: 0.4 + Math.random() * 0.6,
    }));

    function draw() {
      ctx.clearRect(0, 0, W, H);

      for (let h of hearts) {
        ctx.globalAlpha = h.opacity;
        ctx.font = `${h.size}px serif`;
        ctx.fillText(h.char, h.x, h.y);
      }
    }

    function update() {
      for (let h of hearts) {
        h.y -= h.speed;
        h.x += h.drift;

        if (h.y < -50) {
          h.y = H + 50;
          h.x = Math.random() * W;
          h.char = HEARTS[Math.floor(Math.random() * HEARTS.length)];
        }
      }
    }

    function animate() {
      draw();
      update();
      requestAnimationFrame(animate);
    }
    animate();

    const onResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    };
    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[999]"
    />
  );
}
