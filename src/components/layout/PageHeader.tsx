import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { useTextReveal } from "@/hooks/useTextReveal";

interface Props {
  kicker: string;
  title: string;
  intro?: string;
  children?: ReactNode;
}

export function PageHeader({ kicker, title, intro, children }: Props) {
  const h = useTextReveal<HTMLHeadingElement>();
  return (
    <header className="relative z-10 mx-auto max-w-6xl px-6 pb-16 pt-40 md:pb-24 md:pt-48">
      <motion.p
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.9 }}
        className="kicker mb-6"
      >
        {kicker}
      </motion.p>
      <h1
        ref={h}
        className="max-w-4xl font-display text-5xl font-medium leading-[1.05] text-white md:text-7xl heading-glow"
      >
        {title}
      </h1>
      {intro && (
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 1 }}
          className="mt-8 max-w-2xl text-lg font-light leading-relaxed text-slate-300"
        >
          {intro}
        </motion.p>
      )}
      {children}
    </header>
  );
}
