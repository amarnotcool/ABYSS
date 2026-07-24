# ABYSS — Deep Sea Exploration Co.

> **Explore the Last Unknown World.**

A cinematic, scroll-driven web experience for a fictional luxury submarine
expedition company. You don't scroll this site — you **descend** through it:
from sunlit surface to the 4,000 m ocean floor, with the water darkening,
creatures changing and instruments ticking the whole way down.

## The Descent (Home)

One continuous story across eight scenes, driven by GSAP ScrollTrigger and a
persistent WebGL ocean:

| Scene | Depth | What happens |
|---|---|---|
| Above the surface | 0 m | Sky, sun, clouds, calm sea, massive typography |
| The descent begins | 0–50 m | Palette shifts underwater, god rays, rising bubbles |
| First companions | 50–200 m | Instanced fish school (they avoid your cursor) |
| Coral Kingdom | 200 m | Reef color wash + illustrated creature cards |
| Your vessel | 500 m | The DSV Erebus arrives with her searchlight |
| Living light | 1,200 m | Bioluminescent jellyfish, bloom glow |
| The deep | 2,500 m | Scroll-scrubbed whale silhouette, shipwreck |
| The floor | 4,000 m | Arrival + booking call-to-action |

A fixed **depth HUD** (live meter, zone label, depth rail, sonar dial) reads a
frame-synchronous scroll store — zero React re-renders per frame.

## Pages

Home · Expeditions · Marine Life · Technology · Sustainability · Gallery ·
Booking · Contact · FAQ · 404 ("Lost in the Abyss", with resident anglerfish)

## Wow details

- **WebGL ocean** (R3F) built from **production GLB assets** — 17 Draco-compressed
  models (whale, manta, shark, turtle, octopus, grouper school, jellyfish,
  anglerfish, submarine, coral reef, shipwreck, ruins, treasure, kelp…),
  rigged swim animations via `useAnimations`, ACES filmic tone mapping,
  environment lighting, depth-of-field, Bloom + Vignette, GPU particle layers
  (marine snow / plankton / bubbles), a from-below water-surface shader and an
  underwater drifting camera (see `ATTRIBUTIONS.md` for asset credits)
- **Custom liquid cursor** — dot + trailing ring, morphs over interactives,
  click ripples and rising bubbles
- **Easter eggs** — a whale crosses the viewport every so often; the Technology
  page has a working searchlight that reveals hidden creatures and a log entry
- **Synthesized ambience** — filtered brown-noise ocean + occasional whale call,
  generated in WebAudio (no audio files), toggle in the navbar
- **Magnetic buttons, tilt cards, glass everything, film grain, vignette**
- **Interactive booking** — expedition picker, departure calendar, cabin tiers,
  live fare summary, sonar-ping confirmation

## Craft

- **Accessibility**: skip link, focus-visible rings, ARIA labels, semantic
  headings, keyboard-reachable controls, `prefers-reduced-motion` honored
  everywhere (Lenis, GSAP, canvases and cursor all stand down)
- **SEO**: per-page titles/descriptions, OpenGraph + Twitter cards, canonicals,
  robots.txt, sitemap.xml, JSON-LD (Organization, ItemList, FAQPage)
- **Performance**: route-level code splitting (each page is a ~2–13 kB chunk),
  vendor/three/motion manual chunks, DPR-capped canvases, instanced meshes,
  zero-re-render animation stores, GPU-only transforms

## Stack

React 18 · TypeScript · Vite · Tailwind CSS · GSAP + ScrollTrigger ·
Framer Motion · Three.js + React Three Fiber + Drei + postprocessing ·
Lenis smooth scroll · SplitType · React Helmet Async · Lucide

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
npm run preview
```

## Structure

```
src/
  components/
    creatures/     # SVG line-art species illustrations
    cursor/        # liquid cursor
    effects/       # ambient canvas, whale pass, silhouettes
    hud/           # depth meter + sonar instruments
    layout/        # navbar, footer, page shell/transitions
    three/         # ocean scene, submarine model
    ui/            # buttons, accordion, form fields
  data/            # expeditions, marine life, faqs, gallery
  hooks/           # smooth scroll, text reveal, magnetic, tilt, reduced motion
  lib/             # ocean scroll store, utils
  pages/           # one file per route
  styles/          # global css (glass, grain, cursor, keyframes)
```

*A fictional experience crafted for a frontend hackathon. No fish were
disturbed — they were instanced.*
