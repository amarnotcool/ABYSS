export interface Expedition {
  id: string;
  name: string;
  tagline: string;
  depth: number;
  duration: string;
  difficulty: "Serene" | "Moderate" | "Advanced" | "Extreme";
  price: number;
  description: string;
  highlights: string[];
  hue: string; // gradient accent
}

export const expeditions: Expedition[] = [
  {
    id: "coral-kingdom",
    name: "Coral Kingdom",
    tagline: "Where the ocean paints in color",
    depth: 40,
    duration: "4 hours",
    difficulty: "Serene",
    price: 2900,
    description:
      "Drift over living cathedrals of coral in glass-domed silence. Turtles glide past the viewport while reef fish move like weather around you.",
    highlights: ["Glass-dome observation", "Sea turtle nurseries", "Champagne surfacing ceremony"],
    hue: "from-cyan-400/30 via-teal-500/15 to-abyss-800/40",
  },
  {
    id: "shallow-discovery",
    name: "Shallow Discovery",
    tagline: "Your first breath below",
    depth: 120,
    duration: "6 hours",
    difficulty: "Serene",
    price: 4200,
    description:
      "A gentle introduction to the vertical world. Sunlight fractures overhead as our pilots trace the reef wall's first great drop.",
    highlights: ["Sunlit thermocline crossing", "Reef wall traverse", "Onboard marine biologist"],
    hue: "from-sky-400/30 via-abyss-500/20 to-abyss-800/40",
  },
  {
    id: "titanic-route",
    name: "The Titanic Route",
    tagline: "An audience with history",
    depth: 3800,
    duration: "11 hours",
    difficulty: "Extreme",
    price: 98000,
    description:
      "Descend through absolute darkness to the most storied wreck on Earth. The bow emerges from the gloom like a memory refusing to fade.",
    highlights: ["Full wreck circumnavigation", "Debris field survey", "Historian-guided narration"],
    hue: "from-abyss-600/40 via-abyss-800/40 to-abyss-950/60",
  },
  {
    id: "bioluminescent-night",
    name: "Bioluminescent Night Dive",
    tagline: "The ocean turns to starlight",
    depth: 900,
    duration: "8 hours",
    difficulty: "Moderate",
    price: 18500,
    description:
      "We extinguish every light. Then the sea answers — ctenophores ripple in rainbow static and jellyfish pulse like slow lightning.",
    highlights: ["Total blackout descent", "Living light displays", "Hydrophone whale-song feed"],
    hue: "from-glow-cyan/25 via-indigo-500/20 to-abyss-900/50",
  },
  {
    id: "midnight-abyss",
    name: "Midnight Abyss",
    tagline: "Below the reach of the sun",
    depth: 2500,
    duration: "10 hours",
    difficulty: "Advanced",
    price: 45000,
    description:
      "Enter the midnight zone, where evolution dreams in the dark. Anglerfish lanterns drift past like distant harbor lights.",
    highlights: ["Midnight zone fauna", "Whale-fall observation", "Pressure-hull acoustic tour"],
    hue: "from-indigo-500/25 via-abyss-800/40 to-abyss-950/70",
  },
  {
    id: "ocean-trench",
    name: "Ocean Trench Expedition",
    tagline: "The last address on Earth",
    depth: 4000,
    duration: "14 hours",
    difficulty: "Extreme",
    price: 125000,
    description:
      "Our flagship voyage to the hadal frontier. Fewer humans have made this descent than have stood on the Moon.",
    highlights: ["Hadal zone touchdown", "Ancient ruin flyover", "Explorer's citation & log entry"],
    hue: "from-abyss-700/40 via-abyss-900/60 to-black/70",
  },
];

export const difficultyColor: Record<Expedition["difficulty"], string> = {
  Serene: "text-teal-300 border-teal-300/30",
  Moderate: "text-glow-mist border-glow-mist/30",
  Advanced: "text-indigo-300 border-indigo-300/30",
  Extreme: "text-rose-300 border-rose-300/30",
};
