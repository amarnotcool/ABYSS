import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Asset, AssetBoundary } from "../assets/Asset";
import { oceanState } from "@/lib/oceanState";
import { remap, clamp } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Shared swim-circuit motion                                          */
/* All models are normalized so their nose points +X at yaw 0.         */
/* ------------------------------------------------------------------ */

interface Circuit {
  rx: number;
  rz: number;
  y0: number;
  zc: number;
  speed: number;
  phase?: number;
  dir?: 1 | -1;
  bobAmp?: number;
  bobFreq?: number;
  /** progress band [start, end] for visibility culling */
  band: [number, number];
}

function useCircuit(ref: React.RefObject<THREE.Group>, c: Circuit) {
  const prevYaw = useRef(0);
  useFrame((state) => {
    const g = ref.current;
    if (!g) return;
    const p = oceanState.progress;
    const [b0, b1] = c.band;
    const visible = p > b0 - 0.03 && p < b1 + 0.03;
    g.visible = visible;
    if (!visible) return;

    const t = state.clock.elapsedTime;
    const dir = c.dir ?? 1;
    const a = (c.phase ?? 0) + t * c.speed * dir;

    const x = Math.cos(a) * c.rx;
    const z = c.zc + Math.sin(a) * c.rz;
    const y = c.y0 + Math.sin(t * (c.bobFreq ?? 0.5) + (c.phase ?? 0)) * (c.bobAmp ?? 0.4);

    const vx = -Math.sin(a) * c.rx * c.speed * dir;
    const vz = Math.cos(a) * c.rz * c.speed * dir;
    const yaw = Math.atan2(-vz, vx);

    let dYaw = yaw - prevYaw.current;
    if (dYaw > Math.PI) dYaw -= Math.PI * 2;
    if (dYaw < -Math.PI) dYaw += Math.PI * 2;
    prevYaw.current = yaw;

    g.position.set(x, y, z);
    g.rotation.set(0, yaw, clamp(-dYaw * 30, -0.45, 0.45));
  });
}

/* ------------------------------------------------------------------ */
/* Pseudo-random number generator (deterministic, seed-based)          */
/* ------------------------------------------------------------------ */

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/* ------------------------------------------------------------------ */
/* Dense fish school — 30 fish in a big swarming shoal                 */
/* ------------------------------------------------------------------ */

const SCHOOL = Array.from({ length: 30 }, (_, i) => ({
  off: new THREE.Vector3(
    (Math.sin(i * 1.4) - 0.5) * 6.5,
    Math.sin(i * 1.1) * 3.0,
    Math.cos(i * 2.1) * 4.5
  ),
  scale: 0.65 + ((i * 37) % 10) / 14,
  clipOffset: (i * 0.27) % 2,
  wob: 0.8 + ((i * 13) % 9) / 5,
}));

