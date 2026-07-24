import { cn } from "@/lib/utils";

/**
 * Stylized "expedition log" line art. One drawing per species,
 * thin luminous strokes on transparent ground, subtle idle motion.
 */

const stroke = {
  stroke: "#8ED6FF",
  strokeWidth: 1.6,
  fill: "none",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const glowStroke = { ...stroke, stroke: "#00E5FF" };

function Turtle() {
  return (
    <g className="creature-float">
      <ellipse cx="100" cy="72" rx="38" ry="29" {...stroke} />
      <path d="M78 58 L100 50 L122 58 L128 76 L112 92 L88 92 L72 76 Z" {...stroke} strokeWidth={1.1} opacity={0.7} />
      <path d="M100 50 L100 92 M78 58 L112 92 M122 58 L88 92" {...stroke} strokeWidth={0.8} opacity={0.45} />
      <circle cx="100" cy="34" r="9" {...stroke} />
      <circle cx="97" cy="32" r="1.2" fill="#7DF9FF" stroke="none" />
      <path className="fin-flap" d="M64 60 C48 50 36 52 26 62 C38 66 50 70 64 72" {...stroke} />
      <path className="fin-flap" d="M136 60 C152 50 164 52 174 62 C162 66 150 70 136 72" {...stroke} />
      <path d="M74 94 C66 102 60 104 52 104 M126 94 C134 102 140 104 148 104" {...stroke} opacity={0.8} />
    </g>
  );
}

function Whale() {
  return (
    <g className="creature-float">
      <path
        d="M16 76 C36 52 96 44 138 56 C150 60 158 61 164 59 L178 45 C177 57 175 63 171 67 C175 71 179 78 181 88 C171 80 163 76 157 73 C140 84 58 96 16 76 Z"
        {...stroke}
      />
      <path d="M60 82 C66 88 74 90 82 88" {...stroke} opacity={0.8} />
      <path d="M28 72 C40 78 54 80 66 79 M30 78 C40 82 50 84 60 83" {...stroke} strokeWidth={0.8} opacity={0.4} />
      <circle cx="42" cy="66" r="1.5" fill="#7DF9FF" stroke="none" />
      <path d="M34 56 C32 48 34 42 40 38 M40 56 C40 50 43 45 48 42" {...glowStroke} strokeWidth={1} opacity={0.6} />
    </g>
  );
}

function Octopus() {
  return (
    <g className="creature-float">
      <path d="M74 66 C74 40 126 40 126 66 C126 76 122 82 116 86 L84 86 C78 82 74 76 74 66 Z" {...stroke} />
      <circle cx="90" cy="62" r="2" fill="#7DF9FF" stroke="none" />
      <circle cx="110" cy="62" r="2" fill="#7DF9FF" stroke="none" />
      <g className="tentacle" style={{ animationDelay: "0s" }}>
        <path d="M82 86 C76 102 62 108 48 102 C40 98 38 90 44 86" {...stroke} />
      </g>
      <g className="tentacle" style={{ animationDelay: "-1s" }}>
        <path d="M92 88 C90 106 82 118 68 122 C60 124 54 118 58 112" {...stroke} />
      </g>
      <g className="tentacle" style={{ animationDelay: "-2s" }}>
        <path d="M104 88 C106 108 114 118 128 120 C136 121 140 114 134 110" {...stroke} />
      </g>
      <g className="tentacle" style={{ animationDelay: "-3s" }}>
        <path d="M114 86 C122 100 136 106 150 100 C156 96 156 90 150 88" {...stroke} />
      </g>
      <path d="M86 96 C90 98 94 98 98 96" {...stroke} strokeWidth={0.9} opacity={0.5} />
    </g>
  );
}

function Hammerhead() {
  return (
    <g className="creature-float">
      <path
        d="M30 56 C26 46 30 39 38 39 L48 41 C62 45 76 47 88 47 C120 47 146 53 162 65 L172 53 L176 77 L166 69 C150 79 120 81 96 75 C80 71 60 65 48 63 L38 67 C30 67 28 62 30 56 Z"
        {...stroke}
      />
      <path d="M104 47 L114 30 L126 45" {...stroke} />
      <path d="M112 75 L116 86 L126 74" {...stroke} opacity={0.85} />
      <circle cx="36" cy="45" r="1.6" fill="#7DF9FF" stroke="none" />
      <path d="M96 58 L112 58 M100 64 L116 64" {...stroke} strokeWidth={0.8} opacity={0.4} />
    </g>
  );
}

function JellyfishArt() {
  return (
    <g className="creature-float">
      <path
        d="M62 68 C62 40 138 40 138 68 C138 76 130 80 122 78 C114 82 106 82 100 80 C94 82 86 82 78 78 C70 80 62 76 62 68 Z"
        {...glowStroke}
      />
      <path d="M74 56 C82 48 118 48 126 56" {...stroke} strokeWidth={0.9} opacity={0.5} />
      {[
        [76, "0s", "M0 0 C-4 14 4 26 -2 40"],
        [88, "-0.8s", "M0 0 C4 16 -4 30 2 44"],
        [100, "-1.6s", "M0 0 C-3 18 3 32 -3 48"],
        [112, "-2.4s", "M0 0 C4 14 -4 28 4 42"],
        [124, "-3.2s", "M0 0 C-4 12 4 26 -2 38"],
      ].map(([x, delay, d]) => (
        <g key={x as number} className="tentacle" style={{ animationDelay: delay as string }} transform={`translate(${x}, 80)`}>
          <path d={d as string} {...glowStroke} strokeWidth={1.1} opacity={0.7} />
        </g>
      ))}
      <circle cx="100" cy="62" r="6" fill="rgba(0,229,255,0.25)" stroke="none" className="animate-pulse-soft" />
    </g>
  );
}

function Coral() {
  return (
    <g>
      <path d="M100 122 L100 84 M100 96 L84 78 L84 62 M84 70 L74 60 M100 88 L118 70 L118 56 M118 64 L128 54" {...stroke} />
      <path d="M60 122 L60 98 M60 106 L50 96 M60 102 L70 92" {...stroke} opacity={0.8} />
      <path d="M144 122 L144 94 M144 104 L134 94 M144 100 L156 88" {...stroke} opacity={0.8} />
      <path d="M36 122 C34 112 38 104 46 100 M172 122 C174 110 168 102 160 100" {...stroke} strokeWidth={1.1} opacity={0.6} />
      {[
        [84, 62], [74, 60], [118, 56], [128, 54], [100, 84],
        [50, 96], [70, 92], [134, 94], [156, 88],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.4" fill="rgba(0,229,255,0.5)" stroke="none" className="animate-pulse-soft" style={{ animationDelay: `${i * 0.35}s` }} />
      ))}
    </g>
  );
}

