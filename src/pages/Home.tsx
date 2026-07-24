import { useEffect, useRef, type ReactNode } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown, ChevronDown } from "lucide-react";
import { Seo, organizationJsonLd } from "@/components/Seo";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Footer } from "@/components/layout/Footer";
import { OceanCanvas } from "@/components/three/OceanCanvas";
import { DepthHUD } from "@/components/hud/DepthHUD";
import { CreatureArt } from "@/components/creatures/CreatureArt";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useTextReveal } from "@/hooks/useTextReveal";
import { usePrefersReducedMotion } from "@/hooks/useReducedMotion";
import { scrollToTarget } from "@/hooks/useSmoothScroll";
import { ScenicOceanHero } from "@/components/home/ScenicOceanHero";
import { oceanState, progressToDepth } from "@/lib/oceanState";

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 44 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 1, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SceneShell({
  id,
  depth,
  children,
  className = "",
}: {
  id?: string;
  depth: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`relative flex min-h-[120vh] items-center ${className}`}>
      <div className="mx-auto w-full max-w-6xl px-6">{children}</div>
      <div
        aria-hidden="true"
        className="absolute right-8 top-1/2 hidden -translate-y-1/2 rotate-90 font-mono text-[10px] tracking-widest2 text-glow-mist/30 lg:block"
      >
        {depth}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 1 — Above the surface                                         */
/* ------------------------------------------------------------------ */

function HeroSurface() {
  const heroRef = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.to(".hero-title-block", {
        yPercent: -30,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "85% top",
          scrub: true,
        },
      });
      gsap.to(".hero-sun", {
        yPercent: 40,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
      gsap.to(".hero-cloud", {
        yPercent: 22,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, heroRef);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={heroRef}
      aria-label="Above the surface"
      className="relative flex h-[112vh] flex-col items-center justify-center overflow-hidden"
    >
      {/* 3D Scenic Ocean Horizon Background */}
      <ScenicOceanHero />

      {/* Title */}
      <div className="hero-title-block relative z-10 -mt-[8vh] flex flex-col items-center px-6 text-center drop-shadow-2xl">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="font-mono text-[11px] uppercase tracking-widest2 text-glow-ice font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
        >
          Deep Sea Exploration Co.
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 60, letterSpacing: "0.5em" }}
          animate={{ opacity: 1, y: 0, letterSpacing: "0.18em" }}
          transition={{ delay: 0.55, duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-4 font-display text-[clamp(4.5rem,17vw,13rem)] font-bold leading-[0.95] text-white tracking-wider drop-shadow-[0_10px_25px_rgba(0,0,0,0.6)]"
        >
          ABYSS
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 max-w-md text-balance font-body text-lg font-medium text-slate-100 md:text-xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]"
        >
          Explore the last unknown world.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.35, duration: 1 }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        >
          <Button
            size="lg"
            onClick={() => scrollToTarget("#dive")}
            aria-label="Begin the expedition — dive below the surface"
          >
            Begin Expedition
            <ArrowDown size={16} strokeWidth={1.5} className="transition-transform duration-500 group-hover:translate-y-1" />
          </Button>
          <ButtonLink to="/expeditions" variant="ghost" size="lg" className="border-white/40 text-white hover:text-glow-ice hover:border-glow-cyan/60 bg-abyss-950/40 backdrop-blur-md">
            View Voyages
          </ButtonLink>
        </motion.div>
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        aria-hidden="true"
        className="absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-white/90 font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
      >
        <span className="font-mono text-[9px] uppercase tracking-widest2">Scroll to descend</span>
        <ChevronDown size={16} className="animate-bounce" strokeWidth={1.5} />
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Scenes 2–8                                                          */
/* ------------------------------------------------------------------ */

function SceneDive() {
  const h = useTextReveal<HTMLHeadingElement>();
  return (
    <SceneShell id="dive" depth="0000 — 0050 M">
      <div className="max-w-3xl">
        <Reveal>
          <p className="kicker mb-6">Scene · The Descent Begins</p>
        </Reveal>
        <h2 ref={h} className="font-display text-4xl font-medium leading-tight text-white md:text-6xl heading-glow">
          The surface closes over you, and the world goes blue.
        </h2>
        <Reveal delay={0.2}>
          <p className="mt-8 max-w-xl text-lg font-light leading-relaxed text-slate-300">
            Sunlight follows you down for a while — bent into cathedral rays,
            scattering off a snowfall of drifting plankton. Every meter, the
            noise of the world above grows fainter.
          </p>
        </Reveal>
      </div>
    </SceneShell>
  );
}

function SceneShallows() {
  const h = useTextReveal<HTMLHeadingElement>();
  return (
    <SceneShell depth="0050 — 0200 M">
      <div className="ml-auto max-w-3xl text-right">
        <Reveal>
          <p className="kicker mb-6">Scene · First Companions</p>
        </Reveal>
        <h2 ref={h} className="font-display text-4xl font-medium leading-tight text-white md:text-6xl">
          Silver rivers of fish part around your hull.
        </h2>
        <Reveal delay={0.2}>
          <p className="ml-auto mt-8 max-w-xl text-lg font-light leading-relaxed text-slate-300">
            Schools move as one mind. They will escort you to the edge of the
            light, then turn back — this is as deep as the sun's citizens go.
          </p>
        </Reveal>
        <Reveal delay={0.35}>
          <div className="mt-10 flex flex-wrap justify-end gap-3">
            {["1,200+ species sighted", "26°C water", "40 m visibility"].map((s) => (
              <span key={s} className="glass rounded-full px-5 py-2 font-mono text-[11px] tracking-widest text-glow-mist/80">
                {s}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </SceneShell>
  );
}

function SceneReef() {
  const h = useTextReveal<HTMLHeadingElement>();
  const reefCreatures = ["sea-turtle", "octopus", "coral"] as const;
  const names = { "sea-turtle": "Green Sea Turtle", octopus: "Giant Octopus", coral: "Living Coral" };
  return (
    <SceneShell depth="0200 M · CORAL KINGDOM" className="min-h-[140vh]">
      {/* Warm reef color wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 20% 70%, rgba(255,110,160,0.07), transparent 60%), radial-gradient(ellipse 45% 35% at 80% 55%, rgba(0,229,255,0.06), transparent 60%)",
        }}
      />
      <div className="relative">
        <Reveal>
          <p className="kicker mb-6">Scene · The Coral Kingdom</p>
        </Reveal>
        <h2 ref={h} className="max-w-3xl font-display text-4xl font-medium leading-tight text-white md:text-6xl">
          A city built by animals, farmed by light.
        </h2>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {reefCreatures.map((id, i) => (
            <Reveal key={id} delay={i * 0.12}>
              <div data-cursor="hover" className="card-glow glass group rounded-2xl p-8 transition-transform duration-700 hover:-translate-y-2">
                <CreatureArt id={id} className="mx-auto h-36 w-full transition-transform duration-700 group-hover:scale-105" />
                <p className="mt-6 text-center font-display text-lg text-glow-mist">{names[id]}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.3}>
          <div className="mt-12 flex justify-center">
            <ButtonLink to="/marine-life" variant="ghost">
              Meet the locals
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </SceneShell>
  );
}

function SceneSubmarine() {
  const h = useTextReveal<HTMLHeadingElement>();
  const specs = [
    ["Crush rating", "6,000 m"],
    ["Pressure hull", "Grade-5 titanium"],
    ["Guests", "8 + 2 crew"],
    ["Life support", "96 h reserve"],
  ];
  return (
    <SceneShell depth="0500 M · TWILIGHT">
      <div className="grid items-center gap-14 lg:grid-cols-2">
        <div>
          <Reveal>
            <p className="kicker mb-6">Scene · Your Vessel</p>
          </Reveal>
          <h2 ref={h} className="font-display text-4xl font-medium leading-tight text-white md:text-6xl">
            The DSV Erebus switches on her lights.
          </h2>
          <Reveal delay={0.2}>
            <p className="mt-8 max-w-xl text-lg font-light leading-relaxed text-slate-300">
              From here on, she is your sun. Twin searchlights carve a corridor
              through water that has never known daylight.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-10">
              <ButtonLink to="/technology" variant="ghost">
                Inspect the vessel
              </ButtonLink>
            </div>
          </Reveal>
        </div>
        <Reveal delay={0.15}>
          <div className="glass-deep card-glow rounded-2xl p-8 md:p-10" data-cursor="hover">
            <p className="font-mono text-[10px] uppercase tracking-widest2 text-glow-mist/60">
              Vessel datasheet
            </p>
            <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-7">
              {specs.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs uppercase tracking-[0.16em] text-slate-400">{k}</dt>
                  <dd className="mt-1 font-display text-xl text-glow-ice">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
      </div>
    </SceneShell>
  );
}

function SceneBioluminescence() {
  const h = useTextReveal<HTMLHeadingElement>();
  return (
    <SceneShell depth="1200 M · MIDNIGHT">
      {/* drifting glow motes */}
      {[...Array(9)].map((_, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-glow-cyan/70 blur-[1px] animate-pulse-soft"
          style={{
            left: `${8 + ((i * 37) % 84)}%`,
            top: `${12 + ((i * 53) % 70)}%`,
            animationDelay: `${i * 0.7}s`,
            boxShadow: "0 0 14px rgba(0,229,255,0.8)",
          }}
        />
      ))}
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <p className="kicker mb-6">Scene · Living Light</p>
        </Reveal>
        <h2 ref={h} className="font-display text-4xl font-medium leading-tight text-glow-ice md:text-6xl heading-glow">
          We turn off the lights. The ocean answers with its own.
        </h2>
        <Reveal delay={0.2}>
          <p className="mx-auto mt-8 max-w-xl text-lg font-light leading-relaxed text-slate-300">
            Jellyfish pulse past like slow lightning. Every movement of the
            hull stirs galaxies — plankton flaring blue in your wake.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <div className="mt-10 flex justify-center">
            <ButtonLink to="/expeditions" variant="glow">
              Book the Night Dive
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </SceneShell>
  );
}

function SceneDeep() {
  const h = useTextReveal<HTMLHeadingElement>();

  return (
    <SceneShell depth="2500 M · ABYSSAL" className="min-h-[150vh] overflow-hidden">
      <div className="relative max-w-3xl">
        <Reveal>
          <p className="kicker mb-6">Scene · The Deep</p>
        </Reveal>
        <h2 ref={h} className="font-display text-4xl font-medium leading-tight text-white md:text-6xl">
          Down here, history keeps its secrets in the cold.
        </h2>
        <Reveal delay={0.2}>
          <p className="mt-8 max-w-xl text-lg font-light leading-relaxed text-slate-400">
            Shipwrecks rest where they fell a century ago, perfectly kept by
            darkness and pressure. A whale passes overhead like weather —
            felt before it is seen.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <div className="mt-10">
            <ButtonLink to="/expeditions" variant="ghost">
              The Titanic Route
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </SceneShell>
  );
}

function SceneFloor() {
  const h = useTextReveal<HTMLHeadingElement>();
  return (
    <SceneShell depth="4000 M · THE FLOOR" className="min-h-[130vh]">
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <p className="kicker mb-6">Scene · Arrival</p>
        </Reveal>
        <h2 ref={h} className="font-display text-5xl font-medium leading-tight text-white md:text-7xl heading-glow">
          You have reached the last address on Earth.
        </h2>
        <Reveal delay={0.2}>
          <p className="mx-auto mt-8 max-w-lg text-lg font-light leading-relaxed text-slate-400">
            Fewer than 700 humans have ever seen this place with their own
            eyes. The next seat belongs to you.
          </p>
        </Reveal>
        <Reveal delay={0.35}>
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <ButtonLink to="/booking" size="lg" variant="glow">
              Book Your Descent
            </ButtonLink>
            <ButtonLink to="/expeditions" size="lg" variant="ghost">
              Compare Expeditions
            </ButtonLink>
          </div>
        </Reveal>
        <Reveal delay={0.5}>
          <p className="mt-14 font-mono text-[10px] uppercase tracking-widest2 text-slate-500">
            Private charters · Research fellowships · Film partnerships
          </p>
        </Reveal>
      </div>
    </SceneShell>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Home() {
  const descentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: descentRef.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        oceanState.progress = self.progress;
        oceanState.depth = progressToDepth(self.progress);
      },
    });
    return () => {
      st.kill();
      oceanState.progress = 0;
      oceanState.depth = 0;
    };
  }, []);

  return (
    <PageWrapper>
      <Seo
        title="Home"
        description="Luxury submarine expeditions into the deep ocean. Descend from sunlit reefs to the hadal trench aboard the DSV Erebus. Explore the last unknown world."
        path="/"
        jsonLd={organizationJsonLd}
      />
      <OceanCanvas />
      <DepthHUD />

      <div ref={descentRef} className="relative z-10">
        <HeroSurface />
        <SceneDive />
        <SceneShallows />
        <SceneReef />
        <SceneSubmarine />
        <SceneBioluminescence />
        <SceneDeep />
        <SceneFloor />
      </div>

      <div className="relative z-10">
        <Footer />
      </div>
    </PageWrapper>
  );
}
