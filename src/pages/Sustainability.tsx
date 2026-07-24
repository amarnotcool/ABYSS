import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Recycle, FlaskConical, Sprout, Fish } from "lucide-react";
import { Seo } from "@/components/Seo";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { PageHeader } from "@/components/layout/PageHeader";
import { Footer } from "@/components/layout/Footer";
import { AmbientBackground } from "@/components/effects/AmbientBackground";
import { ButtonLink } from "@/components/ui/Button";
import { usePrefersReducedMotion } from "@/hooks/useReducedMotion";

/* Animated progress ring */
function Ring({ pct, label, sub }: { pct: number; label: string; sub: string }) {
  const circleRef = useRef<SVGCircleElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const reduced = usePrefersReducedMotion();
  const R = 52;
  const C = 2 * Math.PI * R;

  useEffect(() => {
    const circle = circleRef.current!;
    const num = numRef.current!;
    if (reduced) {
      circle.style.strokeDashoffset = `${C * (1 - pct / 100)}`;
      num.textContent = `${pct}`;
      return;
    }
    circle.style.strokeDasharray = `${C}`;
    circle.style.strokeDashoffset = `${C}`;
    const obj = { v: 0 };
    const tween = gsap.to(obj, {
      v: pct,
      duration: 2.2,
      ease: "power3.out",
      scrollTrigger: { trigger: circle, start: "top 88%" },
      onUpdate: () => {
        num.textContent = `${Math.round(obj.v)}`;
        circle.style.strokeDashoffset = `${C * (1 - obj.v / 100)}`;
      },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [pct, C, reduced]);

  return (
    <div className="glass card-glow flex flex-col items-center rounded-3xl p-8" data-cursor="hover">
      <div className="relative h-32 w-32">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(142,214,255,0.12)" strokeWidth="6" />
          <circle
            ref={circleRef}
            cx="60"
            cy="60"
            r={R}
            fill="none"
            stroke="url(#ringGrad)"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#00E5FF" />
              <stop offset="1" stopColor="#4A90E2" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="font-display text-3xl text-glow-ice">
            <span ref={numRef}>0</span>
            <span className="text-lg text-glow-cyan">%</span>
          </p>
        </div>
      </div>
      <p className="mt-5 text-center font-display text-lg text-white">{label}</p>
      <p className="mt-2 text-center text-sm font-light text-slate-400">{sub}</p>
    </div>
  );
}

const initiatives = [
  {
    icon: Recycle,
    title: "Ghost Net Recovery",
    body: "Every expedition carries recovery hooks. In three years our guests have helped lift 84 tonnes of abandoned fishing gear off the reef.",
  },
  {
    icon: FlaskConical,
    title: "Open Science Seats",
    body: "One seat on every dive is donated to a marine researcher. Their instruments ride free; their findings are published openly.",
  },
  {
    icon: Sprout,
    title: "Coral Restoration",
    body: "Our shallow expeditions fund and plant nursery-grown coral. 210,000 fragments outplanted, with survival monitored on every return visit.",
  },
  {
    icon: Fish,
    title: "Quiet Ship Protocol",
    body: "Electric propulsion and acoustic dampening keep the Erebus quieter than a rain shower — the deep should not hear us coming.",
  },
];

export default function Sustainability() {
  return (
    <PageWrapper>
      <Seo
        title="Sustainability"
        description="Exploration that leaves only light. Ghost-net recovery, open science seats, coral restoration and a quiet-ship protocol on every ABYSS voyage."
        path="/sustainability"
      />
      <AmbientBackground gradient="bg-gradient-to-b from-abyss-800 via-abyss-900 to-abyss-950" />

      <PageHeader
        kicker="Our covenant"
        title="Explore everything. Disturb nothing."
        intro="The deep has survived four billion years without us. Our promise is that every descent leaves the ocean measurably better than we found it."
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-32">
        <div className="grid gap-6 sm:grid-cols-3">
          <Ring pct={100} label="Carbon-neutral fleet" sub="Shore-charged batteries, offset logistics — audited yearly." />
          <Ring pct={12} label="Revenue to research" sub="Twelve percent of every fare funds independent ocean science." />
          <Ring pct={92} label="Coral fragment survival" sub="Outplant survival rate across our restoration sites." />
        </div>

        <div className="mt-24 grid gap-6 md:grid-cols-2">
          {initiatives.map((it, i) => (
            <motion.article
              key={it.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.9, delay: (i % 2) * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="glass-deep card-glow group rounded-3xl p-8 transition-transform duration-700 hover:-translate-y-1.5 md:p-10"
              data-cursor="hover"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-glow-cyan/30 bg-glow-cyan/10 text-glow-cyan transition-all duration-500 group-hover:shadow-[0_0_25px_rgba(0,229,255,0.35)]">
                <it.icon size={20} strokeWidth={1.5} />
              </div>
              <h2 className="mt-6 font-display text-2xl font-medium text-white">{it.title}</h2>
              <p className="mt-4 font-light leading-relaxed text-slate-300">{it.body}</p>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="glass mt-24 flex flex-col items-center gap-6 rounded-3xl p-10 text-center md:p-14"
        >
          <p className="kicker">The 1,000-year view</p>
          <p className="max-w-2xl font-display text-2xl font-light leading-relaxed text-glow-mist md:text-3xl">
            "We are not selling the deep. We are introducing you to it —
            so that a thousand years from now, it is still there to meet."
          </p>
          <p className="font-mono text-[10px] uppercase tracking-widest2 text-slate-500">
            — Dr. Mara Ellingsen, Founder
          </p>
          <ButtonLink to="/expeditions" variant="ghost">
            Travel with purpose
          </ButtonLink>
        </motion.div>
      </div>

      <div className="relative z-10">
        <Footer />
      </div>
    </PageWrapper>
  );
}
