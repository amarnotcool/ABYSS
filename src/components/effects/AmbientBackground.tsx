import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  /** Tailwind gradient classes for the base wash */
  gradient?: string;
  particleCount?: number;
}

/**
 * Lightweight 2D-canvas marine snow for the inner pages —
 * ambience without the cost of a full WebGL scene.
 */
export function AmbientBackground({
  className,
  gradient = "bg-gradient-to-b from-abyss-800 via-abyss-900 to-abyss-950",
  particleCount = 70,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let w = 0;
    let h = 0;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const parts = Array.from({ length: particleCount }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.6 + Math.random() * 1.8,
      s: 0.08 + Math.random() * 0.3,
      o: 0.15 + Math.random() * 0.4,
      drift: Math.random() * Math.PI * 2,
    }));

    let t = 0;
    const loop = () => {
      t += 0.008;
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.y -= (p.s * 0.001);
        if (p.y < -0.02) p.y = 1.02;
        const x = p.x * w + Math.sin(t + p.drift) * 14;
        const y = p.y * h;
        ctx.beginPath();
        ctx.arc(x, y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(142, 214, 255, ${p.o * (0.7 + Math.sin(t * 2 + p.drift) * 0.3)})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [reduced, particleCount]);

  return (
    <div aria-hidden="true" className={cn("fixed inset-0 z-0", gradient, className)}>
      <canvas ref={canvasRef} className="h-full w-full opacity-70" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 50% 0%, rgba(74,144,226,0.12), transparent 60%)",
        }}
      />
    </div>
  );
}
