import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Mail, Radio } from "lucide-react";
import { Seo } from "@/components/Seo";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { PageHeader } from "@/components/layout/PageHeader";
import { Footer } from "@/components/layout/Footer";
import { AmbientBackground } from "@/components/effects/AmbientBackground";
import { Field, TextArea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export default function Contact() {
  const [sent, setSent] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <PageWrapper>
      <Seo
        title="Contact"
        description="Reach the ABYSS expedition desk — voyage planning, private charters, research partnerships and press."
        path="/contact"
      />
      <AmbientBackground />

      <PageHeader
        kicker="Expedition desk"
        title="Send a signal to the surface."
        intro="Voyage questions, private charters, research berths, film partnerships — a human pilot answers every message within one tide."
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-32">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="glass-deep card-glow rounded-3xl p-8 md:p-10"
          >
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex min-h-[380px] flex-col items-center justify-center text-center"
                >
                  <div className="relative h-20 w-20">
                    <div className="absolute inset-0 animate-sonar rounded-full border border-glow-cyan/70" />
                    <div className="absolute inset-0 animate-sonar rounded-full border border-glow-cyan/40" style={{ animationDelay: "0.8s" }} />
                    <div className="absolute inset-[34px] rounded-full bg-glow-cyan shadow-[0_0_25px_rgba(0,229,255,0.9)]" />
                  </div>
                  <h2 className="mt-8 font-display text-3xl text-white">Signal received.</h2>
                  <p className="mt-3 max-w-sm text-slate-400">
                    Your message is rising to the surface. Expect our reply
                    within 24 hours — sooner if the sea is calm.
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  exit={{ opacity: 0, y: -12 }}
                  onSubmit={onSubmit}
                  className="space-y-5"
                  aria-label="Contact form"
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Your name" name="name" autoComplete="name" required />
                    <Field label="Email" name="email" type="email" autoComplete="email" required />
                  </div>
                  <Field label="Subject" name="subject" />
                  <TextArea label="Your message" name="message" required />
                  <div className="flex items-center justify-between gap-6 pt-2">
                    <p className="max-w-[220px] font-mono text-[9px] uppercase leading-relaxed tracking-widest text-slate-500">
                      Encrypted in transit. Never sold, never surfaced.
                    </p>
                    <Button type="submit" variant="glow">
                      Transmit
                      <Radio size={15} strokeWidth={1.5} />
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Coordinates */}
          <motion.aside
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            <div className="glass rounded-3xl p-8">
              <h2 className="font-display text-xl text-white">Base of operations</h2>
              <ul className="mt-6 space-y-5 text-sm">
                <li className="flex gap-4">
                  <MapPin size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-glow-cyan" />
                  <span className="leading-relaxed text-slate-300">
                    Pier 9, Halcyon Harbour
                    <br />
                    Ponta Delgada, Azores
                  </span>
                </li>
                <li className="flex gap-4">
                  <Mail size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-glow-cyan" />
                  <span className="text-slate-300">expeditions@abyss-expeditions.com</span>
                </li>
                <li className="flex gap-4">
                  <Radio size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-glow-cyan" />
                  <span className="text-slate-300">VHF Channel 16 · call sign EREBUS</span>
                </li>
              </ul>
            </div>

            {/* Sonar chart */}
            <div className="glass relative overflow-hidden rounded-3xl p-8">
              <p className="kicker">Current position</p>
              <div className="relative mx-auto mt-6 h-52 w-52">
                <div className="absolute inset-0 rounded-full border border-glow-mist/20" />
                <div className="absolute inset-8 rounded-full border border-glow-mist/15" />
                <div className="absolute inset-16 rounded-full border border-glow-mist/10" />
                <div className="absolute inset-x-0 top-1/2 h-px bg-glow-mist/10" />
                <div className="absolute inset-y-0 left-1/2 w-px bg-glow-mist/10" />
                <div className="absolute inset-0 animate-sonar rounded-full border border-glow-cyan/50" />
                <svg viewBox="0 0 100 100" className="sonar-sweep absolute inset-0">
                  <defs>
                    <linearGradient id="contactSweep" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0" stopColor="rgba(0,229,255,0.4)" />
                      <stop offset="1" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                  <path d="M50 50 L50 2 A48 48 0 0 1 83 17 Z" fill="url(#contactSweep)" />
                </svg>
                <div className="absolute left-[58%] top-[38%] h-1.5 w-1.5 animate-pulse-soft rounded-full bg-glow-ice shadow-[0_0_10px_rgba(125,249,255,1)]" />
                <p className="absolute left-[62%] top-[30%] font-mono text-[8px] tracking-widest text-glow-mist/70">
                  EREBUS
                </p>
              </div>
              <p className="mt-6 text-center font-mono text-[10px] tracking-widest2 text-slate-500">
                37.7412° N · 25.6756° W
              </p>
            </div>
          </motion.aside>
        </div>
      </div>

      <div className="relative z-10">
        <Footer />
      </div>
    </PageWrapper>
  );
}
