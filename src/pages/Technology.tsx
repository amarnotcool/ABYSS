import { useEffect, useRef, useState, type MutableRefObject, type ReactNode, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import type { Group } from "three";
import { Asset, AssetBoundary } from "@/components/three/assets/Asset";
import { SubUpgradeLab } from "@/components/tech/SubUpgradeLab";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Seo } from "@/components/Seo";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { PageHeader } from "@/components/layout/PageHeader";
import { Footer } from "@/components/layout/Footer";
import { AmbientBackground } from "@/components/effects/AmbientBackground";
import { CreatureArt } from "@/components/creatures/CreatureArt";
import { usePrefersReducedMotion } from "@/hooks/useReducedMotion";
import { useTextReveal } from "@/hooks/useTextReveal";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------------------------------------------ */
/* Slow turntable for the 3D viewer                                    */
/* ------------------------------------------------------------------ */

function Turntable({ children }: { children: ReactNode }) {
  const ref = useRef<Group>(null!);
  useFrame((_state: any, delta: number) => {
    ref.current.rotation.y += delta * 0.25;
  });
  return (
    <group rotation={[0.06, -0.5, 0]}>
      <group ref={ref}>{children}</group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Animated counter                                                    */
/* ------------------------------------------------------------------ */

function StatCounter({
  value,
  suffix,
  label,
}: {
  value: number;
  suffix: string;
  label: string;
}) {
  const numRef = useRef<HTMLSpanElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = numRef.current!;
    if (reduced) {
      el.textContent = value.toLocaleString();
      return;
    }
    const obj = { v: 0 };
    const tween = gsap.to(obj, {
      v: value,
      duration: 2,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%" },
      onUpdate: () => {
        el.textContent = Math.round(obj.v).toLocaleString();
      },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [value, reduced]);

  return (
    <div className="glass card-glow rounded-2xl p-7 text-center" data-cursor="hover">
      <p className="font-display text-4xl font-medium text-glow-ice md:text-5xl">
        <span ref={numRef}>0</span>
        <span className="text-glow-cyan">{suffix}</span>
      </p>
      <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Blueprint that draws itself on scroll                               */
/* ------------------------------------------------------------------ */

function Blueprint() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      const paths = wrapRef.current!.querySelectorAll<SVGPathElement>(".bp-draw");
      paths.forEach((p) => {
        const len = p.getTotalLength();
        p.style.strokeDasharray = `${len}`;
        p.style.strokeDashoffset = `${len}`;
      });
      gsap.to(paths, {
        strokeDashoffset: 0,
        ease: "none",
        stagger: 0.08,
        scrollTrigger: {
          trigger: wrapRef.current,
          start: "top 75%",
          end: "center center",
          scrub: 1,
        },
      });
    }, wrapRef);
    return () => ctx.revert();
  }, [reduced]);

  const bp = {
    fill: "none",
    stroke: "#7DF9FF",
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
  };

  return (
    <div
      ref={wrapRef}
      className="relative overflow-hidden rounded-3xl border border-glow-mist/15 p-6 md:p-10"
      style={{
        background:
          "linear-gradient(rgba(5,38,89,0.35), rgba(2,16,36,0.6)), repeating-linear-gradient(0deg, rgba(125,249,255,0.05) 0 1px, transparent 1px 34px), repeating-linear-gradient(90deg, rgba(125,249,255,0.05) 0 1px, transparent 1px 34px)",
      }}
    >
      <p className="font-mono text-[10px] uppercase tracking-widest2 text-glow-mist/60">
        Fig. 01 — DSV Erebus · profile
      </p>
      <svg viewBox="0 0 800 300" className="mt-4 w-full" role="img" aria-label="Blueprint line drawing of the DSV Erebus submarine">
        {/* Hull */}
        <path className="bp-draw" d="M160 150 C160 108 220 88 400 88 C560 88 640 112 660 150 C640 188 560 212 400 212 C220 212 160 192 160 150 Z" {...bp} />
        {/* Dome */}
        <path className="bp-draw" d="M660 150 C685 132 700 132 712 150 C700 168 685 168 660 150 Z" {...bp} />
        {/* Sail */}
        <path className="bp-draw" d="M360 88 L368 52 L432 52 L440 88" {...bp} />
        <path className="bp-draw" d="M398 52 L398 30" {...bp} />
        {/* Fins */}
        <path className="bp-draw" d="M180 122 L128 96 L142 150 L128 204 L180 178" {...bp} />
        {/* Propeller */}
        <path className="bp-draw" d="M150 150 L110 150 M110 150 C96 128 96 172 110 150" {...bp} />
        <path className="bp-draw" d="M110 128 C120 140 120 160 110 172 M110 128 C100 140 100 160 110 172" {...bp} />
        {/* Portholes */}
        <circle className="bp-draw" cx="330" cy="130" r="10" {...bp} />
        <circle className="bp-draw" cx="400" cy="126" r="10" {...bp} />
        <circle className="bp-draw" cx="470" cy="128" r="10" {...bp} />
        {/* Skids */}
        <path className="bp-draw" d="M280 212 L280 236 L520 236 L520 212" {...bp} />
        {/* Searchlight */}
        <path className="bp-draw" d="M700 162 L788 210 M700 150 L792 178" {...bp} strokeWidth={0.9} />
        {/* Dimension lines */}
        <path className="bp-draw" d="M160 262 L712 262 M160 254 L160 270 M712 254 L712 270" {...bp} strokeWidth={0.8} />
        <text x="420" y="284" textAnchor="middle" className="fill-glow-mist/60" style={{ font: "10px 'JetBrains Mono', monospace", letterSpacing: "0.2em" }}>
          14.2 M OVERALL
        </text>
        <text x="60" y="150" className="fill-glow-mist/60" style={{ font: "10px 'JetBrains Mono', monospace", letterSpacing: "0.15em" }}>
          PROP.
        </text>
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Interactive 3D viewer — GLB submarine with an X-ray hull scan       */
/* ------------------------------------------------------------------ */

function ErebusShowcase({ xrayRef }: { xrayRef: MutableRefObject<number> }) {
  const solidRef = useRef<Group>(null!);
  const xrayGroupRef = useRef<Group>(null!);
  const mats = useRef<{ solid: THREE.Material[]; xray: THREE.Material[] } | null>(null);

  useFrame(() => {
    if (!solidRef.current || !xrayGroupRef.current) return;
    if (!mats.current) {
      const collect = (g: Group) => {
        const out: THREE.Material[] = [];
        g.traverse((o) => {
          const m = (o as THREE.Mesh).material as THREE.Material | undefined;
          if ((o as THREE.Mesh).isMesh && m) {
            m.transparent = true;
            out.push(m);
          }
        });
        return out;
      };
      const solid = collect(solidRef.current);
      const xray = collect(xrayGroupRef.current);
      if (solid.length === 0 || xray.length === 0) return; // assets still streaming in
      mats.current = { solid, xray };
    }
    const x = xrayRef.current;
    mats.current.solid.forEach((m) => {
      m.opacity = 1 - x * 0.88;
      (m as THREE.MeshStandardMaterial).depthWrite = x < 0.5;
    });
    mats.current.xray.forEach((m) => (m.opacity = x * 0.85));
    xrayGroupRef.current.scale.setScalar(1 + x * 0.015);
  });

  return (
    <>
      <group ref={solidRef}>
        <Asset name="submarine" size={5.4} tune={{ envMapIntensity: 1.3 }} />
      </group>
      <group ref={xrayGroupRef}>
        <Asset
          name="submarine"
          size={5.4}
          tune={{
            wireframe: true,
            color: "#00E5FF",
            emissive: "#00E5FF",
            emissiveIntensity: 0.8,
            opacity: 0,
          }}
        />
      </group>
    </>
  );
}

function SubViewer() {
  const [xray, setXray] = useState(0);
  const xrayRef = useRef(0);
  const reduced = usePrefersReducedMotion();

  return (
    <div className="glass-deep card-glow relative overflow-hidden rounded-3xl">
      <div className="h-[420px] md:h-[520px]">
        {reduced ? (
          <div className="flex h-full items-center justify-center">
            <Blueprint />
          </div>
        ) : (
          <Canvas
            dpr={[1, 1.6]}
            camera={{ position: [4.8, 1.6, 5.6], fov: 42 }}
            gl={{
              antialias: true,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.15,
            }}
          >
            <Suspense fallback={null}>
              <ambientLight intensity={0.5} color="#4A90E2" />
              <directionalLight position={[5, 6, 3]} intensity={2.8} color="#cfeaff" />
              <directionalLight position={[-6, -3, -4]} intensity={1.2} color="#1F509A" />
              <pointLight position={[-4, 2, 4]} intensity={1.6} color="#00E5FF" />
              <Environment resolution={64} frames={1}>
                <Lightformer intensity={2.4} position={[0, 10, 0]} rotation-x={Math.PI / 2} scale={[24, 24, 1]} color="#cfeaff" />
                <Lightformer intensity={0.8} position={[-9, 2, -7]} scale={[12, 20, 1]} color="#1F509A" />
                <Lightformer intensity={0.6} position={[9, -2, 5]} scale={[10, 16, 1]} color="#0e3f6e" />
              </Environment>
              <Float speed={1.4} rotationIntensity={0.35} floatIntensity={0.7}>
                <Turntable>
                  <AssetBoundary>
                    <ErebusShowcase xrayRef={xrayRef} />
                  </AssetBoundary>
                </Turntable>
              </Float>
            </Suspense>
          </Canvas>
        )}
      </div>
      <div className="border-t border-glow-mist/10 p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-xl text-white">X-ray hull scan</p>
            <p className="mt-1 text-sm text-slate-400">
              Slide from pressure hull to structural scan — the lattice that shrugs off 600 atmospheres.
            </p>
          </div>
          <label className="flex w-full items-center gap-4 md:w-72">
            <span className="sr-only">X-ray scan amount</span>
            <span className="font-mono text-[10px] tracking-widest text-glow-mist/60">HULL</span>
            <input
              type="range"
              min={0}
              max={100}
              value={xray * 100}
              onChange={(e) => {
                const v = Number(e.target.value) / 100;
                setXray(v);
                xrayRef.current = v;
              }}
              data-cursor="hover"
              className="h-1 w-full cursor-pointer appearance-none rounded-full bg-abyss-600 accent-[#00E5FF]"
            />
            <span className="font-mono text-[10px] tracking-widest text-glow-mist/60">X-RAY</span>
          </label>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Searchlight easter-egg section                                      */
/* ------------------------------------------------------------------ */

function SearchlightSection() {
  const secRef = useRef<HTMLDivElement>(null);
  const h = useTextReveal<HTMLHeadingElement>();

  const onMove = (e: React.MouseEvent) => {
    const r = secRef.current!.getBoundingClientRect();
    secRef.current!.style.setProperty("--mx", `${e.clientX - r.left}px`);
    secRef.current!.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <section className="relative z-10 mx-auto max-w-6xl px-6 py-24">
      <h2 ref={h} className="max-w-2xl font-display text-3xl font-medium text-white md:text-5xl">
        Twin 20,000-lumen searchlights. Try one.
      </h2>
      <p className="mt-4 max-w-xl text-slate-400">
        Move your cursor across the dark water below. The deep is never as empty as it looks.
      </p>
      <div
        ref={secRef}
        onMouseMove={onMove}
        data-cursor="hover"
        className="relative mt-10 h-[380px] cursor-none overflow-hidden rounded-3xl border border-glow-mist/10 bg-abyss-950"
        style={{ "--mx": "50%", "--my": "50%" } as React.CSSProperties}
      >
        {/* Hidden world, revealed by the beam */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, #031326, #010812)",
            WebkitMaskImage:
              "radial-gradient(circle 190px at var(--mx) var(--my), black 0%, rgba(0,0,0,0.55) 55%, transparent 78%)",
            maskImage:
              "radial-gradient(circle 190px at var(--mx) var(--my), black 0%, rgba(0,0,0,0.55) 55%, transparent 78%)",
          }}
        >
          <div className="absolute left-[12%] top-[22%] w-56 opacity-90">
            <CreatureArt id="anglerfish" />
            <p className="mt-1 text-center font-mono text-[9px] uppercase tracking-widest2 text-glow-mist/70">
              Specimen · M. johnsonii
            </p>
          </div>
          <div className="absolute right-[14%] top-[16%] w-64 opacity-80">
            <CreatureArt id="jellyfish" />
          </div>
          <div className="absolute bottom-[12%] right-[30%] w-60 opacity-70">
            <CreatureArt id="octopus" />
          </div>
          <p className="absolute bottom-[16%] left-[14%] max-w-[240px] font-mono text-[10px] leading-relaxed tracking-widest text-glow-cyan/80">
            HIDDEN LOG 07 — “THE LIGHT DOES NOT DISTURB THEM. THEY COME TO LOOK AT US.”
          </p>
        </div>
        {/* Beam glow ring */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle 190px at var(--mx) var(--my), rgba(142,214,255,0.1), transparent 70%)",
          }}
        />
        <p className="pointer-events-none absolute inset-x-0 bottom-4 text-center font-mono text-[9px] uppercase tracking-widest2 text-slate-600">
          Searchlight simulation · beam ∅ 380 px
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Technology() {
  const [activeTab, setActiveTab] = useState<"customizer" | "blueprints">("customizer");

  return (
    <PageWrapper>
      <Seo
        title="Technology"
        description="Meet the DSV Erebus — a titanium-sphere deep submergence vessel rated to 6,000 meters, with a 270° acrylic observation dome and 96-hour life support."
        path="/technology"
      />
      <AmbientBackground gradient="bg-gradient-to-b from-abyss-900 via-abyss-900 to-abyss-950" />

      <PageHeader
        kicker="The vessel"
        title="Engineered for the bottom of the world."
        intro="The DSV Erebus is the only privately operated submersible rated for repeated hadal descents — a titanium heart inside a hydrodynamic glass shell."
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-20">
        {/* Hangar Deck Tabs Navigation */}
        <div className="flex justify-center mb-10">
          <div className="flex rounded-full border border-glow-mist/10 bg-abyss-950/70 p-1.5 backdrop-blur-md">
            <button
              onClick={() => setActiveTab("customizer")}
              data-cursor="hover"
              className={cn(
                "rounded-full px-6 py-2.5 font-mono text-[10px] uppercase tracking-widest transition-all duration-300",
                activeTab === "customizer"
                  ? "bg-glow-cyan text-abyss-950 font-bold shadow-[0_0_15px_rgba(0,229,255,0.4)]"
                  : "text-slate-400 hover:text-white"
              )}
            >
              DSV Upgrade Hangar
            </button>
            <button
              onClick={() => setActiveTab("blueprints")}
              data-cursor="hover"
              className={cn(
                "rounded-full px-6 py-2.5 font-mono text-[10px] uppercase tracking-widest transition-all duration-300",
                activeTab === "blueprints"
                  ? "bg-glow-cyan text-abyss-950 font-bold shadow-[0_0_15px_rgba(0,229,255,0.4)]"
                  : "text-slate-400 hover:text-white"
              )}
            >
              Blueprints & Specs
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        {activeTab === "customizer" ? (
          <motion.div
            key="customizer"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <SubUpgradeLab />
          </motion.div>
        ) : (
          <motion.div
            key="blueprints"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-16"
          >
            <SubViewer />

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <StatCounter value={6000} suffix=" m" label="Crush-rated depth" />
              <StatCounter value={96} suffix=" h" label="Life support reserve" />
              <StatCounter value={270} suffix="°" label="Acrylic viewing dome" />
              <StatCounter value={40000} suffix=" lm" label="Combined searchlights" />
            </div>

            <Blueprint />
          </motion.div>
        )}
      </div>

      <SearchlightSection />

      <div className="relative z-10">
        <Footer />
      </div>
    </PageWrapper>
  );
}
