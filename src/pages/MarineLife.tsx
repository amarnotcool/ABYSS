import { useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { X } from "lucide-react";
import { Seo } from "@/components/Seo";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { PageHeader } from "@/components/layout/PageHeader";
import { Footer } from "@/components/layout/Footer";
import { AmbientBackground } from "@/components/effects/AmbientBackground";
import { CreatureArt } from "@/components/creatures/CreatureArt";
import { CreatureInspector3D } from "@/components/creatures/CreatureInspector3D";
import { creatures, type Creature } from "@/data/marineLife";

function CreatureCard({
  creature,
  onOpen,
  index,
}: {
  creature: Creature;
  onOpen: () => void;
  index: number;
}) {
  return (
    <motion.button
      layoutId={`card-${creature.id}`}
      onClick={onOpen}
      data-cursor="hover"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.8, delay: (index % 3) * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="card-glow glass group relative w-full overflow-hidden rounded-3xl p-8 text-left transition-all duration-700 hover:-translate-y-2 hover:shadow-[0_25px_70px_rgba(0,229,255,0.1)]"
      aria-label={`Open ${creature.name} log entry`}
    >
      <div
        aria-hidden="true"
        className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-glow-cyan/8 blur-3xl transition-transform duration-1000 group-hover:scale-150"
      />
      <p className="font-mono text-[10px] uppercase tracking-widest2 text-glow-mist/50">
        {creature.zone}
      </p>
      <CreatureArt
        id={creature.id}
        className="mx-auto mt-4 h-40 w-full transition-transform duration-700 group-hover:scale-105"
      />
      <h2 className="mt-4 font-display text-2xl font-medium text-white">
        {creature.name}
      </h2>
      <p className="mt-1 text-sm italic text-slate-400">{creature.latin}</p>
      <p className="mt-4 line-clamp-2 text-sm font-light leading-relaxed text-slate-300">
        {creature.fact}
      </p>
      <p className="mt-5 font-mono text-[10px] uppercase tracking-widest text-glow-cyan/70">
        Open log entry →
      </p>
    </motion.button>
  );
}

function CreatureModal({
  creature,
  onClose,
}: {
  creature: Creature;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center bg-abyss-950/80 p-4 backdrop-blur-md md:p-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${creature.name} log entry`}
    >
      <motion.div
        layoutId={`card-${creature.id}`}
        onClick={(e) => e.stopPropagation()}
        className="glass-deep card-glow relative max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-3xl p-8 md:p-12"
      >
        <button
          onClick={onClose}
          data-cursor="hover"
          aria-label="Close log entry"
          className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-slate-400/25 text-slate-300 transition-colors hover:border-glow-cyan/60 hover:text-glow-ice"
        >
          <X size={16} strokeWidth={1.5} />
        </button>

        <p className="font-mono text-[10px] uppercase tracking-widest2 text-glow-mist/50">
          Expedition log · {creature.zone}
        </p>
        <CreatureInspector3D
          creatureId={creature.id}
          fallbackSvg={<CreatureArt id={creature.id} className="mx-auto mt-4 h-52 w-full" />}
        />
        <h2 className="mt-2 font-display text-4xl font-medium text-white">
          {creature.name}
        </h2>
        <p className="mt-1 italic text-slate-400">{creature.latin}</p>

        <dl className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-3">
          {[
            ["Depth range", creature.depthRange],
            ["Size", creature.size],
            ["Zone", creature.zone],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-[11px] uppercase tracking-[0.16em] text-slate-500">{k}</dt>
              <dd className="mt-1 font-mono text-sm text-glow-ice">{v}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-8 font-light leading-relaxed text-slate-300">
          {creature.description}
        </p>
        <p className="mt-6 rounded-2xl border border-glow-cyan/20 bg-glow-cyan/5 p-5 text-sm leading-relaxed text-glow-mist">
          <span className="font-mono text-[10px] uppercase tracking-widest2 text-glow-cyan/80">
            Field note ·{" "}
          </span>
          {creature.fact}
        </p>
      </motion.div>
    </motion.div>
  );
}

export default function MarineLife() {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = creatures.find((c) => c.id === openId) ?? null;

  return (
    <PageWrapper>
      <Seo
        title="Marine Life"
        description="An interactive field guide to the citizens of the deep — from green sea turtles in the sunlight zone to anglerfish in the abyss."
        path="/marine-life"
      />
      <AmbientBackground />

      <PageHeader
        kicker="Field guide"
        title="The citizens of the deep."
        intro="Nine species you are most likely to meet through the viewport, logged by our onboard naturalists. Open a card to read its expedition entry."
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-32">
        <LayoutGroup>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {creatures.map((c, i) => (
              <CreatureCard
                key={c.id}
                creature={c}
                index={i}
                onOpen={() => setOpenId(c.id)}
              />
            ))}
          </div>
          <AnimatePresence>
            {open && <CreatureModal creature={open} onClose={() => setOpenId(null)} />}
          </AnimatePresence>
        </LayoutGroup>
      </div>

      <div className="relative z-10">
        <Footer />
      </div>
    </PageWrapper>
  );
}
