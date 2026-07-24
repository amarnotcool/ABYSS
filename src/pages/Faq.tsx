import { useState } from "react";
import { motion } from "framer-motion";
import { Seo } from "@/components/Seo";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { PageHeader } from "@/components/layout/PageHeader";
import { Footer } from "@/components/layout/Footer";
import { AmbientBackground } from "@/components/effects/AmbientBackground";
import { Accordion } from "@/components/ui/Accordion";
import { ButtonLink } from "@/components/ui/Button";
import { faqs } from "@/data/faqs";
import { cn } from "@/lib/utils";

const categories = ["All", "Expeditions", "Safety", "Booking", "Aboard"] as const;

export default function Faq() {
  const [cat, setCat] = useState<(typeof categories)[number]>("All");
  const visible = faqs.filter((f) => cat === "All" || f.category === cat);

  return (
    <PageWrapper>
      <Seo
        title="FAQ"
        description="Everything surface-dwellers ask before their first descent — safety, pressure, booking windows and life aboard the DSV Erebus."
        path="/faq"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />
      <AmbientBackground />

      <PageHeader
        kicker="Questions from the surface"
        title="Asked before every first descent."
      />

      <div className="relative z-10 mx-auto max-w-4xl px-6 pb-32">
        <div className="mb-10 flex flex-wrap gap-3" role="tablist" aria-label="FAQ categories">
          {categories.map((c) => (
            <button
              key={c}
              role="tab"
              aria-selected={cat === c}
              data-cursor="hover"
              onClick={() => setCat(c)}
              className={cn(
                "rounded-full border px-5 py-2 font-mono text-[11px] uppercase tracking-widest transition-all duration-500",
                cat === c
                  ? "border-glow-cyan/60 bg-glow-cyan/10 text-glow-ice shadow-[0_0_20px_rgba(0,229,255,0.15)]"
                  : "border-slate-400/20 text-slate-400 hover:border-glow-mist/40 hover:text-slate-200"
              )}
            >
              {c}
            </button>
          ))}
        </div>

        <motion.div
          key={cat}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <Accordion items={visible} />
        </motion.div>

        <div className="mt-20 flex flex-col items-center gap-5 text-center">
          <p className="text-slate-400">Still holding a question under pressure?</p>
          <ButtonLink to="/contact" variant="ghost">
            Ask the expedition desk
          </ButtonLink>
        </div>
      </div>

      <div className="relative z-10">
        <Footer />
      </div>
    </PageWrapper>
  );
}
