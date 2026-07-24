import { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "./useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

let activeLenis: Lenis | null = null;

export function getLenis() {
  return activeLenis;
}

export function scrollToTarget(target: string | number | HTMLElement) {
  if (activeLenis) {
    activeLenis.scrollTo(target as never, { duration: 2.2 });
  } else if (typeof target === "number") {
    window.scrollTo({ top: target, behavior: "smooth" });
  } else if (typeof target === "string") {
    document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
  } else {
    target.scrollIntoView({ behavior: "smooth" });
  }
}

/** Mounts Lenis smooth scrolling wired into GSAP's ticker + ScrollTrigger. */
export function useSmoothScroll() {
  const reduced = usePrefersReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (reduced) return;

    const lenis = new Lenis({
      lerp: 0.07,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.4,
    });
    lenisRef.current = lenis;
    activeLenis = lenis;
    if (import.meta.env.DEV) (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      activeLenis = null;
    };
  }, [reduced]);

  return lenisRef;
}
