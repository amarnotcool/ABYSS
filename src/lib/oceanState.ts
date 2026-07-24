/**
 * Mutable, frame-synchronous state shared between the DOM scroll world and the
 * WebGL ocean. Read inside rAF/useFrame loops — never triggers React renders.
 */
export const oceanState = {
  /** 0..1 scroll progress across the Home descent */
  progress: 0,
  /** Current depth in meters (derived from progress) */
  depth: 0,
  /** Normalized pointer, -1..1 (y up) */
  mouseX: 0,
  mouseY: 0,
  /** Pointer in viewport px, for DOM effects */
  pointerX: 0,
  pointerY: 0,
};

/** Depth stops matching the eight home scenes. */
const DEPTH_STOPS = [0, 12, 50, 200, 500, 1200, 2500, 4000];

export function progressToDepth(p: number) {
  const seg = 1 / (DEPTH_STOPS.length - 1);
  const i = Math.min(
    DEPTH_STOPS.length - 2,
    Math.max(0, Math.floor(p / seg))
  );
  const t = (p - i * seg) / seg;
  return DEPTH_STOPS[i] + (DEPTH_STOPS[i + 1] - DEPTH_STOPS[i]) * Math.min(1, Math.max(0, t));
}

if (typeof window !== "undefined") {
  window.addEventListener(
    "pointermove",
    (e) => {
      oceanState.pointerX = e.clientX;
      oceanState.pointerY = e.clientY;
      oceanState.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      oceanState.mouseY = -((e.clientY / window.innerHeight) * 2 - 1);
    },
    { passive: true }
  );
}
