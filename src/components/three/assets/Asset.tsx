import { Component, useEffect, useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { useGLTF, useAnimations } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import { DRACO_PATH, MODELS, type ModelMeta, type ModelName } from "./registry";

export interface MaterialTune {
  envMapIntensity?: number;
  emissive?: string;
  emissiveIntensity?: number;
  opacity?: number;
  wireframe?: boolean;
  color?: string;
}

interface AssetProps {
  name: ModelName;
  /** Override normalized size (largest dimension, world units) */
  size?: number;
  /** Override / disable the default animation clip (null = no animation) */
  clip?: string | null;
  clipSpeed?: number;
  /** Stagger start time so clones don't animate in lockstep */
  clipOffset?: number;
  tune?: MaterialTune;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  visible?: boolean;
}

/**
 * Generic GLB asset: loads (Draco-aware), clones safely (skinned or static),
 * normalizes scale + pivot from its real bounding box, retunes materials for
 * the underwater grade, and plays its swim/idle clip when one exists.
 */
export function Asset({
  name,
  size,
  clip,
  clipSpeed = 1,
  clipOffset = 0,
  tune,
  ...group
}: AssetProps) {
  const meta: ModelMeta = MODELS[name];
  const { scene, animations } = useGLTF(meta.path, DRACO_PATH);
  const root = useRef<THREE.Group>(null!);

  const model = useMemo(() => {
    const cloned = SkeletonUtils.clone(scene);
    cloned.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(cloned);
    const dims = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(dims.x, dims.y, dims.z) || 1;
    const s = (size ?? meta.size) / maxDim;
    const center = box.getCenter(new THREE.Vector3());

    const holder = new THREE.Group();
    holder.add(cloned);
    cloned.position.set(
      -center.x,
      meta.ground ? -box.min.y : -center.y,
      -center.z
    );
    holder.scale.setScalar(s);
    holder.rotation.y = meta.yaw ?? 0;

    holder.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      const src = mesh.material as THREE.MeshStandardMaterial;
      if (!src) return;
      // Clone materials so per-instance tuning never leaks across clones.
      const m = src.clone();
      mesh.material = m;
      if ("envMapIntensity" in m) m.envMapIntensity = tune?.envMapIntensity ?? 0.7;
      if (tune?.color) m.color = new THREE.Color(tune.color);
      if (tune?.emissive && "emissive" in m) {
        m.emissive = new THREE.Color(tune.emissive);
        m.emissiveIntensity = tune.emissiveIntensity ?? 1;
      }
      if (tune?.opacity !== undefined) {
        m.transparent = true;
        m.opacity = tune.opacity;
        m.depthWrite = tune.opacity > 0.6;
      }
      if (tune?.wireframe && "wireframe" in m) m.wireframe = true;
    });

    return holder;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    scene,
    size,
    tune?.envMapIntensity,
    tune?.emissive,
    tune?.emissiveIntensity,
    tune?.opacity,
    tune?.wireframe,
    tune?.color,
  ]);

  const { actions } = useAnimations(animations, root);

  useEffect(() => {
    const clipName = clip === null ? undefined : clip ?? meta.clip;
    if (!clipName) return;
    const action = actions[clipName];
    if (!action) return;
    action.reset();
    action.setEffectiveTimeScale(clipSpeed);
    action.time = clipOffset;
    action.play();
    return () => {
      action.stop();
    };
  }, [actions, clip, clipSpeed, clipOffset, meta.clip]);

  return (
    <group ref={root} {...group}>
      <primitive object={model} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Per-asset error boundary: a missing/corrupt GLB never sinks the dive */
/* ------------------------------------------------------------------ */

export class AssetBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(err: unknown) {
    console.warn("[abyss] 3D asset failed to load:", err);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
