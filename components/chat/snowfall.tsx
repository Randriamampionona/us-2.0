"use client";

import { useEffect, useRef } from "react";

export default function Snowfall() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;
    let W = window.innerWidth;
    let H = window.innerHeight;

    canvas.width = W;
    canvas.height = H;

    const SNOWFLAKE = "❄︎";

    // ↓ Reduced to ~30 flakes
    const flakes = Array.from({ length: 20 }).map(() => ({
      x: Math.random() * W,
      y: Math.random() * H,
      size: 12 + Math.random() * 20,
      speed: 0.5 + Math.random() * 1.2,
      opacity: 0.4 + Math.random() * 0.6,
    }));

    function draw() {
      ctx.clearRect(0, 0, W, H);

      for (let f of flakes) {
        ctx.globalAlpha = f.opacity;
        ctx.fillStyle = "white";
        ctx.font = `${f.size}px serif`;
        ctx.fillText(SNOWFLAKE, f.x, f.y);
      }

      update();
    }

    function update() {
      for (let f of flakes) {
        // ↓ Only fall downward
        f.y += f.speed;

        // Respawn at top
        if (f.y > H + 20) {
          f.y = -20;
          f.x = Math.random() * W;
        }
      }
    }

    function animate() {
      draw();
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
