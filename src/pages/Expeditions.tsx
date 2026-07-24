import { motion } from "framer-motion";
import { ArrowRight, Clock, Waves } from "lucide-react";
import { Seo } from "@/components/Seo";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { PageHeader } from "@/components/layout/PageHeader";
import { Footer } from "@/components/layout/Footer";
import { AmbientBackground } from "@/components/effects/AmbientBackground";
import { ButtonLink } from "@/components/ui/Button";
import { useTilt } from "@/hooks/useTilt";
import { expeditions, difficultyColor, type Expedition } from "@/data/expeditions";
import { cn, formatDepth } from "@/lib/utils";

function ExpeditionCard({ exp, index }: { exp: Expedition; index: number }) {
  const tilt = useTilt<HTMLDivElement>(7);

  return (
    <motion.article
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.9, delay: (index % 2) * 0.12, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        ref={tilt}
        data-cursor="hover"
        className="tilt-card card-glow glass-deep group relative overflow-hidden rounded-3xl p-8 transition-shadow duration-700 hover:shadow-[0_25px_80px_rgba(0,229,255,0.12)] md:p-10"
      >
        {/* Animated depth-water backdrop */}
        <div
          aria-hidden="true"
          className={cn(
            "absolute inset-0 -z-10 bg-gradient-to-br opacity-60 transition-opacity duration-700 group-hover:opacity-90",
            exp.hue
          )}
        />
        <div
          aria-hidden="true"
          className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-glow-cyan/10 blur-3xl transition-transform duration-1000 group-hover:scale-125"
        />

        <div className="tilt-inner">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest2 text-glow-mist/60">
                Expedition {String(index + 1).padStart(2, "0")}
              </p>
              <h2 className="mt-3 font-display text-3xl font-medium text-white md:text-4xl">
                {exp.name}
              </h2>
              <p className="mt-2 text-sm italic text-glow-mist/70">{exp.tagline}</p>
            </div>
            <span
              className={cn(
                "shrink-0 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-widest",
                difficultyColor[exp.difficulty]
              )}
            >
              {exp.difficulty}
            </span>
          </div>

          <p className="mt-6 max-w-xl font-light leading-relaxed text-slate-300">
            {exp.description}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
            <span className="flex items-center gap-2 font-mono text-xs tracking-widest text-glow-ice">
              <Waves size={14} strokeWidth={1.5} /> -{formatDepth(exp.depth)}
            </span>
            <span className="flex items-center gap-2 font-mono text-xs tracking-widest text-slate-300">
              <Clock size={14} strokeWidth={1.5} /> {exp.duration}
            </span>
            <span className="font-mono text-xs tracking-widest text-slate-300">
              from ${exp.price.toLocaleString()}
            </span>
          </div>

          <ul className="mt-6 flex flex-wrap gap-2">
            {exp.highlights.map((hl) => (
              <li
                key={hl}
                className="rounded-full border border-glow-mist/15 bg-abyss-900/40 px-4 py-1.5 text-xs text-slate-300"
              >
                {hl}
              </li>
            ))}
          </ul>

          <div className="mt-9 flex items-center justify-between">
            <ButtonLink to={`/booking?expedition=${exp.id}`} variant="ghost" size="sm">
              Reserve this dive
              <ArrowRight size={14} strokeWidth={1.5} className="transition-transform duration-500 group-hover:translate-x-1" />
            </ButtonLink>
            <span className="font-mono text-[10px] uppercase tracking-widest2 text-slate-500">
              {exp.depth >= 1000 ? "Deep certification incl." : "No experience needed"}
            </span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default function Expeditions() {
  return (
    <PageWrapper>
      <Seo
        title="Expeditions"
        description="Six signature descents — from the sunlit Coral Kingdom to the 4,000 m Ocean Trench Expedition. Compare depth, duration and difficulty, and reserve your seat."
        path="/expeditions"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "ABYSS Expeditions",
          itemListElement: expeditions.map((e, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: e.name,
          })),
        }}
      />
      <AmbientBackground />

      <PageHeader
        kicker="Voyage catalogue"
        title="Choose how deep you're willing to go."
        intro="Every descent is a private story with its own cast, pressure and light. Start gentle in the Coral Kingdom — or go straight for the trench."
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-32">
        <div className="grid gap-8 lg:grid-cols-2">
          {expeditions.map((exp, i) => (
            <ExpeditionCard key={exp.id} exp={exp} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="mt-20 flex flex-col items-center gap-6 text-center"
        >
          <p className="max-w-xl text-slate-400">
            Undecided? Our expedition planners will match a voyage to your
            appetite for depth, darkness and wonder.
          </p>
          <ButtonLink to="/contact" variant="glow">
            Talk to a planner
          </ButtonLink>
        </motion.div>
      </div>

      <div className="relative z-10">
        <Footer />
      </div>
    </PageWrapper>
  );
}
