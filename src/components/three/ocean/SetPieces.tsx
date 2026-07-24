import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { Asset, AssetBoundary } from "../assets/Asset";
import { DRACO_PATH, MODELS } from "../assets/registry";
import { oceanState } from "@/lib/oceanState";
import { remap } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Gentle current sway around the plant's base. */
function Sway({
  children,
  phase = 0,
  amp = 0.07,
  speed = 0.8,
  position,
}: {
  children: React.ReactNode;
  phase?: number;
  amp?: number;
  speed?: number;
  position?: [number, number, number];
}) {
  const ref = useRef<THREE.Group>(null!);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    ref.current.rotation.z = Math.sin(t * speed + phase) * amp;
    ref.current.rotation.x = Math.cos(t * speed * 0.7 + phase) * amp * 0.5;
  });
  return (
    <group ref={ref} position={position}>
      {children}
    </group>
  );
}

/** Instanced scatter of the rocks model — one draw call for the whole field. */
function RockField({
  count,
  spread = [30, 10],
  size = [0.8, 2.6],
  y = 0,
}: {
  count: number;
  spread?: [number, number];
  size?: [number, number];
  y?: number;
}) {
  const { scene } = useGLTF(MODELS.rocks.path, DRACO_PATH);

  const { geo, mat, matrices } = useMemo(() => {
    let geo: THREE.BufferGeometry | undefined;
    let mat: THREE.Material | undefined;
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh && !geo) {
        geo = m.geometry;
        mat = m.material as THREE.Material;
      }
    });
    // normalize the source geometry to unit size
    geo = geo!.clone();
    geo.computeBoundingBox();
    const bb = geo.boundingBox!;
    const dims = bb.getSize(new THREE.Vector3());
    const inv = 1 / (Math.max(dims.x, dims.y, dims.z) || 1);
    geo.translate(-(bb.min.x + bb.max.x) / 2, -bb.min.y, -(bb.min.z + bb.max.z) / 2);
    geo.scale(inv, inv, inv);

    const matrices: THREE.Matrix4[] = [];
    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const s = size[0] + ((i * 7919) % 1000) / 1000 * (size[1] - size[0]);
      dummy.position.set(
        (((i * 2654435761) % 1000) / 1000 - 0.5) * spread[0],
        y,
        (((i * 40503) % 1000) / 1000 - 0.5) * spread[1]
      );
      dummy.rotation.y = ((i * 97) % 628) / 100;
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      matrices.push(dummy.matrix.clone());
    }
    return { geo, mat: mat!, matrices };
  }, [scene, count, spread[0], spread[1], size[0], size[1], y]);

  return (
    <instancedMesh
      args={[geo, mat, count]}
      ref={(mesh) => {
        if (!mesh) return;
        matrices.forEach((m, i) => mesh.setMatrixAt(i, m));
        mesh.instanceMatrix.needsUpdate = true;
      }}
    />
  );
}

