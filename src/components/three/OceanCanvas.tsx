import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette, DepthOfField } from "@react-three/postprocessing";
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

// Start fetching every Draco-compressed model the moment this chunk loads.
preloadAllModels();

/**
 * The living ocean behind the Home descent.
 * Fixed full-viewport canvas; every layer reads the frame-synced scroll store.
 */
export function OceanCanvas() {
  const reduced = usePrefersReducedMotion();

  if (reduced) {
    return (
      <div
        aria-hidden="true"
        className="fixed inset-0 z-0 bg-gradient-to-b from-abyss-700 via-abyss-900 to-abyss-950"
      />
    );
  }

  return (
    <div className="fixed inset-0 z-0" aria-hidden="true">
      <Canvas
        dpr={[1, 1.6]}
        camera={{ position: [0, 0, 9], fov: 60 }}
        gl={{
          antialias: true,
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
            <DepthOfField focusDistance={0.028} focalLength={0.09} bokehScale={2.2} />
            <Bloom intensity={0.7} luminanceThreshold={0.32} luminanceSmoothing={0.35} mipmapBlur />
            <Vignette eskil={false} offset={0.2} darkness={0.62} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
