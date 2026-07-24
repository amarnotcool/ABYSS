import { Link } from "react-router-dom";
import { ArrowUp } from "lucide-react";
import { scrollToTarget } from "@/hooks/useSmoothScroll";

const columns = [
  {
    title: "Voyages",
    links: [
      { to: "/expeditions", label: "All Expeditions" },
      { to: "/booking", label: "Book a Dive" },
      { to: "/gallery", label: "Gallery" },
    ],
  },
  {
    title: "The Deep",
    links: [
      { to: "/marine-life", label: "Marine Life" },
      { to: "/technology", label: "Technology" },
      { to: "/sustainability", label: "Sustainability" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/contact", label: "Contact" },
      { to: "/faq", label: "FAQ" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative border-t border-glow-mist/10 bg-abyss-950/80">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Link to="/" data-cursor="hover" className="flex items-center gap-3">
              <svg width="30" height="30" viewBox="0 0 64 64" aria-hidden="true">
                <path
                  d="M32 10 L46 44 L32 36 L18 44 Z"
                  fill="none"
                  stroke="#7DF9FF"
                  strokeWidth="3"
                  strokeLinejoin="round"
                />
                <circle cx="32" cy="52" r="3" fill="#00E5FF" />
              </svg>
              <span className="font-display text-xl font-semibold tracking-[0.3em] text-white">
                ABYSS
              </span>
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-slate-400">
              Deep Sea Exploration Co. Luxury submersible voyages from sunlit
              reefs to the hadal trench.
            </p>
            <p className="mt-6 font-mono text-[11px] uppercase tracking-widest2 text-slate-500">
              Explore the last unknown world
            </p>
          </div>

          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="kicker mb-5">{col.title}</h3>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      data-cursor="hover"
                      className="nav-link text-sm text-slate-300 transition-colors hover:text-glow-ice"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-glow-mist/10 pt-8 md:flex-row">
          <div className="text-center text-xs text-slate-500 md:text-left">
            <p>
              © {new Date().getFullYear()} ABYSS Deep Sea Exploration Co. A
              fictional experience, crafted for the surface web.
            </p>
            <p className="mt-1 text-[10px] text-slate-600">
              3D models by Quaternius, Kenney, Poly by Google, MiniPoly,
              Geoffrey Bell &amp; Laney XR Labs (CC0 / CC-BY, via Poly Pizza).
            </p>
          </div>
          <button
            data-cursor="hover"
            onClick={() => scrollToTarget(0)}
            className="group flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400 transition-colors hover:text-glow-ice"
          >
            Return to surface
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-400/25 transition-all duration-500 group-hover:-translate-y-1 group-hover:border-glow-cyan/60">
              <ArrowUp size={14} strokeWidth={1.5} />
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
}
