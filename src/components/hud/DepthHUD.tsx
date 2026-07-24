import { useEffect, useRef } from "react";
import gsap from "gsap";
import { oceanState } from "@/lib/oceanState";
import { formatDepth } from "@/lib/utils";

/**
 * Expedition instruments: a depth rail on the right, a sonar dial bottom-left.
 * Reads oceanState every frame — zero React re-renders.
 */
export function DepthHUD() {
  const rootRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);
  const zoneRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current!;
    const readout = readoutRef.current!;
    const marker = markerRef.current!;
    const zone = zoneRef.current!;
    let lastZone = "";

    const tick = () => {
      const { progress, depth } = oceanState;
      const visible = progress > 0.015 && progress < 0.995;
      root.style.opacity = visible ? "1" : "0";
      readout.textContent = `-${formatDepth(depth)}`;
      marker.style.top = `${progress * 100}%`;

      const z =
        depth < 200
          ? "SUNLIGHT ZONE"
          : depth < 1000
            ? "TWILIGHT ZONE"
            : depth < 2500
              ? "MIDNIGHT ZONE"
              : "ABYSSAL ZONE";
      if (z !== lastZone) {
        lastZone = z;
        zone.textContent = z;
        gsap.fromTo(zone, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.8 });
      }
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[80] opacity-0 transition-opacity duration-1000"
    >
      {/* Depth rail — right */}
      <div className="absolute right-6 top-1/2 hidden h-[46vh] -translate-y-1/2 items-center gap-4 md:flex">
        <div className="flex h-full flex-col items-end justify-between py-1">
          {["0", "200", "1200", "4000"].map((m) => (
            <span key={m} className="font-mono text-[9px] tracking-widest text-glow-mist/40">
              {m}
            </span>
          ))}
        </div>
        <div className="relative h-full w-px bg-gradient-to-b from-glow-mist/40 via-glow-mist/15 to-glow-cyan/40">
          <div
            ref={markerRef}
            className="absolute -left-[5px] h-[11px] w-[11px] -translate-y-1/2 rounded-full border border-glow-cyan bg-abyss-900 shadow-[0_0_12px_rgba(0,229,255,0.8)]"
          />
        </div>
      </div>

      {/* Readout — bottom right */}
      <div className="absolute bottom-8 right-6 text-right md:right-24">
        <span ref={readoutRef} className="font-mono text-2xl font-light tracking-widest text-glow-ice heading-glow">
          -0 M
        </span>
        <div className="mt-1">
          <span ref={zoneRef} className="font-mono text-[9px] tracking-widest2 text-glow-mist/60" />
        </div>
      </div>

      {/* Sonar — bottom left */}
      <div className="absolute bottom-8 left-6 hidden md:block">
        <div className="relative h-20 w-20">
          <div className="absolute inset-0 rounded-full border border-glow-mist/20" />
          <div className="absolute inset-3 rounded-full border border-glow-mist/12" />
          <div className="absolute inset-6 rounded-full border border-glow-mist/10" />
          <div className="absolute inset-0 animate-sonar rounded-full border border-glow-cyan/50" />
          <svg viewBox="0 0 80 80" className="sonar-sweep absolute inset-0">
            <defs>
              <linearGradient id="sweep" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="rgba(0,229,255,0.5)" />
                <stop offset="1" stopColor="transparent" />
              </linearGradient>
            </defs>
            <path d="M40 40 L40 2 A38 38 0 0 1 66 13 Z" fill="url(#sweep)" />
          </svg>
          <div className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-glow-cyan shadow-[0_0_8px_rgba(0,229,255,1)]" />
          <div className="absolute left-[62%] top-[30%] h-[3px] w-[3px] animate-pulse-soft rounded-full bg-glow-ice/80" />
        </div>
        <p className="mt-2 text-center font-mono text-[8px] tracking-widest2 text-glow-mist/40">
          SONAR
        </p>
      </div>
    </div>
  );
}
