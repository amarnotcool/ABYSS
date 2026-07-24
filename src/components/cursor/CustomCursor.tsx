import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Liquid two-part cursor: a tight dot and a trailing ring that morphs over
 * interactive elements. Clicks emit a ripple plus a burst of tiny bubbles.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    document.body.classList.add("custom-cursor");
    const dot = dotRef.current!;
    const ring = ringRef.current!;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate(${mx - 3}px, ${my - 3}px)`;
    };

    const loop = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      const w = ring.offsetWidth;
      ring.style.transform = `translate(${rx - w / 2}px, ${ry - w / 2}px)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest(
        "a, button, [data-cursor], input, textarea, select, [role='button']"
      );
      ring.classList.toggle("is-hover", !!target);
    };

    const onClick = (e: MouseEvent) => {
      const ripple = document.createElement("span");
      ripple.className = "click-ripple";
      ripple.style.left = `${e.clientX}px`;
      ripple.style.top = `${e.clientY}px`;
      ripple.style.width = ripple.style.height = "90px";
      document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), 750);

      for (let i = 0; i < 4; i++) {
        const b = document.createElement("span");
        b.className = "click-bubble";
        const size = 5 + Math.random() * 9;
        b.style.width = b.style.height = `${size}px`;
        b.style.left = `${e.clientX + (Math.random() - 0.5) * 26}px`;
        b.style.top = `${e.clientY + (Math.random() - 0.5) * 14}px`;
        b.style.setProperty("--bx", `${(Math.random() - 0.5) * 70}px`);
        b.style.animationDelay = `${Math.random() * 0.15}s`;
        document.body.appendChild(b);
        setTimeout(() => b.remove(), 1600);
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(raf);
      document.body.classList.remove("custom-cursor");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("click", onClick);
    };
  }, [reduced]);

  if (reduced) return null;

  return (
    <div aria-hidden="true">
      <div ref={dotRef} className="cursor-dot hidden md:block" />
      <div ref={ringRef} className="cursor-ring hidden md:block">
        <span className="cursor-label">Dive</span>
      </div>
    </div>
  );
}
