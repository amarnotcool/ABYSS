import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";
import { usePrefersReducedMotion } from "./useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

interface Options {
  /** "lines" | "words" | "chars" */
  by?: "lines" | "words" | "chars";
  delay?: number;
  stagger?: number;
  /** Trigger once when scrolled into view (default true) */
  once?: boolean;
}

/**
 * Splits text and reveals it with a masked slide-up when scrolled into view.
 * Splitting is deferred until fonts are ready so line detection is accurate
 * (and so StrictMode's double-effect never splits an already-split tree).
 */
export function useTextReveal<T extends HTMLElement>(options: Options = {}) {
  const ref = useRef<T | null>(null);
  const reduced = usePrefersReducedMotion();
  const { by = "lines", delay = 0, stagger = 0.08, once = true } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    let cancelled = false;
    let split: SplitType | null = null;
    let tween: gsap.core.Tween | null = null;

    const run = () => {
      if (cancelled || !ref.current) return;

      split = new SplitType(el, {
        types: by === "lines" ? "lines" : by === "words" ? "lines,words" : "lines,chars",
        lineClass: "split-line",
      });

      const targets =
        by === "lines" ? split.lines : by === "words" ? split.words : split.chars;
      if (!targets || targets.length === 0) return;

      // For line reveals, wrap contents so the mask clips them.
      let animTargets: HTMLElement[] = targets as HTMLElement[];
      if (by === "lines" && split.lines) {
        animTargets = split.lines.map((line) => {
          const inner = document.createElement("span");
          inner.className = "line-inner";
          while (line.firstChild) inner.appendChild(line.firstChild);
          line.appendChild(inner);
          return inner;
        });
      }

      tween = gsap.fromTo(
        animTargets,
        { yPercent: 120, opacity: by === "lines" ? 1 : 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 1.1,
          ease: "power4.out",
          delay,
          stagger,
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            toggleActions: once ? "play none none none" : "play none none reverse",
          },
        }
      );
    };

    // Wait for webfonts so measured line breaks match the final layout.
    document.fonts.ready.then(() => requestAnimationFrame(run));

    return () => {
      cancelled = true;
      tween?.scrollTrigger?.kill();
      tween?.kill();
      split?.revert();
    };
  }, [by, delay, stagger, once, reduced]);

  return ref;
}