/** Sand bed with dune-like height variation. */
function SandBed({ width = 190, depth = 70 }: { width?: number; depth?: number }) {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(width, depth, 110, 36);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const h =
        Math.sin(x * 0.11) * Math.cos(y * 0.13) * 1.1 +
        Math.sin(x * 0.31 + 2.1) * 0.45 +
        Math.cos(x * 0.052 + y * 0.09) * 0.8;
      pos.setZ(i, h);
    }
    g.computeVertexNormals();
    return g;
  }, [width, depth]);

  return (
    <mesh geometry={geo} rotation={[-Math.PI / 2, 0, 0]}>
      <meshStandardMaterial color="#12253f" roughness={0.95} metalness={0.05} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* The Coral Kingdom shelf — rises past you at reef depth              */
/* ------------------------------------------------------------------ */

export function ReefShelf() {
  const ref = useRef<THREE.Group>(null!);

  useFrame(() => {
    const p = oceanState.progress;
    const g = ref.current;
    const visible = p > 0.24 && p < 0.64;
    g.visible = visible;
    if (!visible) return;
    g.position.y = remap(p, 0.24, 0.64, -34, 16);
  });

  return (
    <group ref={ref} visible={false}>
      <SandBed width={150} depth={46} />
      <AssetBoundary>
        <group>
          <Asset name="coral" position={[-9, 0, -8]} size={13} />
          <Asset name="coral" position={[8, 0, -12]} size={9.5} rotation={[0, 2.2, 0]} />
          <Asset name="coral" position={[0.5, 0, -16]} size={7.5} rotation={[0, 4, 0]} />
        </group>
      </AssetBoundary>
      <AssetBoundary>
        <group>
          <RockField count={18} spread={[110, 34]} size={[0.7, 2.8]} />
          <Sway position={[-14, 0, -6]} phase={0}>
            <Asset name="kelp" size={5} />
          </Sway>
          <Sway position={[-17.5, 0, -10]} phase={1.4} amp={0.09}>
            <Asset name="kelp" size={3.6} />
          </Sway>
          <Sway position={[13, 0, -7]} phase={2.2}>
            <Asset name="kelp" size={4.4} />
          </Sway>
          {[-6, -2.5, 3.5, 6.5, 10].map((x, i) => (
            <Sway key={x} position={[x, 0, -5 - (i % 3) * 2]} phase={i * 1.1} amp={0.12} speed={1.1}>
              <Asset name="seaweed" size={1.8 + (i % 3) * 0.5} />
            </Sway>
          ))}
        </group>
      </AssetBoundary>
      {/* Resident octopus, breathing on its rock */}
      <AssetBoundary>
        <OctopusPerch />
      </AssetBoundary>
    </group>
  );
}

function OctopusPerch() {
  const ref = useRef<THREE.Group>(null!);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const breathe = 1 + Math.sin(t * 1.1) * 0.045;
    ref.current.scale.set(breathe, 1 / breathe ** 0.5, breathe);
    ref.current.rotation.y = Math.sin(t * 0.2) * 0.3 + 0.6;
  });
  return (
    <group position={[4.5, 0.1, -6]}>
      <group ref={ref}>
        <Asset name="octopus" size={2.6} />
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* The deep floor — wreck, ruins, treasure; it rises to meet you       */
/* ------------------------------------------------------------------ */

export function DeepFloor() {
  const ref = useRef<THREE.Group>(null!);
  const ember = useRef<THREE.PointLight>(null!);

  useFrame((state) => {
    const p = oceanState.progress;
    const g = ref.current;
    const visible = p > 0.74;
    g.visible = visible;
    if (!visible) return;
    g.position.y = Math.min(remap(p, 0.74, 0.96, -36, -7.6), -7.6);
    if (ember.current) {
      ember.current.intensity = 1.6 + Math.sin(state.clock.elapsedTime * 3.1) * 0.5;
    }
  });

  return (
    <group ref={ref} visible={false}>
      <SandBed />
      <AssetBoundary>
        <group>
          <Asset name="shipwreck" position={[-8, 0.1, -14]} rotation={[0, 0.9, -0.08]} />
          <Asset name="anchor" position={[-1.5, 0.1, -7]} rotation={[0.15, 1, 0.3]} size={2.4} />
          <Asset name="ruins" position={[10, 0, -15]} rotation={[0, -0.5, 0]} />
          <Asset name="ruins" position={[15.5, 0, -9]} rotation={[0.05, 1.9, 0.06]} size={4.2} />
        </group>
      </AssetBoundary>
      <AssetBoundary>
        <group>
          <Asset name="treasure" position={[3.2, 0.12, -6.5]} rotation={[0, -0.7, 0]} />
          <pointLight
            ref={ember}
            position={[3.2, 1.1, -5.9]}
            color="#ffd27d"
            intensity={1.6}
            distance={6}
            decay={2}
          />
        </group>
      </AssetBoundary>
      <AssetBoundary>
        <group>
          <RockField count={22} spread={[130, 40]} size={[0.8, 3.4]} />
          <Sway position={[-16, 0, -10]} phase={0.7} amp={0.05} speed={0.5}>
            <Asset name="kelp" size={3.2} />
          </Sway>
          <Sway position={[18, 0, -13]} phase={2.9} amp={0.05} speed={0.5}>
            <Asset name="kelp" size={2.8} />
          </Sway>
        </group>
      </AssetBoundary>
    </group>
  );
}