function Stingray() {
  return (
    <g className="creature-float">
      <path
        d="M100 36 C136 50 158 72 152 80 C144 90 116 95 100 96 C84 95 56 90 48 80 C42 72 64 50 100 36 Z"
        {...stroke}
      />
      <path className="fin-flap" d="M60 66 C74 60 88 58 100 58 M140 66 C126 60 112 58 100 58" {...stroke} strokeWidth={0.9} opacity={0.5} />
      <circle cx="92" cy="50" r="1.5" fill="#7DF9FF" stroke="none" />
      <circle cx="108" cy="50" r="1.5" fill="#7DF9FF" stroke="none" />
      <path d="M100 96 C102 106 108 116 122 124 M116 112 L124 108" {...stroke} />
    </g>
  );
}

function Manta() {
  return (
    <g className="creature-float">
      <path
        d="M100 54 C72 40 42 44 22 62 C42 64 60 70 74 82 C84 90 92 94 100 94 C108 94 116 90 126 82 C140 70 158 64 178 62 C158 44 128 40 100 54 Z"
        {...stroke}
      />
      <path d="M92 52 C90 46 92 42 96 40 M108 52 C110 46 108 42 104 40" {...stroke} />
      <path d="M100 94 C100 106 102 116 106 124" {...stroke} strokeWidth={1} opacity={0.7} />
      <circle cx="94" cy="56" r="1.4" fill="#7DF9FF" stroke="none" />
      <circle cx="106" cy="56" r="1.4" fill="#7DF9FF" stroke="none" />
    </g>
  );
}

function Angler() {
  return (
    <g className="creature-float">
      <path
        d="M58 74 C58 52 84 42 106 46 C128 50 142 62 142 74 C142 88 124 100 102 100 C80 100 58 92 58 74 Z"
        {...stroke}
      />
      <path d="M60 68 L76 72 L64 76 L80 80 L66 84 L82 88" {...glowStroke} strokeWidth={1.2} />
      <circle cx="96" cy="62" r="3" {...stroke} />
      <circle cx="96" cy="62" r="1.2" fill="#7DF9FF" stroke="none" />
      <path d="M98 46 C92 30 78 24 68 30" {...stroke} />
      <circle className="lure-glow" cx="66" cy="31" r="5" fill="rgba(0,229,255,0.75)" stroke="none" />
      <path d="M142 74 L156 62 L154 78 L158 90 L144 82" {...stroke} />
      <path d="M112 100 L116 112 L124 98" {...stroke} opacity={0.8} />
    </g>
  );
}

const art: Record<string, () => JSX.Element> = {
  "sea-turtle": Turtle,
  "blue-whale": Whale,
  octopus: Octopus,
  hammerhead: Hammerhead,
  jellyfish: JellyfishArt,
  coral: Coral,
  stingray: Stingray,
  "manta-ray": Manta,
  anglerfish: Angler,
};

export function CreatureArt({ id, className }: { id: string; className?: string }) {
  const Art = art[id];
  if (!Art) return null;
  return (
    <svg
      viewBox="0 0 200 140"
      role="img"
      aria-label={`${id.replace(/-/g, " ")} illustration`}
      className={cn("drop-shadow-[0_0_10px_rgba(0,229,255,0.25)]", className)}
    >
      <Art />
    </svg>
  );
}
