export interface Creature {
  id: string;
  name: string;
  latin: string;
  zone: string;
  depthRange: string;
  size: string;
  fact: string;
  description: string;
}

export const creatures: Creature[] = [
  {
    id: "sea-turtle",
    name: "Green Sea Turtle",
    latin: "Chelonia mydas",
    zone: "Sunlight Zone",
    depthRange: "0 – 40 m",
    size: "1.5 m · 190 kg",
    fact: "Navigates thousands of kilometers using Earth's magnetic field.",
    description:
      "Ancient mariners of the reef, green turtles return across entire oceans to the beach where they hatched, guided by a magnetic map written into their nervous system.",
  },
  {
    id: "blue-whale",
    name: "Blue Whale",
    latin: "Balaenoptera musculus",
    zone: "Open Ocean",
    depthRange: "0 – 500 m",
    size: "30 m · 180 t",
    fact: "Its heartbeat can be detected from over 3 km away.",
    description:
      "The largest animal to have ever lived. A blue whale's call travels across entire ocean basins — a bass note beneath the world, older than any human language.",
  },
  {
    id: "octopus",
    name: "Giant Pacific Octopus",
    latin: "Enteroctopus dofleini",
    zone: "Twilight Zone",
    depthRange: "0 – 1,500 m",
    size: "5 m span · 50 kg",
    fact: "Has three hearts, nine brains, and blue blood.",
    description:
      "A shape-shifting intelligence with two-thirds of its neurons in its arms. It tastes with its skin and can dissolve through any gap larger than its beak.",
  },
  {
    id: "hammerhead",
    name: "Hammerhead Shark",
    latin: "Sphyrna mokarran",
    zone: "Sunlight Zone",
    depthRange: "0 – 300 m",
    size: "4.5 m · 450 kg",
    fact: "Its head is an electroreceptive antenna scanning the seafloor.",
    description:
      "The hammer is a sensory instrument — sweeping the sand like a metal detector, reading the faint electric fields of hidden prey beneath.",
  },
  {
    id: "jellyfish",
    name: "Crown Jellyfish",
    latin: "Periphylla periphylla",
    zone: "Midnight Zone",
    depthRange: "500 – 2,500 m",
    size: "35 cm bell",
    fact: "Flashes brilliant bioluminescence when threatened.",
    description:
      "A deep crimson lantern of the midnight zone. When startled, it erupts in spirals of light — a silent alarm that has burned in the dark for 500 million years.",
  },
  {
    id: "coral",
    name: "Reef-Building Coral",
    latin: "Acropora cervicornis",
    zone: "Sunlight Zone",
    depthRange: "0 – 30 m",
    size: "Colonies span reefs",
    fact: "An animal, housing a plant, building a stone city.",
    description:
      "Each branch is a city of thousands of tiny animals farming sunlight through symbiotic algae. Together they've built the largest living structures on Earth.",
  },
  {
    id: "stingray",
    name: "Southern Stingray",
    latin: "Hypanus americanus",
    zone: "Sunlight Zone",
    depthRange: "0 – 55 m",
    size: "1.5 m span",
    fact: "Breathes through openings behind its eyes while buried.",
    description:
      "A living shadow that flows over the seabed. Stingrays vanish beneath a film of sand in seconds, leaving only two watchful eyes above the surface.",
  },
  {
    id: "manta-ray",
    name: "Giant Manta Ray",
    latin: "Mobula birostris",
    zone: "Open Ocean",
    depthRange: "0 – 1,000 m",
    size: "7 m span · 2 t",
    fact: "Has the largest brain of any fish — and may recognize itself.",
    description:
      "Underwater flight perfected. Mantas barrel-roll through clouds of plankton and visit reef 'cleaning stations' like travelers returning to a favorite harbor.",
  },
  {
    id: "anglerfish",
    name: "Humpback Anglerfish",
    latin: "Melanocetus johnsonii",
    zone: "Abyssal Zone",
    depthRange: "1,000 – 4,000 m",
    size: "18 cm",
    fact: "Fishes the darkness with a lantern of glowing bacteria.",
    description:
      "In a world without sun, she carries her own star. The lure's light is brewed by symbiotic bacteria — a partnership struck in the deepest dark on Earth.",
  },
];
