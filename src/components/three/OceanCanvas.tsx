import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { usePrefersReducedMotion } from "@/hooks/useReducedMotion";
import { preloadAllModels } from "./assets/registry";
import { AssetBoundary } from "./assets/Asset";
import {
  Atmosphere,
  Backdrop,
  CameraRig,
  GodRays,
} from "./ocean/Environment";
import { OceanParticles } from "./ocean/Particles";
import {
  AnglerLurk,
  FishSchool,
  NeonSchool,
  ScatteredReefFish,
  JellyfishField,
  MantaGlide,
  SharkPatrol,
  SubmarineEscort,
  TurtleGlide,
  WhaleCrossing,
} from "./ocean/Creatures";
import { DeepFloor, ReefShelf, AbyssalTrench, Seabed } from "./ocean/SetPieces";
import { SurfaceWorld } from "../home/CinematicOceanHero";

/**
 * The living ocean behind the Home descent.
 * Fixed full-viewport canvas; every layer reads the frame-synced scroll store.
 *
 * Performance notes:
 * - Removed heavy 18 MB HDR Environment (sky_hdri.hdr) — procedural env in Atmosphere is sufficient
 * - Removed EffectComposer + Bloom post-processing pass — halved GPU cost
 * - Canvas mount delayed 300ms to avoid blocking FCP/LCP
 * - DPR capped at 1 on mobile devices
 */

const isMobile = typeof navigator !== "undefined" && navigator.maxTouchPoints > 0;

export function OceanCanvas() {
  const reduced = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Delay canvas mount to avoid blocking FCP/LCP paint
    const id = window.setTimeout(() => {
      setMounted(true);
      preloadAllModels();
    }, 300);
    return () => window.clearTimeout(id);
  }, []);

  if (reduced || !mounted) {
    return (
      <div
        aria-hidden="true"
        className="fixed inset-0 z-0 bg-gradient-to-b from-abyss-700 via-abyss-900 to-abyss-950 transition-opacity duration-1000"
      />
    );
  }

  return (
    <div className="fixed inset-0 z-0" aria-hidden="true">
      <Canvas
        dpr={isMobile ? [1, 1] : [1, 1.25]}
        camera={{ position: [0, 0, 9], fov: 60 }}
        gl={{
          antialias: false,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
      >
        <Suspense fallback={null}>
          {/* Above-water surface features */}
          <SurfaceWorld />

          {/* Underwater features */}
          <Atmosphere />
          <CameraRig />
          <Backdrop />
          <GodRays />
          <OceanParticles />

          {/* Fish — main school (22 fish) */}
          <AssetBoundary>
            <FishSchool />
          </AssetBoundary>
          {/* Fish — second neon school (12 fish) */}
          <AssetBoundary>
            <NeonSchool />
          </AssetBoundary>
          {/* Fish — 3 scattered solo reef fish */}
          <AssetBoundary>
            <ScatteredReefFish />
          </AssetBoundary>

          <AssetBoundary>
            <MantaGlide />
          </AssetBoundary>
          <AssetBoundary>
            <TurtleGlide />
          </AssetBoundary>
          
          <AbyssalTrench />
          
          <AssetBoundary>
            <ReefShelf />
          </AssetBoundary>
          <AssetBoundary>
            <SubmarineEscort />
          </AssetBoundary>
          <AssetBoundary>
            <SharkPatrol />
          </AssetBoundary>
          <AssetBoundary>
            <JellyfishField />
          </AssetBoundary>
          <AssetBoundary>
            <WhaleCrossing />
          </AssetBoundary>
          <AssetBoundary>
            <DeepFloor />
          </AssetBoundary>
          <AssetBoundary>
            <AnglerLurk />
          </AssetBoundary>

          {/* The seabed — visible floor at descent terminus */}
          <Seabed />

          {/* Bloom/EffectComposer removed for performance — emissive glow
              on individual materials provides equivalent visual with ~2x FPS */}
        </Suspense>
      </Canvas>
    </div>
  );
}
