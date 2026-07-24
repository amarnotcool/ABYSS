# Project Documentation — HackOcean 2026

## 1. Team Name
**Team Apex**

## 2. Team Leader Name + Contact
- **Team Leader:** Devpratap Singh
- **Email:** devprataprathore346@gmail.com
- **Phone / Contact:** 8085083417

## 3. Problem Statement Chosen
**PS01** — *Ocean Tech / Interactive Marine Experience & Exploration Web Application*

## 4. Event Name
**HackOcean 2026 - Round 2**

## 5. Links
- **GitHub Repository Link:** [https://github.com/amarnotcool/ABYSS]
- **Live Deployed Link:** [abyss-apex.vercel.app]

---

## 6. Project Name / Title
### **ABYSS — Deep Sea Exploration Co.**

---

## 7. Summary
**ABYSS** is a cinematic, scroll-driven web application designed for a luxury deep-sea submarine expedition enterprise. Rather than scrolling through traditional web pages, users **descend** dynamically through eight immersive ocean depth zones — from sunlit surface waters (0 m) down to the abyssal trench floor (4,000 m).

The platform features a persistent WebGL 3D ocean environment powered by React Three Fiber, custom Gerstner wave water physics, 17 Draco-compressed 3D marine life models, real-time procedural lighting, synthesized WebAudio ocean acoustics, and an interactive expedition booking system.

---

## 8. Problem Being Solved
1. **Lack of Immersive Marine Education & Public Engagement:** Traditional ocean exploration and conservation platforms rely on static text and flat images, failing to convey the true depth, scale, and urgency of deep-sea marine ecosystems.
2. **Generic E-Commerce / Expedition Booking Experiences:** Luxury exploration and high-end scientific expeditions lack modern, interactive digital touchpoints that capture the prestige and sensory wonder of real-world ocean exploration.
3. **Heavy WebGL Performance Bottlenecks:** Most 3D web experiences suffer from severe lag, high GPU memory usage, and poor accessibility. ABYSS solves this with frame-synchronous state stores, instanced rendering, half-res FBO pipelines, and complete `prefers-reduced-motion` fallbacks.

---

## 9. USP (Unique Selling Point)
* **Scroll-as-Descent Narrative Engine:** Seamless transition from sky to deep ocean floor driven frame-by-frame by scroll progress, syncing lighting, fog density, audio acoustics, and depth instruments with zero React re-renders.
* **Photorealistic GPU Gerstner Water Physics:** Real-time refraction, depth absorption, and dynamic surface waves seamlessly shifting into underwater volumetric lighting and particle layers (marine snow, plankton, bubble streams).
* **Production-Grade WebGL Performance Optimization:** Custom instanced rendering for marine life, Draco compression for 17+ 3D models, zero-re-render depth HUD, and automated fallback for low-power or reduced-motion environments.
* **Synthesized WebAudio Soundscape:** Ambient ocean depth acoustics generated dynamically via WebAudio API brown-noise filters and acoustic resonance without external audio files.

---

## 10. Key Features
* **8-Zone Continuous Descent Experience:**
  * `0 m` — *Above the Surface:* Atmospheric sunrise sky, Gerstner wave ocean surface, massive typography.
  * `0–50 m` — *The Descent Begins:* Sunlight refraction, cathedral god rays, rising bubble streams.
  * `50–200 m` — *First Companions:* Interactive fish schools reacting to cursor movement.
  * `200 m` — *Coral Kingdom:* Warm reef color washes and species log cards.
  * `500 m` — *Your Vessel:* Arrival of the DSV Erebus submarine with working volumetric searchlight.
  * `1,200 m` — *Living Light:* Bioluminescent jellyfish fields and deep-sea glow motes.
  * `2,500 m` — *The Deep:* Whale silhouette passes, ancient shipwreck, and underwater ruins.
  * `4,000 m` — *The Floor:* Abyssal floor arrival and direct booking call-to-action.
* **Live Instruments & Depth HUD:** Persistent HUD displaying live depth meter (-0 M to -4,000 M), oceanic zone indicators, vertical depth rail, and working sonar sweep.
* **Interactive Booking Engine:** Expedition picker, interactive departure calendar, cabin tier selection, live fare calculator, and sonar-ping booking confirmation.
* **Technology Spotlight & Submarine Inspector:** Interactive DSV Erebus breakdown with flashlight/searchlight mechanic revealing hidden marine species log entries.
* **Liquid Custom Cursor & Audio System:** Two-part liquid cursor with interactive ripple effects, rising click-bubbles, and WebAudio synthesized soundscape.
* **Accessibility & SEO Excellence:** Skip links, ARIA landmarks, `prefers-reduced-motion` compliance, structured JSON-LD schemas (Organization, FAQ, ItemList), and meta tags.

---

## 11. Tech Stack
* **Frontend Core:** React 18, TypeScript, Vite
* **3D Graphics & Physics:** Three.js, React Three Fiber (@react-three/fiber), Drei (@react-three/drei), GLSL Shaders (Gerstner Wave & Volumetric Refraction)
* **Animation & Smooth Scroll:** GSAP 3 + ScrollTrigger, Framer Motion, Lenis Smooth Scroll, SplitType
* **Styling & UI:** Tailwind CSS, Vanilla CSS (Glassmorphism, custom scrollbars, grain & vignette shaders), Lucide Icons
* **Audio Engine:** WebAudio API (Procedural brown-noise ocean acoustics)
* **SEO & Metadata:** React Helmet Async, JSON-LD Schema integration

---

## 12. Future Scope
* **WebXR / VR Marine Exploration Mode:** Allow users with VR headsets (Meta Quest / Apple Vision Pro) to experience the submarine descent in full 360° virtual reality.
* **Live Oceanographic Data Integration:** Connect to real-time ocean temperature, salinity, and satellite marine tracking APIs (e.g., NOAA, Open-Meteo Ocean API) to reflect real oceanic conditions.
* **Multi-Player Submarine Crew Sessions:** Synchronized multi-user exploration rooms where researchers or guests can co-explore underwater coordinates together.
* **AI Marine Species Identification Guide:** Integrate a vision AI assistant for users to identify and learn about deep-sea creatures encountered during their dive.
