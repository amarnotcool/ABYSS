import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { usePrefersReducedMotion } from "@/hooks/useReducedMotion";
import { preloadAllModels } from "./assets/registry";
import { AssetBoundary } from "./assets/Asset";
import {
  Atmosphere,
  Backdrop,
  CameraRig,
  GodRays,
  SurfaceFromBelow,
} from "./ocean/Environment";
import { OceanParticles } from "./ocean/Particles";
import {
  AnglerLurk,
  FishSchool,
  JellyfishField,
  MantaGlide,
  SharkPatrol,
  SubmarineEscort,
  TurtleGlide,
  WhaleCrossing,
} from "./ocean/Creatures";
import { DeepFloor, ReefShelf } from "./ocean/SetPieces";

/**
 * The living ocean behind the Home descent.
 * Fixed full-viewport canvas; every layer reads the frame-synced scroll store.
 */
export function OceanCanvas() {
  const reduced = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Schedule 3D canvas initialization and model preloading after initial paint (FCP/LCP)
    const id = window.setTimeout(() => {
      setMounted(true);
      preloadAllModels();
    }, 50);
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
        dpr={[1, 1.25]}
        camera={{ position: [0, 0, 9], fov: 60 }}
        gl={{
          antialias: false,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
      >
        <Suspense fallback={null}>
          <Atmosphere />
          <CameraRig />
          <Backdrop />
          <GodRays />
          <SurfaceFromBelow />
          <OceanParticles />

          <AssetBoundary>
            <FishSchool />
          </AssetBoundary>
          <AssetBoundary>
            <MantaGlide />
          </AssetBoundary>
          <AssetBoundary>
            <TurtleGlide />
          </AssetBoundary>
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

          <EffectComposer multisampling={0}>
            <Bloom intensity={0.6} luminanceThreshold={0.35} luminanceSmoothing={0.4} />
            <Vignette eskil={false} offset={0.2} darkness={0.6} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}

