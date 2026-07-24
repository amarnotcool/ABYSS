import { lazy, Suspense, useLayoutEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSmoothScroll, getLenis } from "@/hooks/useSmoothScroll";
import { Navbar } from "@/components/layout/Navbar";
import { CustomCursor } from "@/components/cursor/CustomCursor";

import Home from "@/pages/Home";
const Expeditions = lazy(() => import("@/pages/Expeditions"));
const MarineLife = lazy(() => import("@/pages/MarineLife"));
const Technology = lazy(() => import("@/pages/Technology"));
const Sustainability = lazy(() => import("@/pages/Sustainability"));
const Gallery = lazy(() => import("@/pages/Gallery"));
const Contact = lazy(() => import("@/pages/Contact"));
const Booking = lazy(() => import("@/pages/Booking"));
const Faq = lazy(() => import("@/pages/Faq"));
const NotFound = lazy(() => import("@/pages/NotFound"));

function ScrollReset() {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    getLenis()?.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 120);
    return () => window.clearTimeout(id);
  }, [pathname]);
  return null;
}

function PageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-abyss-900">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-14 w-14">
          <div className="absolute inset-0 animate-sonar rounded-full border border-glow-cyan/60" />
          <div className="absolute inset-4 rounded-full border border-glow-mist/30" />
          <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-glow-cyan" />
        </div>
        <p className="font-mono text-[10px] uppercase tracking-widest2 text-glow-mist/60">
          Descending
        </p>
      </div>
    </div>
  );
}

export default function App() {
  useSmoothScroll();
  const location = useLocation();

  return (
    <div className="grain vignette">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <CustomCursor />
      <Navbar />
      <ScrollReset />
      <Suspense fallback={<PageFallback />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/expeditions" element={<Expeditions />} />
            <Route path="/marine-life" element={<MarineLife />} />
            <Route path="/technology" element={<Technology />} />
            <Route path="/sustainability" element={<Sustainability />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </div>
  );
}
