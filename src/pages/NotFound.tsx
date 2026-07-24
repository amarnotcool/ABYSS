import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { Seo } from "@/components/Seo";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { CreatureArt } from "@/components/creatures/CreatureArt";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <PageWrapper className="bg-abyss-950">
      <Seo
        title="Lost in the Abyss"
        description="Depth unknown. This page drifted below our charts — return to the surface."
        path="/404"
      />

      {/* faint pressure lines */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 110%, rgba(10,57,129,0.25), transparent 60%)",
        }}
      />
      {[...Array(7)].map((_, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="pointer-events-none fixed h-1 w-1 rounded-full bg-glow-cyan/60 animate-pulse-soft"
          style={{
            left: `${12 + i * 13}%`,
            top: `${20 + ((i * 29) % 55)}%`,
            animationDelay: `${i * 0.8}s`,
            boxShadow: "0 0 10px rgba(0,229,255,0.7)",
          }}
        />
      ))}

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="w-72 md:w-96"
        >
          <CreatureArt id="anglerfish" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="kicker mt-6"
        >
          Depth: unknown · Signal: lost
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-4 font-display text-6xl font-medium text-white md:text-8xl heading-glow"
        >
          4<span className="text-glow-cyan">0</span>4
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="mt-5 max-w-md text-balance font-light leading-relaxed text-slate-400"
        >
          You have drifted below our charts. The only light down here belongs
          to something that is very pleased to see you.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-10"
        >
          <ButtonLink to="/" variant="glow" size="lg">
            <ArrowUp size={16} strokeWidth={1.5} />
            Return to surface
          </ButtonLink>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
