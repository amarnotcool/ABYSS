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
  /** progress band [start, end] with vertical parallax while descending */
  band: [number, number];
  parallax?: number;
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
    const parallax = remap(p, b0, b1, -(c.parallax ?? 9), c.parallax ?? 9);
    const y = c.y0 + parallax + Math.sin(t * (c.bobFreq ?? 0.5) + (c.phase ?? 0)) * (c.bobAmp ?? 0.4);

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
/* Fish school — animated grouper clones behind a wandering leader     */
/* ------------------------------------------------------------------ */

const SCHOOL = Array.from({ length: 9 }, (_, i) => ({
  off: new THREE.Vector3(
    (Math.sin(i * 2.4) - 0.5) * 3.6,
    Math.sin(i * 1.7) * 1.6,
    Math.cos(i * 3.1) * 2.4
  ),
  scale: 0.8 + ((i * 37) % 10) / 18,
  clipOffset: (i * 0.37) % 2,
  wob: 1 + ((i * 13) % 7) / 6,
}));

export function FishSchool() {
  const group = useRef<THREE.Group>(null!);
  const fishRefs = useRef<Array<THREE.Group | null>>([]);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const p = oceanState.progress;
    const visible = p > 0.11 && p < 0.55;
    g.visible = visible;
    if (!visible) return;

    const t = state.clock.elapsedTime;
    // Leader path: broad lissajous sweep
    const a = t * 0.16;
    const lx = Math.sin(a) * 10;
    const lz = -5 + Math.cos(a * 0.7) * 5;
    const ly = remap(p, 0.11, 0.55, -8, 9) + Math.sin(t * 0.4) * 1.2;
    const vx = Math.cos(a) * 10;
    const vz = -Math.sin(a * 0.7) * 0.7 * 5;
    const yaw = Math.atan2(-vz, vx);

    // Pointer position in world at the school's depth
    const vp = state.viewport.getCurrentViewport(state.camera, tmp.set(0, 0, lz));
    const mx = oceanState.mouseX * (vp.width / 2);
    const my = oceanState.mouseY * (vp.height / 2);

    SCHOOL.forEach((f, i) => {
      const fg = fishRefs.current[i];
      if (!fg) return;
      let x = lx + f.off.x + Math.sin(t * f.wob + i) * 0.5;
      let y = ly + f.off.y + Math.cos(t * f.wob * 0.8 + i * 2) * 0.4;
      const z = lz + f.off.z;

      // dart away from the cursor
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
/* Solo swimmers                                                       */
/* ------------------------------------------------------------------ */

export function MantaGlide() {
  const ref = useRef<THREE.Group>(null!);
  useCircuit(ref, {
    rx: 13, rz: 6, y0: 1.5, zc: -10, speed: 0.1, phase: 1.2,
    bobAmp: 0.8, bobFreq: 0.3, band: [0.17, 0.5], parallax: 10,
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
    rx: 9, rz: 4.5, y0: -1, zc: -7, speed: 0.07, phase: 4, dir: -1,
    bobAmp: 0.6, bobFreq: 0.35, band: [0.27, 0.58], parallax: 9,
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
    rx: 12, rz: 7, y0: 0.5, zc: -12, speed: 0.14, phase: 2.6,
    bobAmp: 0.4, bobFreq: 0.45, band: [0.48, 0.74], parallax: 10,
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
    g.position.set(x, 4 + Math.sin(el * Math.PI * 2) * 1.5, -30);
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
    const parallax = remap(p, 0.55, 0.88, -10, 10);
    JELLIES.forEach((j, i) => {
      const jg = refs.current[i];
      if (!jg) return;
      const rise = ((t * 0.3 + j.yOff) % 18) - 9;
      jg.position.set(j.x + Math.sin(t * 0.25 + j.phase) * 1.4, rise + parallax, j.z);
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
    rx: 5, rz: 2.5, y0: -3.2, zc: -8, speed: 0.09, phase: 0.4, dir: -1,
    bobAmp: 0.35, bobFreq: 0.6, band: [0.8, 1.01], parallax: 7,
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
      THREE.MathUtils.lerp(12, 1.2, enter) + Math.sin(t * 0.55) * 0.4,
      -4 + Math.cos(t * 0.17) * 0.6
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
