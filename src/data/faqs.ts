export interface Faq {
  q: string;
  a: string;
  category: "Expeditions" | "Safety" | "Booking" | "Aboard";
}

export const faqs: Faq[] = [
  {
    q: "Do I need diving experience?",
    a: "None at all. You travel inside the DSV Erebus at surface pressure — no training, no certification, no equipment. If you can ride an elevator, you can visit 4,000 meters.",
    category: "Expeditions",
  },
  {
    q: "How safe are the submersibles?",
    a: "The Erebus hull is certified to 150% of its maximum operating depth and inspected before every voyage. Every dive carries triple-redundant life support, independent ballast drop systems, and a 96-hour reserve.",
    category: "Safety",
  },
  {
    q: "What should I wear?",
    a: "Cabin temperature is a steady 19°C. We recommend soft layers — most explorers settle on the merino expedition set waiting in their cabin locker.",
    category: "Aboard",
  },
  {
    q: "Will I feel the pressure?",
    a: "No. The cabin remains at sea-level pressure for the entire dive. There is no decompression, no ear-popping — only the view changing outside the glass.",
    category: "Safety",
  },
  {
    q: "Can I take photographs?",
    a: "Yes — and better than you imagine. Each seat has a dedicated 8K external camera you control, and every guest receives a color-graded film of their descent.",
    category: "Aboard",
  },
  {
    q: "How far in advance should I book?",
    a: "Reef expeditions fill 2–3 months out. Trench and Titanic voyages are released twice a year and are typically reserved within days — join the waitlist for first access.",
    category: "Booking",
  },
  {
    q: "What is your cancellation policy?",
    a: "Full refund up to 60 days before departure. Within 60 days, your deposit converts to open credit valid for three years — the ocean will wait for you.",
    category: "Booking",
  },
  {
    q: "Is the experience accessible?",
    a: "The Erebus was designed around a step-free cabin and transfer-friendly seating. Tell us what you need — our expedition team has yet to meet a barrier it couldn't engineer away.",
    category: "Expeditions",
  },
];
