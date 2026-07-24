import { useMemo, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Minus, Plus, Check } from "lucide-react";
import { Seo } from "@/components/Seo";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { PageHeader } from "@/components/layout/PageHeader";
import { Footer } from "@/components/layout/Footer";
import { AmbientBackground } from "@/components/effects/AmbientBackground";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { expeditions } from "@/data/expeditions";
import { faqs } from "@/data/faqs";
import { cn, formatDepth } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Calendar                                                            */
/* ------------------------------------------------------------------ */

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function Calendar({
  selected,
  onSelect,
}: {
  selected: Date | null;
  onSelect: (d: Date) => void;
}) {
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);
  const [view, setView] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const cells = useMemo(() => {
    const first = new Date(view.getFullYear(), view.getMonth(), 1);
    const startPad = (first.getDay() + 6) % 7; // Monday first
    const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    const out: Array<Date | null> = [];
    for (let i = 0; i < startPad; i++) out.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      out.push(new Date(view.getFullYear(), view.getMonth(), d));
    }
    return out;
  }, [view]);

  const isDeparture = (d: Date) =>
    d.getTime() > today.getTime() && (d.getDate() + d.getMonth()) % 3 === 0;

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="font-display text-lg text-white">
          {MONTHS[view.getMonth()]}{" "}
          <span className="text-glow-mist/60">{view.getFullYear()}</span>
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            data-cursor="hover"
            aria-label="Previous month"
            onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-400/20 text-slate-300 transition-colors hover:border-glow-cyan/50 hover:text-glow-ice"
          >
            <ChevronLeft size={15} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            data-cursor="hover"
            aria-label="Next month"
            onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-400/20 text-slate-300 transition-colors hover:border-glow-cyan/50 hover:text-glow-ice"
          >
            <ChevronRight size={15} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-1 text-center">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <span key={i} className="pb-2 font-mono text-[9px] uppercase tracking-widest text-slate-500">
            {d}
          </span>
        ))}
        {cells.map((d, i) => {
          if (!d) return <span key={`pad-${i}`} />;
          const departure = isDeparture(d);
          const isSel = selected?.getTime() === d.getTime();
          return (
            <button
              key={d.getTime()}
              type="button"
              disabled={!departure}
              data-cursor={departure ? "hover" : undefined}
              onClick={() => onSelect(d)}
              aria-label={`${departure ? "Departure available" : "No departure"} ${d.toDateString()}`}
              aria-pressed={isSel}
              className={cn(
                "relative mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm transition-all duration-300",
                !departure && "text-slate-600",
                departure && !isSel && "text-glow-mist hover:bg-glow-cyan/10 hover:text-glow-ice",
                isSel &&
                  "bg-glow-cyan/20 text-glow-ice shadow-[0_0_20px_rgba(0,229,255,0.35)] ring-1 ring-glow-cyan/60"
              )}
            >
              {d.getDate()}
              {departure && !isSel && (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-glow-cyan/70" />
              )}
            </button>
          );
        })}
      </div>
      <p className="mt-4 font-mono text-[9px] uppercase tracking-widest text-slate-500">
        · marked dates have open departure windows
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pricing tiers                                                       */
/* ------------------------------------------------------------------ */

