import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Seo } from "@/components/Seo";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { PageHeader } from "@/components/layout/PageHeader";
import { Footer } from "@/components/layout/Footer";
import { AmbientBackground } from "@/components/effects/AmbientBackground";
import { CreatureArt } from "@/components/creatures/CreatureArt";
import { galleryItems, type GalleryItem } from "@/data/gallery";
import { cn } from "@/lib/utils";

const creatureForPlate: Record<string, string> = {
  jellyfish: "jellyfish",
  whale: "blue-whale",
  fish: "sea-turtle",
  manta: "manta-ray",
  angler: "anglerfish",
  wreck: "hammerhead",
};

function Plate({ item, onOpen, index }: { item: GalleryItem; onOpen: () => void; index: number }) {
  return (
    <motion.button
      layoutId={`plate-${item.id}`}
      onClick={onOpen}
      data-cursor="hover"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.8, delay: (index % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group relative w-full overflow-hidden rounded-2xl text-left",
        item.tall ? "row-span-2 min-h-[440px]" : "min-h-[210px]"
      )}
      aria-label={`Open plate: ${item.title}`}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 transition-transform duration-[1.2s] ease-out group-hover:scale-110"
        style={{ background: item.art }}
      />
      {item.creature && (
        <div className="absolute inset-0 flex items-center justify-center opacity-50 transition-all duration-1000 group-hover:scale-105 group-hover:opacity-80">
          <CreatureArt id={creatureForPlate[item.creature]} className="w-2/3 max-w-[260px]" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-abyss-950/80 via-transparent to-transparent opacity-80 transition-opacity duration-700 group-hover:opacity-100" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
        <div>
          <p className="font-display text-lg text-white">{item.title}</p>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-glow-mist/60">
            {item.location}
          </p>
        </div>
        <span className="font-mono text-[10px] tracking-widest text-glow-cyan/80">{item.depth}</span>
      </div>
      <div className="absolute inset-0 rounded-2xl border border-glow-mist/10 transition-colors duration-500 group-hover:border-glow-cyan/40" />
    </motion.button>
  );
}

export default function Gallery() {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = galleryItems.find((g) => g.id === openId) ?? null;

  return (
    <PageWrapper>
      <Seo
        title="Gallery"
        description="Expedition plates from three years of descents — reef bloom, passing leviathans, fields of lanterns and the iron gardens of the deep."
        path="/gallery"
      />
      <AmbientBackground />

      <PageHeader
        kicker="Expedition plates"
        title="Postcards from the dark."
        intro="Stylized plates from the expedition archive — each one logged with the exact depth at which the ocean posed for us."
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-32">
        <div className="grid auto-rows-[210px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {galleryItems.map((item, i) => (
            <Plate key={item.id} item={item} index={i} onOpen={() => setOpenId(item.id)} />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-abyss-950/85 p-4 backdrop-blur-lg md:p-10"
            onClick={() => setOpenId(null)}
            role="dialog"
            aria-modal="true"
            aria-label={`Plate: ${open.title}`}
          >
            <motion.div
              layoutId={`plate-${open.id}`}
              onClick={(e) => e.stopPropagation()}
              className="relative h-[70vh] w-full max-w-4xl overflow-hidden rounded-3xl"
            >
              <div aria-hidden="true" className="absolute inset-0" style={{ background: open.art }} />
              {open.creature && (
                <div className="absolute inset-0 flex items-center justify-center opacity-80">
                  <CreatureArt id={creatureForPlate[open.creature]} className="w-1/2 max-w-[420px]" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-abyss-950/90 via-transparent to-abyss-950/30" />
              <button
                onClick={() => setOpenId(null)}
                data-cursor="hover"
                aria-label="Close plate"
                className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-abyss-950/40 text-white backdrop-blur transition-colors hover:border-glow-cyan/60 hover:text-glow-ice"
              >
                <X size={16} strokeWidth={1.5} />
              </button>
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-8">
                <div>
                  <p className="font-display text-3xl text-white">{open.title}</p>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-widest2 text-glow-mist/70">
                    {open.location}
                  </p>
                </div>
                <span className="font-mono text-lg tracking-widest text-glow-cyan">{open.depth}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10">
        <Footer />
      </div>
    </PageWrapper>
  );
}
