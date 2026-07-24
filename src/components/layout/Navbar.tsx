import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMagnetic } from "@/hooks/useMagnetic";
import { SoundToggle } from "@/components/SoundToggle";

const links = [
  { to: "/expeditions", label: "Expeditions" },
  { to: "/marine-life", label: "Marine Life" },
  { to: "/technology", label: "Technology" },
  { to: "/sustainability", label: "Sustainability" },
  { to: "/gallery", label: "Gallery" },
  { to: "/faq", label: "FAQ" },
];

export function Navbar() {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const ctaMagnet = useMagnetic<HTMLAnchorElement>(0.3);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      if (Math.abs(y - lastY) > 8) {
        setHidden(y > lastY && y > 160);
        lastY = y;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: hidden ? -110 : 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-0 top-0 z-[100] px-4 pt-4 md:px-8"
      >
        <nav
          aria-label="Primary"
          className={cn(
            "glass-deep mx-auto flex max-w-6xl items-center justify-between rounded-full px-5 py-3 transition-all duration-700 md:px-7",
            scrolled && "shadow-[0_10px_40px_rgba(0,3,8,0.5)]"
          )}
        >
          <Link
            to="/"
            data-cursor="hover"
            aria-label="ABYSS home"
            className="group flex items-center gap-3"
          >
            <svg width="26" height="26" viewBox="0 0 64 64" aria-hidden="true">
              <path
                d="M32 10 L46 44 L32 36 L18 44 Z"
                fill="none"
                stroke="#7DF9FF"
                strokeWidth="3"
                strokeLinejoin="round"
                className="transition-all duration-500 group-hover:stroke-[#00E5FF]"
              />
              <circle cx="32" cy="52" r="3" fill="#00E5FF" className="animate-pulse-soft" />
            </svg>
            <span className="font-display text-lg font-semibold tracking-[0.3em] text-white">
              ABYSS
            </span>
          </Link>

          <ul className="hidden items-center gap-8 lg:flex">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  data-cursor="hover"
                  className={({ isActive }) =>
                    cn(
                      "nav-link text-[13px] tracking-[0.14em] uppercase transition-colors duration-300",
                      isActive
                        ? "active text-glow-ice"
                        : "text-slate-300 hover:text-white"
                    )
                  }
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <SoundToggle />
            <Link
              to="/booking"
              ref={ctaMagnet}
              data-cursor="hover"
              className="hidden rounded-full border border-glow-cyan/40 bg-glow-cyan/10 px-5 py-2 text-[12px] uppercase tracking-[0.18em] text-glow-ice transition-all duration-500 hover:bg-glow-cyan/20 hover:shadow-[0_0_30px_rgba(0,229,255,0.3)] md:inline-block"
            >
              Book a Dive
            </Link>
            <button
              data-cursor="hover"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-400/20 text-slate-200 transition-colors hover:border-glow-cyan/50 hover:text-glow-ice lg:hidden"
            >
              {menuOpen ? <X size={18} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, clipPath: "circle(0% at 92% 6%)" }}
            animate={{ opacity: 1, clipPath: "circle(140% at 92% 6%)" }}
            exit={{ opacity: 0, clipPath: "circle(0% at 92% 6%)" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[95] bg-abyss-950/95 backdrop-blur-2xl lg:hidden"
          >
            <nav aria-label="Mobile" className="flex h-full flex-col items-center justify-center gap-2">
              {[{ to: "/", label: "Home" }, ...links, { to: "/booking", label: "Book a Dive" }, { to: "/contact", label: "Contact" }].map(
                (l, i) => (
                  <motion.div
                    key={l.to}
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.15 + i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <NavLink
                      to={l.to}
                      className={({ isActive }) =>
                        cn(
                          "font-display text-3xl tracking-wide transition-colors",
                          isActive ? "text-glow-cyan" : "text-slate-200 hover:text-glow-ice"
                        )
                      }
                    >
                      {l.label}
                    </NavLink>
                  </motion.div>
                )
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