export function FishSchool() {
  const group = useRef<THREE.Group>(null!);
  const fishRefs = useRef<Array<THREE.Group | null>>([]);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const p = oceanState.progress;
    const visible = p > 0.06 && p < 0.55;
    g.visible = visible;
    if (!visible) return;

    const t = state.clock.elapsedTime;
    const a = t * 0.16;
    const lx = Math.sin(a) * 13;
    const lz = -5 + Math.cos(a * 0.7) * 7;
    const ly = -75 + Math.sin(t * 0.4) * 1.5;
    const vx = Math.cos(a) * 13;
    const vz = -Math.sin(a * 0.7) * 0.7 * 7;
    const yaw = Math.atan2(-vz, vx);

    const vp = state.viewport.getCurrentViewport(state.camera, tmp.set(0, 0, lz));
    const mx = oceanState.mouseX * (vp.width / 2);
    const my = oceanState.mouseY * (vp.height / 2);

    SCHOOL.forEach((f, i) => {
      const fg = fishRefs.current[i];
      if (!fg) return;
      let x = lx + f.off.x + Math.sin(t * f.wob + i) * 0.6;
      let y = ly + f.off.y + Math.cos(t * f.wob * 0.8 + i * 2) * 0.5;
      const z = lz + f.off.z;

      const dx = x - mx;
      const dy = y - my;
      const d = Math.hypot(dx, dy);
      if (d < 3.4 && d > 0.001) {
        const push = ((3.4 - d) / 3.4) * 2.4;
        x += (dx / d) * push;
        y += (dy / d) * push;
      }

      fg.position.set(x, y, z);
      fg.rotation.y = yaw + Math.sin(t * 1.3 + i) * 0.12;
    });
  });

  return (
    <group ref={group} visible={false}>
      {SCHOOL.map((f, i) => (
        <group key={i} ref={(el) => (fishRefs.current[i] = el)}>
          <AssetBoundary>
            <Asset name="fish" size={1.05 * f.scale} clipSpeed={1.15} clipOffset={f.clipOffset} />
          </AssetBoundary>
        </group>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Second school — smaller fish at a different depth band               */
/* ------------------------------------------------------------------ */

const NEON_SCHOOL = Array.from({ length: 18 }, (_, i) => ({
  off: new THREE.Vector3(
    (Math.sin(i * 2.1) - 0.5) * 5.0,
    Math.sin(i * 1.6) * 2.2,
    Math.cos(i * 2.8) * 3.5
  ),
  scale: 0.5 + ((i * 23) % 10) / 18,
  clipOffset: (i * 0.43) % 2,
  wob: 1.0 + ((i * 17) % 7) / 5,
}));

export function NeonSchool() {
  const group = useRef<THREE.Group>(null!);
  const fishRefs = useRef<Array<THREE.Group | null>>([]);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const p = oceanState.progress;
    const visible = p > 0.12 && p < 0.50;
    g.visible = visible;
    if (!visible) return;

    const t = state.clock.elapsedTime;
    const a = t * 0.2 + 3.0;
    const lx = Math.sin(a) * 10;
    const lz = -7 + Math.cos(a * 0.6) * 5;
    const ly = -95 + Math.sin(t * 0.5 + 1.0) * 1.2;
    const vx = Math.cos(a) * 10;
    const vz = -Math.sin(a * 0.6) * 0.6 * 5;
    const yaw = Math.atan2(-vz, vx);

    NEON_SCHOOL.forEach((f, i) => {
      const fg = fishRefs.current[i];
      if (!fg) return;
      const x = lx + f.off.x + Math.sin(t * f.wob + i) * 0.5;
      const y = ly + f.off.y + Math.cos(t * f.wob * 0.7 + i * 2) * 0.4;
      const z = lz + f.off.z;
      fg.position.set(x, y, z);
      fg.rotation.y = yaw + Math.sin(t * 1.1 + i) * 0.15;
    });
  });

  return (
    <group ref={group} visible={false}>
      {NEON_SCHOOL.map((f, i) => (
        <group key={i} ref={(el) => (fishRefs.current[i] = el)}>
          <AssetBoundary>
            <Asset name="fish" size={0.7 * f.scale} clipSpeed={1.3} clipOffset={f.clipOffset} />
          </AssetBoundary>
        </group>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Scattered random fish — 20 solo fish on randomized circuits         */
/* spread throughout the entire ocean from surface to deep             */
/* ------------------------------------------------------------------ */

const RAND = seededRandom(42);

const SCATTERED_FISH: Circuit[] = Array.from({ length: 20 }, (_, i) => {
  const r = () => RAND();
  // Distribute fish across the full depth range
  // Map i to a progress band so fish appear at all depths
  const depthSlot = i / 20;
  const bandCenter = 0.05 + depthSlot * 0.85;
  const bandWidth = 0.08 + r() * 0.08;
  // Y position: map progress band to approximate world Y
  const y0 = -(bandCenter * 245) + (r() - 0.5) * 15;

  return {
    rx: 4 + r() * 10,
    rz: 2 + r() * 6,
    y0,
    zc: -4 - r() * 12,
    speed: 0.06 + r() * 0.14,
    phase: r() * Math.PI * 2,
    dir: (r() > 0.5 ? 1 : -1) as 1 | -1,
    bobAmp: 0.3 + r() * 0.6,
    bobFreq: 0.3 + r() * 0.4,
    band: [
      Math.max(0, bandCenter - bandWidth),
      Math.min(1.0, bandCenter + bandWidth),
    ] as [number, number],
  };
});

function RandomFish({ circuit, index }: { circuit: Circuit; index: number }) {
  const ref = useRef<THREE.Group>(null!);
  useCircuit(ref, circuit);
  const scale = 0.7 + ((index * 31) % 10) / 12;
  return (
    <group ref={ref} visible={false}>
      <AssetBoundary>
        <Asset
          name="fish"
          size={1.1 * scale}
          clipSpeed={0.9 + ((index * 7) % 5) / 10}
          clipOffset={(index * 0.53) % 2}
        />
      </AssetBoundary>
    </group>
  );
}

export function ScatteredReefFish() {
  return (
    <>
      {SCATTERED_FISH.map((c, i) => (
        <RandomFish key={i} circuit={c} index={i} />
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Solo swimmers                                                       */
/* ------------------------------------------------------------------ */

export function MantaGlide() {
  const ref = useRef<THREE.Group>(null!);
  useCircuit(ref, {
    rx: 13, rz: 6, y0: -80, zc: -10, speed: 0.1, phase: 1.2,
    bobAmp: 0.8, bobFreq: 0.3, band: [0.17, 0.5],
  });
  return (
    <group ref={ref} visible={false}>
      <AssetBoundary>
        <Asset name="manta" clipSpeed={0.8} />
      </AssetBoundary>
    </group>
  );
}

export function TurtleGlide() {
  const ref = useRef<THREE.Group>(null!);
  useCircuit(ref, {
    rx: 9, rz: 4.5, y0: -105, zc: -7, speed: 0.07, phase: 4, dir: -1,
    bobAmp: 0.6, bobFreq: 0.35, band: [0.27, 0.58],
  });
  return (
    <group ref={ref} visible={false}>
      <AssetBoundary>
        <Asset name="turtle" />
      </AssetBoundary>
    </group>
  );
}

export function SharkPatrol() {
  const ref = useRef<THREE.Group>(null!);
  useCircuit(ref, {
    rx: 12, rz: 7, y0: -150, zc: -12, speed: 0.14, phase: 2.6,
    bobAmp: 0.4, bobFreq: 0.45, band: [0.48, 0.74],
  });
  return (
    <group ref={ref} visible={false}>
      <AssetBoundary>
        <Asset name="shark" clipSpeed={0.9} />
      </AssetBoundary>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Whale — a slow leviathan crossing, plus rare surprise passes        */
/* ------------------------------------------------------------------ */

export function WhaleCrossing() {
  const ref = useRef<THREE.Group>(null!);
  const pass = useRef({ active: false, start: 0, forced: false });

  useFrame((state) => {
    const g = ref.current;
    if (!g) return;
    const p = oceanState.progress;
    const t = state.clock.elapsedTime;
    const s = pass.current;

    // guarantee one majestic pass through the deep band
    if (!s.active && !s.forced && p > 0.6 && p < 0.9) {
      s.active = true;
      s.forced = true;
      s.start = t;
    }
    // occasional ambient pass while mid-ocean
    if (!s.active && p > 0.2 && p < 0.9 && Math.random() < 0.0006) {
      s.active = true;
      s.start = t;
    }

    if (!s.active) {
      g.visible = false;
      return;
    }
    const el = (t - s.start) / 46; // 46s crossing
    if (el >= 1) {
      s.active = false;
      g.visible = false;
      return;
    }
    g.visible = true;
    const x = THREE.MathUtils.lerp(-55, 55, el);
    g.position.set(x, -190 + Math.sin(el * Math.PI * 2) * 1.5, -30);
    g.rotation.set(0, 0, Math.sin(t * 0.3) * 0.03);
  });

  return (
    <group ref={ref} visible={false}>
      <AssetBoundary>
        <Asset name="whale" clipSpeed={0.55} />
      </AssetBoundary>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Jellyfish bloom — glowing drifters in the midnight band             */
/* ------------------------------------------------------------------ */

const JELLIES = Array.from({ length: 7 }, (_, i) => ({
  x: ((i * 53) % 24) - 12,
  z: -6 - ((i * 31) % 10),
  yOff: (i * 41) % 15,
  phase: i * 1.13,
  scale: 0.75 + ((i * 29) % 10) / 12,
}));

export function JellyfishField() {
  const group = useRef<THREE.Group>(null!);
  const refs = useRef<Array<THREE.Group | null>>([]);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const p = oceanState.progress;
    const visible = p > 0.55 && p < 0.88;
    g.visible = visible;
    if (!visible) return;

    const t = state.clock.elapsedTime;
    JELLIES.forEach((j, i) => {
      const jg = refs.current[i];
      if (!jg) return;
      const rise = ((t * 0.3 + j.yOff) % 18) - 9;
      jg.position.set(j.x + Math.sin(t * 0.25 + j.phase) * 1.4, -175 + rise, j.z);
      const pulse = 1 + Math.sin(t * 1.9 + j.phase) * 0.12;
      jg.scale.set(j.scale * (2 - pulse) * 0.9, j.scale * pulse, j.scale * (2 - pulse) * 0.9);
      jg.rotation.y = t * 0.1 + j.phase;
    });
  });

  return (
    <group ref={group} visible={false}>
      {JELLIES.map((j, i) => (
        <group key={i} ref={(el) => (refs.current[i] = el)}>
          <AssetBoundary>
            <Asset
              name="jellyfish"
              tune={{ emissive: "#19c9e8", emissiveIntensity: 1.4, envMapIntensity: 0.4, opacity: 0.9 }}
            />
          </AssetBoundary>
        </group>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Anglerfish — lurking near the floor with a burning lure             */
/* ------------------------------------------------------------------ */

export function AnglerLurk() {
  const ref = useRef<THREE.Group>(null!);
  const lure = useRef<THREE.PointLight>(null!);
  useCircuit(ref, {
    rx: 5, rz: 2.5, y0: -225, zc: -8, speed: 0.09, phase: 0.4, dir: -1,
    bobAmp: 0.35, bobFreq: 0.6, band: [0.8, 1.01],
  });

  useFrame((state) => {
    if (lure.current) {
      lure.current.intensity = 3.2 + Math.sin(state.clock.elapsedTime * 2.2) * 1.1;
    }
  });

  return (
    <group ref={ref} visible={false}>
      <AssetBoundary>
        <Asset name="angler" clipSpeed={0.7} />
      </AssetBoundary>
      <pointLight ref={lure} position={[1.1, 0.55, 0]} color="#7DF9FF" intensity={3.2} distance={7} decay={2} />
      <mesh position={[1.1, 0.55, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#d9fbff" toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* The DSV Erebus — GLB submarine escort with a working searchlight    */
/* ------------------------------------------------------------------ */

export function SubmarineEscort() {
  const ref = useRef<THREE.Group>(null!);
  const spot = useRef<THREE.SpotLight>(null!);
  const spotTarget = useRef<THREE.Object3D>(null!);

  useFrame((state) => {
    const g = ref.current;
    if (!g) return;
    const p = oceanState.progress;
    const t = state.clock.elapsedTime;
    const enter = remap(p, 0.42, 0.54, 0, 1);
    const exit = remap(p, 0.95, 1.0, 1, 0);
    const presence = enter * exit;
    g.visible = presence > 0.01;
    if (!g.visible) return;

    g.position.set(
      3.6 + Math.sin(t * 0.22) * 0.8,
      state.camera.position.y - 1.2 + Math.sin(t * 0.55) * 0.4,
      -8 + Math.cos(t * 0.17) * 0.6
    );
    g.rotation.set(
      oceanState.mouseY * 0.05 + Math.sin(t * 0.4) * 0.03,
      Math.PI + oceanState.mouseX * 0.15,
      Math.sin(t * 0.33) * 0.05 - 0.06
    );

    if (spot.current && spotTarget.current) {
      spotTarget.current.position.set(6 + oceanState.mouseX * 3, -3 + oceanState.mouseY * 2, 0);
      spot.current.target = spotTarget.current;
    }
  });

  return (
    <group ref={ref} visible={false}>
      <AssetBoundary>
        <Asset name="submarine" tune={{ envMapIntensity: 1.1 }} />
      </AssetBoundary>
      {/* Searchlight — light + visible volumetric cone */}
      <spotLight
        ref={spot}
        position={[3.4, -0.2, 0]}
        angle={0.42}
        penumbra={0.7}
        intensity={65}
        distance={26}
        decay={1.6}
        color="#bfe9ff"
      />
      <object3D ref={spotTarget} position={[8, -3, 0]} />
      <mesh position={[6.2, -1.4, 0]} rotation={[0, 0, Math.PI / 2 + 0.38]}>
        <coneGeometry args={[1.9, 8.5, 24, 1, true]} />
        <meshBasicMaterial
          color="#9fd8ff"
          transparent
          opacity={0.028}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <pointLight position={[2.2, 0.4, 1]} intensity={2} distance={8} color="#8ED6FF" />
    </group>
  );
}
