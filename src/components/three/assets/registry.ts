import { useGLTF } from "@react-three/drei";

/**
 * Central registry for every GLB asset in the experience.
 * All models are Draco-compressed; the decoder is vendored at /draco/.
 *
 * `size`  — world-space size (largest dimension) the model is normalized to.
 * `clip`  — default animation clip to play when the model is rigged.
 * `yaw`   — heading offset so "forward" math can assume +X travel.
 * `ground`— pivot sits at the model's base instead of its center.
 */
export const DRACO_PATH = "/draco/";

export interface ModelMeta {
  path: string;
  size: number;
  clip?: string;
  yaw?: number;
  ground?: boolean;
}

export const MODELS = {
  whale: {
    path: "/assets/models/whale.glb",
    size: 15,
    clip: "Armature|Swim",
    yaw: Math.PI / 2,
  },
  manta: {
    path: "/assets/models/manta.glb",
    size: 5.5,
    clip: "Armature|Swim",
    yaw: Math.PI / 2,
  },
  shark: {
    path: "/assets/models/shark.glb",
    size: 4.4,
    clip: "Fish_Armature|Swimming_Normal",
    yaw: Math.PI / 2,
  },
  fish: {
    path: "/assets/models/fish.glb",
    size: 1.05,
    clip: "Fish_Armature|Swimming_Normal",
    yaw: Math.PI / 2,
  },
  angler: {
    path: "/assets/models/angler.glb",
    size: 1.7,
    clip: "Fish_Armature|Swimming_Normal",
    yaw: Math.PI / 2,
  },
  turtle: { path: "/assets/models/turtle.glb", size: 3.1, yaw: Math.PI / 2 },
  octopus: { path: "/assets/models/octopus.glb", size: 2.6 },
  jellyfish: { path: "/assets/models/jellyfish.glb", size: 1.7 },
  submarine: { path: "/assets/models/submarine.glb", size: 7.5, yaw: Math.PI / 2 },
  coral: { path: "/assets/models/coral.glb", size: 9, ground: true },
  rocks: { path: "/assets/models/rocks.glb", size: 3.2, ground: true },
  ruins: { path: "/assets/models/ruins.glb", size: 6.5, ground: true },
  seaweed: { path: "/assets/models/seaweed.glb", size: 2.4, ground: true },
  kelp: { path: "/assets/models/kelp.glb", size: 4.2, ground: true },
  shipwreck: { path: "/assets/models/shipwreck.glb", size: 17, ground: true },
  treasure: { path: "/assets/models/treasure.glb", size: 2.1, ground: true },
  anchor: { path: "/assets/models/anchor.glb", size: 2.6, ground: true },
} satisfies Record<string, ModelMeta>;

export type ModelName = keyof typeof MODELS;

/** Kick off downloads for every model (call once, at module load of the scene). */
export function preloadAllModels() {
  (Object.values(MODELS) as ModelMeta[]).forEach((m) =>
    useGLTF.preload(m.path, DRACO_PATH)
  );
}
