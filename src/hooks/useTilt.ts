import { useRef, useEffect } from "react";
import gsap from "gsap";
import { usePrefersReducedMotion } from "./useReducedMotion";

/** 3D perspective tilt that follows the cursor across the card. */
export function useTilt<T extends HTMLElement>(maxTilt = 8) {
  const ref = useRef<T | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const rxTo = gsap.quickTo(el, "rotationX", { duration: 0.6, ease: "power3.out" });
    const ryTo = gsap.quickTo(el, "rotationY", { duration: 0.6, ease: "power3.out" });
    gsap.set(el, { transformPerspective: 900 });

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      rxTo(-py * maxTilt);
      ryTo(px * maxTilt);
    };
    const onLeave = () => {
      rxTo(0);
      ryTo(0);
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [maxTilt, reduced]);

  return ref;
}
