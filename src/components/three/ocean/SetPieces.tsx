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

export function AbyssalTrench() {
  return (
    <group>
      {/* 
        Stack massive cliffs to form a deep canyon.
        Left wall — pushed further out so the submarine doesn't clip
      */}
      {[-40, -100, -160, -220].map((y, i) => (
        <group key={`L-${i}`} position={[-42, y, -25]} scale={[1.3, 2.5, 2.0]} rotation={[0, 0.4 + i * 0.2, 0]}>
          <Asset name="cliff" />
        </group>
      ))}
      
      {/* Right wall */}
      {[-50, -110, -170, -230].map((y, i) => (
        <group key={`R-${i}`} position={[42, y, -20]} scale={[1.3, 2.5, 2.0]} rotation={[0, -0.7 - i * 0.1, 0]}>
          <Asset name="cliff" />
        </group>
      ))}

      {/* The Deep Floor (Laid flat) */}
      <group position={[0, -252, -15]} scale={[3.0, 1.0, 3.0]} rotation={[-Math.PI / 2, 0, 0]}>
        <Asset name="cliff" />
      </group>
      <group position={[-10, -255, -45]} scale={[4.0, 1.0, 3.0]} rotation={[-Math.PI / 2, 0, 1.5]}>
        <Asset name="cliff" />
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* The Seabed — visible sandy floor at descent terminus (y ≈ -250)     */
/* Ensures the scroll terminates visually with a definite ground.      */
/* ------------------------------------------------------------------ */

export function Seabed() {
  const ref = useRef<THREE.Group>(null!);

  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    // Only show when approaching the floor
    g.visible = oceanState.progress > 0.65;
  });

  return (
    <group ref={ref} position={[0, -253, -15]} visible={false}>
      {/* Main sandy seabed plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial
          color="#0a1520"
          roughness={0.95}
          metalness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Secondary darker plane slightly below to prevent see-through */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[300, 300]} />
        <meshBasicMaterial color="#020810" side={THREE.DoubleSide} />
      </mesh>

      {/* Subtle sandy undulations via bumped planes */}
      {[
        [-20, 0.1, -10, 40, 0.3],
        [15, 0.15, 5, 35, -0.5],
        [-5, 0.05, -25, 50, 0.8],
      ].map(([x, yOff, z, size, rot], i) => (
        <mesh
          key={i}
          position={[x, yOff as number, z]}
          rotation={[-Math.PI / 2, 0, rot as number]}
        >
          <circleGeometry args={[size as number, 16]} />
          <meshStandardMaterial
            color="#0e1d2a"
            roughness={1.0}
            metalness={0.0}
            transparent
            opacity={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Coral reefs affixed on the seabed */}
      <AssetBoundary>
        <group>
          <Asset name="coral" position={[-18, 0.5, -8]} size={8} rotation={[0, 1.2, 0]} />
          <Asset name="coral" position={[22, 0.5, -12]} size={6.5} rotation={[0, 3.1, 0]} />
          <Asset name="coral" position={[-8, 0.5, 10]} size={5.5} rotation={[0, 0.5, 0]} />
          <Asset name="coral" position={[10, 0.5, -25]} size={7} rotation={[0, 2.3, 0]} />
          <Asset name="coral" position={[-25, 0.5, -20]} size={4.5} rotation={[0, 4.5, 0]} />
        </group>
      </AssetBoundary>

      {/* Scattered rocks on the seabed */}
      <AssetBoundary>
        <group>
          <Asset name="rocks" position={[-12, 0.2, -5]} size={2.5} rotation={[0, 0.8, 0]} />
          <Asset name="rocks" position={[8, 0.2, -18]} size={3.0} rotation={[0, 2.1, 0]} />
          <Asset name="rocks" position={[18, 0.2, 5]} size={2.0} rotation={[0, 1.5, 0]} />
        </group>
      </AssetBoundary>

      {/* Seaweed at the seabed edges */}
      <AssetBoundary>
        <group>
          <Sway position={[-15, 0.5, -6]} phase={0.3} amp={0.04} speed={0.5}>
            <Asset name="kelp" size={3.0} />
          </Sway>
          <Sway position={[12, 0.5, -14]} phase={1.8} amp={0.04} speed={0.5}>
            <Asset name="kelp" size={2.6} />
          </Sway>
          <Sway position={[-22, 0.5, 8]} phase={3.1} amp={0.04} speed={0.5}>
            <Asset name="seaweed" size={2.0} />
          </Sway>
        </group>
      </AssetBoundary>
    </group>
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
  });

  return (
    <group ref={ref} position={[0, -110, 0]} visible={false}>
      {/* Anchor Corals to the trench ledges instead of the flat sand */}
      <AssetBoundary>
        <group>
          {/* Left ledge corals */}
          <Asset name="coral" position={[-16, 8, -12]} size={13} rotation={[0.2, 0.8, -0.1]} />
          <Asset name="coral" position={[-12, 4, -16]} size={7.5} rotation={[0, 4, 0]} />
          {/* Right ledge corals */}
          <Asset name="coral" position={[18, 5, -15]} size={9.5} rotation={[-0.1, 2.2, 0.1]} />
        </group>
      </AssetBoundary>
      <AssetBoundary>
        <group>
          <Sway position={[-14, 5, -8]} phase={0}>
            <Asset name="kelp" size={5} />
          </Sway>
          <Sway position={[-17.5, 7, -12]} phase={1.4} amp={0.09}>
            <Asset name="kelp" size={3.6} />
          </Sway>
          <Sway position={[15, 3, -9]} phase={2.2}>
            <Asset name="kelp" size={4.4} />
          </Sway>
        </group>
      </AssetBoundary>
      {/* Resident octopus, breathing on a left ledge */}
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
    <group position={[-13, 8.5, -10]} rotation={[0, 0.8, -0.15]}>
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
    if (ember.current) {
      ember.current.intensity = 1.6 + Math.sin(state.clock.elapsedTime * 3.1) * 0.5;
    }
  });

  return (
    <group ref={ref} position={[0, -245, 0]} visible={false}>
      {/* Wreck and ruins scattered on the trench floor */}
      <AssetBoundary>
        <group>
          <Asset name="shipwreck" position={[-4, 0.5, -18]} rotation={[0, 0.6, -0.15]} />
          <Asset name="anchor" position={[-1.5, 0.1, -7]} rotation={[0.15, 1, 0.3]} size={2.4} />
          <Asset name="ruins" position={[8, -0.5, -15]} rotation={[0.1, -0.5, 0.1]} />
        </group>
      </AssetBoundary>
      <AssetBoundary>
        <group>
          <Asset name="treasure" position={[3.2, 0.5, -6.5]} rotation={[0.1, -0.7, 0]} />
          <pointLight
            ref={ember}
            position={[3.2, 1.5, -5.9]}
            color="#ffd27d"
            intensity={1.6}
            distance={10}
            decay={2}
          />
        </group>
      </AssetBoundary>
      <AssetBoundary>
        <group>
          <Sway position={[-12, 1, -12]} phase={0.7} amp={0.05} speed={0.5}>
            <Asset name="kelp" size={3.2} />
          </Sway>
          <Sway position={[14, 1, -15]} phase={2.9} amp={0.05} speed={0.5}>
            <Asset name="kelp" size={2.8} />
          </Sway>
        </group>
      </AssetBoundary>
    </group>
  );
}