const tiers = [
  {
    id: "explorer",
    name: "Explorer",
    mult: 1,
    perks: ["Standard viewport seat", "Expedition film", "Surface celebration"],
  },
  {
    id: "voyager",
    name: "Voyager",
    mult: 1.6,
    featured: true,
    perks: ["Dome-front seat", "Private naturalist", "8K camera control", "Merino expedition kit"],
  },
  {
    id: "pioneer",
    name: "Pioneer",
    mult: 2.4,
    perks: ["Co-pilot position", "Route input session", "Name in the ship's log", "Lifetime dive priority"],
  },
];

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Booking() {
  const [params] = useSearchParams();
  const initial = params.get("expedition");
  const [expId, setExpId] = useState(
    expeditions.some((e) => e.id === initial) ? (initial as string) : expeditions[0].id
  );
  const [date, setDate] = useState<Date | null>(null);
  const [guests, setGuests] = useState(2);
  const [tierId, setTierId] = useState("voyager");
  const [confirmed, setConfirmed] = useState(false);

  const exp = expeditions.find((e) => e.id === expId)!;
  const tier = tiers.find((t) => t.id === tierId)!;
  const total = Math.round(exp.price * tier.mult) * guests;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (date) setConfirmed(true);
  };

  return (
    <PageWrapper>
      <Seo
        title="Booking"
        description="Reserve your seat aboard the DSV Erebus. Choose an expedition, a departure window and a cabin tier — the deep handles the rest."
        path="/booking"
      />
      <AmbientBackground gradient="bg-gradient-to-b from-abyss-800 via-abyss-900 to-abyss-950" />

      <PageHeader
        kicker="Reservation"
        title="Claim your seat in the deep."
        intro="Three decisions stand between you and the trench: where, when, and how far forward you want to sit."
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-32">
        <AnimatePresence mode="wait">
          {confirmed ? (
            <motion.div
              key="confirmed"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="glass-deep card-glow mx-auto max-w-2xl rounded-3xl p-10 text-center md:p-14"
            >
              <div className="relative mx-auto h-24 w-24">
                <div className="absolute inset-0 animate-sonar rounded-full border border-glow-cyan/70" />
                <div className="absolute inset-0 animate-sonar rounded-full border border-glow-cyan/40" style={{ animationDelay: "1s" }} />
                <div className="absolute inset-6 flex items-center justify-center rounded-full border border-glow-cyan/60 bg-glow-cyan/10">
                  <Check size={26} strokeWidth={1.5} className="text-glow-ice" />
                </div>
              </div>
              <h2 className="mt-8 font-display text-4xl text-white">Descent reserved.</h2>
              <p className="mx-auto mt-4 max-w-md leading-relaxed text-slate-300">
                <span className="text-glow-ice">{exp.name}</span> ·{" "}
                {date?.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} ·{" "}
                {guests} {guests === 1 ? "explorer" : "explorers"} · {tier.name} tier.
              </p>
              <p className="mt-3 font-mono text-sm tracking-widest text-glow-cyan">
                ${total.toLocaleString()} — deposit on confirmation
              </p>
              <p className="mt-6 text-sm text-slate-500">
                A voyage dossier is on its way to your inbox. Pack light; the
                ocean provides the atmosphere.
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              exit={{ opacity: 0, y: -20 }}
              onSubmit={onSubmit}
              className="grid gap-8 lg:grid-cols-[1.5fr_1fr]"
            >
              <div className="space-y-8">
                {/* Step 1 — expedition */}
                <section className="glass-deep card-glow rounded-3xl p-8 md:p-10" aria-labelledby="step-exp">
                  <p className="kicker">01 · Expedition</p>
                  <h2 id="step-exp" className="mt-3 font-display text-2xl text-white">
                    Where are we going?
                  </h2>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {expeditions.map((e) => (
                      <button
                        key={e.id}
                        type="button"
                        data-cursor="hover"
                        onClick={() => setExpId(e.id)}
                        aria-pressed={expId === e.id}
                        className={cn(
                          "rounded-2xl border p-5 text-left transition-all duration-500",
                          expId === e.id
                            ? "border-glow-cyan/60 bg-glow-cyan/10 shadow-[0_0_30px_rgba(0,229,255,0.12)]"
                            : "border-slate-400/15 hover:border-glow-mist/40 hover:bg-abyss-800/30"
                        )}
                      >
                        <p className="font-display text-lg text-white">{e.name}</p>
                        <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-glow-mist/60">
                          -{formatDepth(e.depth)} · {e.duration}
                        </p>
                        <p className="mt-2 font-mono text-xs text-glow-cyan/80">
                          from ${e.price.toLocaleString()}
                        </p>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Step 2 — date & party */}
                <section className="glass-deep card-glow rounded-3xl p-8 md:p-10" aria-labelledby="step-date">
                  <p className="kicker">02 · Departure</p>
                  <h2 id="step-date" className="mt-3 font-display text-2xl text-white">
                    When do we slip beneath?
                  </h2>
                  <div className="mt-6 grid gap-10 md:grid-cols-[1.3fr_1fr]">
                    <Calendar selected={date} onSelect={setDate} />
                    <div className="space-y-8">
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Explorers</p>
                        <div className="mt-3 flex items-center gap-5">
                          <button
                            type="button"
                            data-cursor="hover"
                            aria-label="Fewer explorers"
                            onClick={() => setGuests(Math.max(1, guests - 1))}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-400/25 text-slate-300 transition-colors hover:border-glow-cyan/60 hover:text-glow-ice"
                          >
                            <Minus size={14} strokeWidth={1.5} />
                          </button>
                          <span className="w-8 text-center font-display text-3xl text-glow-ice">
                            {guests}
                          </span>
                          <button
                            type="button"
                            data-cursor="hover"
                            aria-label="More explorers"
                            onClick={() => setGuests(Math.min(8, guests + 1))}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-400/25 text-slate-300 transition-colors hover:border-glow-cyan/60 hover:text-glow-ice"
                          >
                            <Plus size={14} strokeWidth={1.5} />
                          </button>
                        </div>
                        <p className="mt-2 text-xs text-slate-500">The Erebus seats eight.</p>
                      </div>
                      <Field label="Lead explorer name" name="lead" autoComplete="name" required />
                      <Field label="Email for the dossier" name="email" type="email" autoComplete="email" required />
                    </div>
                  </div>
                </section>

                {/* Step 3 — tier */}
                <section className="glass-deep card-glow rounded-3xl p-8 md:p-10" aria-labelledby="step-tier">
                  <p className="kicker">03 · Cabin tier</p>
                  <h2 id="step-tier" className="mt-3 font-display text-2xl text-white">
                    How close to the glass?
                  </h2>
                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    {tiers.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        data-cursor="hover"
                        onClick={() => setTierId(t.id)}
                        aria-pressed={tierId === t.id}
                        className={cn(
                          "relative rounded-2xl border p-6 text-left transition-all duration-500",
                          tierId === t.id
                            ? "border-glow-cyan/60 bg-glow-cyan/10 shadow-[0_0_35px_rgba(0,229,255,0.15)]"
                            : "border-slate-400/15 hover:border-glow-mist/40"
                        )}
                      >
                        {t.featured && (
                          <span className="absolute -top-2.5 right-4 rounded-full border border-glow-cyan/50 bg-abyss-900 px-3 py-0.5 font-mono text-[8px] uppercase tracking-widest text-glow-cyan">
                            Most chosen
                          </span>
                        )}
                        <p className="font-display text-xl text-white">{t.name}</p>
                        <p className="mt-1 font-mono text-xs text-glow-cyan/80">
                          ×{t.mult} fare
                        </p>
                        <ul className="mt-4 space-y-2">
                          {t.perks.map((p) => (
                            <li key={p} className="flex gap-2 text-xs leading-relaxed text-slate-300">
                              <Check size={12} strokeWidth={1.5} className="mt-0.5 shrink-0 text-glow-cyan/70" />
                              {p}
                            </li>
                          ))}
                        </ul>
                      </button>
                    ))}
                  </div>
                </section>
              </div>

              {/* Summary rail */}
              <aside className="lg:sticky lg:top-28 lg:self-start">
                <div className="glass-deep card-glow rounded-3xl p-8">
                  <p className="kicker">Voyage summary</p>
                  <dl className="mt-6 space-y-5">
                    {[
                      ["Expedition", exp.name],
                      ["Max depth", `-${formatDepth(exp.depth)}`],
                      ["Departure", date ? date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Select a date"],
                      ["Explorers", String(guests)],
                      ["Tier", tier.name],
                    ].map(([k, v]) => (
                      <div key={k} className="flex items-baseline justify-between gap-4 border-b border-glow-mist/10 pb-3">
                        <dt className="text-xs uppercase tracking-[0.16em] text-slate-500">{k}</dt>
                        <dd className={cn("text-right font-display", v === "Select a date" ? "text-slate-500" : "text-glow-ice")}>
                          {v}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <div className="mt-7 flex items-baseline justify-between">
                    <span className="text-xs uppercase tracking-[0.16em] text-slate-400">Total</span>
                    <motion.span
                      key={total}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="font-display text-3xl text-white"
                    >
                      ${total.toLocaleString()}
                    </motion.span>
                  </div>
                  <Button type="submit" variant="glow" className="mt-8 w-full" disabled={!date}>
                    {date ? "Request this voyage" : "Choose a departure date"}
                  </Button>
                  <p className="mt-4 text-center font-mono text-[9px] uppercase tracking-widest text-slate-500">
                    No payment today · fully refundable 60 days out
                  </p>
                </div>
              </aside>
            </motion.form>
          )}
        </AnimatePresence>

        {/* FAQ */}
        {!confirmed && (
          <section className="mt-28" aria-labelledby="booking-faq">
            <h2 id="booking-faq" className="font-display text-3xl text-white md:text-4xl">
              Before you commit to the deep
            </h2>
            <Accordion className="mt-8" items={faqs.filter((f) => f.category === "Booking" || f.category === "Safety")} />
          </section>
        )}
      </div>

      <div className="relative z-10">
        <Footer />
      </div>
    </PageWrapper>
  );
}
