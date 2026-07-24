export interface GalleryItem {
  id: string;
  title: string;
  location: string;
  depth: string;
  /** CSS gradient serving as the photographic plate */
  art: string;
  tall?: boolean;
  creature?: "jellyfish" | "whale" | "fish" | "wreck" | "manta" | "angler";
}

export const galleryItems: GalleryItem[] = [
  {
    id: "surface-gold",
    title: "First Light Descent",
    location: "Coral Sea",
    depth: "-8 m",
    art: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,214,140,0.35), transparent 60%), linear-gradient(180deg, #2e7bb8 0%, #0a3981 60%, #052659 100%)",
    creature: "fish",
  },
  {
    id: "reef-bloom",
    title: "Reef in Bloom",
    location: "Raja Ampat",
    depth: "-24 m",
    art: "radial-gradient(ellipse 60% 50% at 30% 80%, rgba(255,120,160,0.25), transparent 60%), radial-gradient(ellipse 50% 40% at 75% 70%, rgba(0,229,255,0.2), transparent 60%), linear-gradient(180deg, #1f7ab0 0%, #0a3981 100%)",
    tall: true,
    creature: "fish",
  },
  {
    id: "manta-cathedral",
    title: "Cathedral of Mantas",
    location: "Maldives",
    depth: "-40 m",
    art: "radial-gradient(ellipse 90% 50% at 50% 0%, rgba(142,214,255,0.28), transparent 55%), linear-gradient(180deg, #16609c 0%, #052659 80%)",
    creature: "manta",
  },
  {
    id: "twilight-veil",
    title: "The Twilight Veil",
    location: "Monterey Canyon",
    depth: "-620 m",
    art: "linear-gradient(180deg, #0a3981 0%, #052659 40%, #021024 100%)",
    creature: "jellyfish",
    tall: true,
  },
  {
    id: "lantern-field",
    title: "Field of Lanterns",
    location: "Sulawesi Deep",
    depth: "-980 m",
    art: "radial-gradient(circle at 30% 40%, rgba(0,229,255,0.3), transparent 25%), radial-gradient(circle at 70% 65%, rgba(125,249,255,0.22), transparent 20%), linear-gradient(180deg, #052659 0%, #021024 70%, #000308 100%)",
    creature: "jellyfish",
  },
  {
    id: "leviathan",
    title: "Passing Leviathan",
    location: "Azores Corridor",
    depth: "-310 m",
    art: "radial-gradient(ellipse 100% 60% at 50% 10%, rgba(74,144,226,0.25), transparent 60%), linear-gradient(180deg, #0d4788 0%, #052659 60%, #021024 100%)",
    creature: "whale",
    tall: true,
  },
  {
    id: "iron-garden",
    title: "The Iron Garden",
    location: "North Atlantic",
    depth: "-3,800 m",
    art: "radial-gradient(ellipse 60% 40% at 60% 60%, rgba(74,144,226,0.15), transparent 60%), linear-gradient(180deg, #021024 0%, #000308 100%)",
    creature: "wreck",
  },
  {
    id: "angler-portrait",
    title: "Portrait with Lantern",
    location: "Hadal Station IV",
    depth: "-2,650 m",
    art: "radial-gradient(circle at 55% 45%, rgba(0,229,255,0.35), transparent 18%), linear-gradient(180deg, #010812 0%, #000308 100%)",
    creature: "angler",
  },
  {
    id: "trench-dawn",
    title: "Dawn Never Comes",
    location: "Mariana Forearc",
    depth: "-4,000 m",
    art: "radial-gradient(ellipse 80% 30% at 50% 100%, rgba(31,80,154,0.3), transparent 60%), linear-gradient(180deg, #000308 0%, #010c1c 100%)",
    tall: true,
    creature: "wreck",
  },
  {
    id: "surface-return",
    title: "The Return",
    location: "Open Pacific",
    depth: "-2 m",
    art: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(255,230,180,0.4), transparent 55%), linear-gradient(180deg, #3d8ec9 0%, #1f509a 70%, #0a3981 100%)",
    creature: "fish",
  },
];
