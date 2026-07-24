import { useRef, useState, useEffect, type MutableRefObject, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, OrbitControls, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { Asset, AssetBoundary } from "../three/assets/Asset";
import { Wrench, Sliders, Volume2, ShieldAlert, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

// Submarine Paint Options
const PAINT_COATINGS = [
  { id: "navy", name: "Titanium Slate", hex: "#1e293b", textureDesc: "Polished matte armor grade alloy" },
  { id: "carbon", name: "Carbon Fiber", hex: "#0a0a0c", textureDesc: "Vacuum-infused high tensile weave" },
  { id: "gold", name: "Hadal Gold", hex: "#eab308", textureDesc: "Corrosion-resistant orange gold glaze" },
  { id: "teal", name: "Biolum Teal", hex: "#06b6d4", textureDesc: "Bioluminescent passive tracking skin" },
  { id: "crimson", name: "Active Crimson", hex: "#dc2626", textureDesc: "High visibility arctic search paint" },
  { id: "cobalt", name: "Cobalt Depth", hex: "#2563eb", textureDesc: "Dual protective hydrostatic enamel" },
];

// Submarine Glow/Trim Colors
const TRIM_COLORS = [
  { id: "cyan", name: "Spectra Cyan", hex: "#00e5ff" },
  { id: "emerald", name: "Thermal Emerald", hex: "#10b981" },
  { id: "lava", name: "Acoustic Ember", hex: "#f97316" },
  { id: "purple", name: "Ultraviolet", hex: "#a855f7" },
];

// Procedural Audio Synthesizer
const playSystemSound = (type: "sonar" | "thruster" | "click") => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === "click") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(900, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.11);
    } else if (type === "sonar") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1080, ctx.currentTime);
      osc.frequency.setValueAtTime(1080, ctx.currentTime + 0.08);
      osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 1.8);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.0);

      const delay = ctx.createDelay();
      delay.delayTime.value = 0.42;
      const delayGain = ctx.createGain();
      delayGain.gain.value = 0.35;

      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.connect(delay);
      delay.connect(delayGain);
      delayGain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 2.2);
    } else if (type === "thruster") {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc1.type = "sawtooth";
      osc1.frequency.setValueAtTime(45, ctx.currentTime);
      osc1.frequency.linearRampToValueAtTime(120, ctx.currentTime + 0.8);
      osc1.frequency.linearRampToValueAtTime(45, ctx.currentTime + 2.5);

      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(47, ctx.currentTime);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(125, ctx.currentTime);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.8);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 2.9);
      osc2.stop(ctx.currentTime + 2.9);
    }
  } catch (e) {
    console.warn("Audio failed to initialize:", e);
  }
};

/* ------------------------------------------------------------------ */
/* Procedural Attachment components                                    */
/* ------------------------------------------------------------------ */

function RoboticClaw({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <group position={[0, -0.6, 2.0]} rotation={[-0.2, 0, 0]}>
      {/* Base shoulder pivot */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.07, 0.07, 0.2, 16]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Upper arm segment */}
      <group position={[0, -0.15, 0.2]} rotation={[0.35, 0, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.05, 0.05, 0.6]} />
          <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.15} />
        </mesh>
        {/* Elbow Joint */}
        <group position={[0, 0, 0.3]} rotation={[-0.6, 0, 0]}>
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          {/* Forearm segment */}
          <group position={[0, 0, 0.25]} rotation={[0.2, 0, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.04, 0.04, 0.45]} />
              <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.15} />
            </mesh>
            {/* Grabber fingers */}
            <group position={[0, 0, 0.22]}>
              <mesh>
                <cylinderGeometry args={[0.045, 0.045, 0.07, 8]} />
                <meshStandardMaterial color="#334155" />
              </mesh>
              {/* Left Claw Prong */}
              <group position={[-0.03, 0, 0.04]} rotation={[0, 0.25, 0]}>
                <mesh castShadow>
                  <boxGeometry args={[0.015, 0.03, 0.1]} />
                  <meshStandardMaterial color="#94a3b8" metalness={0.7} />
                </mesh>
              </group>
              {/* Right Claw Prong */}
              <group position={[0.03, 0, 0.04]} rotation={[0, -0.25, 0]}>
                <mesh castShadow>
                  <boxGeometry args={[0.015, 0.03, 0.1]} />
                  <meshStandardMaterial color="#94a3b8" metalness={0.7} />
                </mesh>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

function PulsingSonar({ active, glowColor }: { active: boolean; glowColor: string }) {
  const ring1 = useRef<THREE.Mesh>(null!);
  const ring2 = useRef<THREE.Mesh>(null!);
  const ring3 = useRef<THREE.Mesh>(null!);

  useFrame((state: any) => {
    if (!active) return;
    const t = state.clock.getElapsedTime();
    const p1 = (t * 0.75) % 1;
    const p2 = (t * 0.75 + 0.33) % 1;
    const p3 = (t * 0.75 + 0.66) % 1;

    if (ring1.current) {
      ring1.current.scale.setScalar(0.3 + p1 * 7);
      (ring1.current.material as THREE.MeshBasicMaterial).opacity = (1 - p1) * 0.55;
    }
    if (ring2.current) {
      ring2.current.scale.setScalar(0.3 + p2 * 7);
      (ring2.current.material as THREE.MeshBasicMaterial).opacity = (1 - p2) * 0.55;
    }
    if (ring3.current) {
      ring3.current.scale.setScalar(0.3 + p3 * 7);
      (ring3.current.material as THREE.MeshBasicMaterial).opacity = (1 - p3) * 0.55;
    }
  });

  return (
    <group position={[0, -1.0, 0.6]}>
      {/* Translucent Domed Pod */}
      {active && (
        <mesh position={[0, -0.1, 0]} castShadow>
          <sphereGeometry args={[0.16, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshPhysicalMaterial
            color={glowColor}
            transparent
            opacity={0.7}
            roughness={0.1}
            transmission={0.6}
            thickness={0.2}
          />
        </mesh>
      )}

      {/* Rings flat grid projection */}
      {active && (
        <group position={[0, -0.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh ref={ring1}>
            <ringGeometry args={[0.95, 1.0, 32]} />
            <meshBasicMaterial color={glowColor} transparent opacity={0.6} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
          <mesh ref={ring2}>
            <ringGeometry args={[0.95, 1.0, 32]} />
            <meshBasicMaterial color={glowColor} transparent opacity={0.4} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
          <mesh ref={ring3}>
            <ringGeometry args={[0.95, 1.0, 32]} />
            <meshBasicMaterial color={glowColor} transparent opacity={0.2} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
        </group>
      )}
    </group>
  );
}

function QuadLightbar({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <group position={[0, 1.0, 0.5]}>
      {/* Riser frame */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.3, 0.08, 0.08]} />
        <meshStandardMaterial color="#1e293b" metalness={0.75} roughness={0.3} />
      </mesh>
      {/* 4 Pods */}
      {[-0.48, -0.16, 0.16, 0.48].map((x, i) => (
        <group key={i} position={[x, 0.07, 0.02]} rotation={[0.2, 0, 0]}>
          {/* Back barrel casing */}
          <mesh castShadow>
            <cylinderGeometry args={[0.075, 0.05, 0.13, 12]} />
            <meshStandardMaterial color="#475569" metalness={0.9} />
          </mesh>
          {/* LED glass lens */}
          <mesh position={[0, 0.065, 0.01]}>
            <sphereGeometry args={[0.048, 8, 8]} />
            <meshBasicMaterial color="#ffffff" toneMapped={false} />
          </mesh>
          {/* SpotLight source */}
          <spotLight
            angle={0.32}
            penumbra={0.65}
            intensity={22}
            distance={16}
            color="#ffffff"
            castShadow
            position={[0, 0.1, 0.1]}
            target-position={[x * 4, -7, 10]}
          />
          {/* Simulated Volumetric Cone mesh */}
          <mesh position={[0, 3.5, 1.7]} rotation={[Math.PI / 2 - 0.4, 0, 0]}>
            <coneGeometry args={[1.0, 8, 16, 1, true]} />
            <meshBasicMaterial
              color="#e8f8ff"
              transparent
              opacity={0.02}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function EngineCoreThruster({ active, glowColor }: { active: boolean; glowColor: string }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  useFrame((state: any) => {
    if (!meshRef.current) return;
    if (active) {
      const oscVal = 1 + Math.sin(state.clock.getElapsedTime() * 32) * 0.16;
      meshRef.current.scale.set(oscVal, oscVal, oscVal * 1.6);
      (meshRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.55 + Math.sin(state.clock.getElapsedTime() * 36) * 0.15;
    } else {
      meshRef.current.scale.setScalar(0.001);
      (meshRef.current.material as THREE.MeshBasicMaterial).opacity = 0;
    }
  });

  return (
    <group position={[-1.78, -0.07, 0]} rotation={[0, 0, -Math.PI / 2]}>
      <mesh ref={meshRef}>
        <coneGeometry args={[0.2, 1.4, 16, 1, false]} />
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* customized submarine assembly floor                                 */
/* ------------------------------------------------------------------ */

interface SubCustomizer3DProps {
  paintHex: string;
  glowHex: string;
  claw: boolean;
  sonar: boolean;
  lights: boolean;
  xray: number;
  coreRunning: boolean;
}

interface MeshCacheItem {
  mesh: THREE.Mesh;
  material: THREE.MeshStandardMaterial;
  isGlass: boolean;
  isLight: boolean;
}

function SubAssembly({ paintHex, glowHex, claw, sonar, lights, xray, coreRunning }: SubCustomizer3DProps) {
  const solidRef = useRef<THREE.Group>(null!);
  const xrayGroupRef = useRef<THREE.Group>(null!);
  const cacheRef = useRef<{
    solid: MeshCacheItem[];
    xray: { mesh: THREE.Mesh; material: THREE.MeshStandardMaterial }[];
  } | null>(null);

  const initializeCache = () => {
    if (!solidRef.current || !xrayGroupRef.current) return false;

    let solidMeshCount = 0;
    solidRef.current.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) solidMeshCount++;
    });
    if (solidMeshCount === 0) return false; // not loaded yet

    const solidItems: MeshCacheItem[] = [];
    solidRef.current.traverse((node) => {
      const mesh = node as THREE.Mesh;
      if (mesh.isMesh && mesh.material) {
        if (!mesh.userData.materialCloned) {
          mesh.material = (mesh.material as THREE.Material).clone();
          mesh.userData.materialCloned = true;
        }
        const mat = mesh.material as THREE.MeshStandardMaterial;
        const isGlass =
          mat.transparent ||
          mat.opacity < 0.85 ||
          mesh.name.toLowerCase().includes("glass") ||
          mesh.name.toLowerCase().includes("window");
        const isLight = mesh.name.toLowerCase().includes("light") || mesh.name.toLowerCase().includes("glow");

        solidItems.push({ mesh, material: mat, isGlass, isLight });
      }
    });

    const xrayItems: { mesh: THREE.Mesh; material: THREE.MeshStandardMaterial }[] = [];
    xrayGroupRef.current.traverse((node) => {
      const mesh = node as THREE.Mesh;
      if (mesh.isMesh && mesh.material) {
        if (!mesh.userData.materialCloned) {
          mesh.material = (mesh.material as THREE.Material).clone();
          mesh.userData.materialCloned = true;
        }
        const mat = mesh.material as THREE.MeshStandardMaterial;
        xrayItems.push({ mesh, material: mat });
      }
    });

    cacheRef.current = { solid: solidItems, xray: xrayItems };
    return true;
  };

  useFrame((state: any) => {
    if (!solidRef.current || !xrayGroupRef.current) return;

    if (!cacheRef.current) {
      if (!initializeCache()) return;
    }

    const { solid, xray: xrayItems } = cacheRef.current!;

    for (let i = 0; i < solid.length; i++) {
      const item = solid[i];
      const mat = item.material;

      if (!item.isGlass && !item.isLight) {
        mat.color.set(paintHex);
        mat.roughness = 0.25;
        mat.metalness = 0.88;
      }

      if (item.isLight) {
        mat.emissive.set(glowHex);
        mat.emissiveIntensity = coreRunning ? 3.5 : 1.3;
      } else {
        if (mat.emissive) {
          mat.emissive.set(glowHex);
          mat.emissiveIntensity = coreRunning ? 1.4 : 0.45;
        }
      }

      mat.transparent = true;
      mat.opacity = item.isGlass ? 1 - xray * 0.95 : 1 - xray * 0.86;
      mat.depthWrite = xray < 0.55;
    }

    for (let i = 0; i < xrayItems.length; i++) {
      const item = xrayItems[i];
      const mat = item.material;
      mat.transparent = true;
      mat.color.set(glowHex);
      mat.emissive.set(glowHex);
      mat.opacity = xray * 0.82;
    }

    xrayGroupRef.current.scale.setScalar(1 + xray * 0.015);
  });

  return (
    <>
      {/* Base Solid hull */}
      <group ref={solidRef}>
        <Asset name="submarine" size={5.4} tune={{ envMapIntensity: 1.3 }} />
      </group>
      {/* Wireframe blueprint shell layer */}
      <group ref={xrayGroupRef}>
        <Asset
          name="submarine"
          size={5.4}
          tune={{
            wireframe: true,
            color: glowHex,
            emissive: glowHex,
            emissiveIntensity: 0.8,
            opacity: 0,
          }}
        />
      </group>

      {/* Procedural upgrades attached on top / bottom hulls */}
      <RoboticClaw active={claw} />
      <PulsingSonar active={sonar} glowColor={glowHex} />
      <QuadLightbar active={lights} />
      <EngineCoreThruster active={coreRunning} glowColor={glowHex} />
    </>
  );
}

export function SubUpgradeLab() {
  const [paint, setPaint] = useState(PAINT_COATINGS[0]);
  const [glow, setGlow] = useState(TRIM_COLORS[0]);
  const [claw, setClaw] = useState(false);
  const [sonar, setSonar] = useState(false);
  const [lights, setLights] = useState(false);
  const [xray, setXray] = useState(0);

  const [coreRunning, setCoreRunning] = useState(false);
  const coreTimeout = useRef<number | null>(null);

  const handleSystemCheck = () => {
    if (coreRunning) return;
    setCoreRunning(true);
    playSystemSound("sonar");
    setTimeout(() => {
      playSystemSound("thruster");
    }, 500);

    coreTimeout.current = window.setTimeout(() => {
      setCoreRunning(false);
    }, 3200);
  };

  useEffect(() => {
    return () => {
      if (coreTimeout.current) clearTimeout(coreTimeout.current);
    };
  }, []);

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* 3D Hangar Bay Screen */}
      <div className="lg:col-span-2 relative flex flex-col justify-end h-[420px] md:h-[550px] rounded-3xl border border-glow-mist/10 bg-abyss-950/60 overflow-hidden card-glow">
        {/* WebGL Canvas */}
        <div className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing">
          <Suspense
            fallback={
              <div className="flex h-full w-full items-center justify-center">
                <div className="h-10 w-10 animate-sonar rounded-full border border-glow-cyan/50" />
              </div>
            }
          >
            <Canvas
              dpr={[1, 1.5]}
              camera={{ position: [5.2, 1.6, 5.8], fov: 42 }}
              gl={{
                antialias: true,
                toneMapping: THREE.ACESFilmicToneMapping,
                toneMappingExposure: 1.15,
              }}
            >
              <ambientLight intensity={coreRunning ? 0.3 : 0.45} color={coreRunning ? glow.hex : "#4A90E2"} />
              <directionalLight position={[6, 8, 4]} intensity={2.8} color="#cfeaff" />
              <directionalLight position={[-6, -4, -4]} intensity={1.1} color="#1F509A" />
              <pointLight position={[-3, 2, 4]} intensity={2} color={glow.hex} />

              <Environment resolution={64} frames={1}>
                <Lightformer intensity={2.2} position={[0, 10, 0]} rotation-x={Math.PI / 2} scale={[25, 25, 1]} color="#cfeaff" />
                <Lightformer intensity={0.8} position={[-8, 2, -6]} scale={[12, 18, 1]} color="#1F509A" />
                <Lightformer intensity={0.6} position={[8, -2, 4]} scale={[10, 14, 1]} color="#0e3f6e" />
              </Environment>

              <Float speed={1.3} rotationIntensity={0.25} floatIntensity={0.6}>
                <group rotation={[0.06, -0.5, 0]}>
                  <AssetBoundary>
                    <SubAssembly
                      paintHex={paint.hex}
                      glowHex={glow.hex}
                      claw={claw}
                      sonar={sonar}
                      lights={lights}
                      xray={xray}
                      coreRunning={coreRunning}
                    />
                  </AssetBoundary>
                </group>
              </Float>

              <OrbitControls
                enableZoom={true}
                maxDistance={12}
                minDistance={3.5}
                enablePan={false}
              />
            </Canvas>
          </Suspense>
        </div>

        {/* Telemetry Text Boxes */}
        <div className="pointer-events-none absolute left-6 top-6 z-10 font-mono text-[9px] uppercase tracking-widest text-glow-mist/40 space-y-1">
          <p>DOCK BAY:Had-3 // ASSEMBLING EREBUS</p>
          <p>HYDROSTATIC COMPRESSION TENSOR: ACTIVE</p>
          <p className={cn("transition-colors duration-300", coreRunning ? "text-glow-cyan animate-pulse" : "")}>
            POWER BLOCK STATUS: {coreRunning ? "CORE DAMPERS OVERLOADED" : "GRID STANDBY"}
          </p>
        </div>

        {/* Action Button HUD */}
        <button
          type="button"
          data-cursor="hover"
          onClick={handleSystemCheck}
          disabled={coreRunning}
          className={cn(
            "absolute right-6 top-6 z-10 flex items-center gap-2 rounded-full border px-5 py-2 font-mono text-[10px] uppercase tracking-widest transition-all duration-300",
            coreRunning
              ? "bg-glow-cyan/20 border-glow-cyan/50 text-glow-ice cursor-wait scale-98 shadow-[0_0_20px_rgba(0,229,255,0.2)]"
              : "border-slate-500/20 bg-abyss-950/60 backdrop-blur text-slate-300 hover:border-glow-cyan/60 hover:text-white"
          )}
        >
          <Cpu className={cn("h-3 w-3", coreRunning ? "animate-spin" : "")} />
          {coreRunning ? "SYSTEM DIAGNOSTIC RUNNING" : "START CORE TEST"}
        </button>

        {/* Hull X-Ray Slider Overlay */}
        <div className="z-10 w-full border-t border-glow-mist/10 bg-abyss-950/75 p-5 md:p-6 backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <Sliders className="h-4 w-4 text-glow-cyan" />
              <span className="font-mono text-[10px] uppercase tracking-widest">HULL FRAME X-RAY</span>
            </div>
            <label className="flex w-full items-center gap-4 sm:w-72">
              <span className="sr-only">Structure transparency</span>
              <span className="font-mono text-[9px] tracking-widest text-glow-mist/50">SOLID</span>
              <input
                type="range"
                min={0}
                max={100}
                value={xray * 100}
                onChange={(e) => {
                  const v = Number(e.target.value) / 100;
                  setXray(v);
                }}
                data-cursor="hover"
                className="h-1 w-full cursor-pointer appearance-none rounded-full bg-abyss-800 accent-[#00E5FF]"
              />
              <span className="font-mono text-[9px] tracking-widest text-glow-mist/50">GRID</span>
            </label>
          </div>
        </div>
      </div>

      {/* Assembly Options Panel */}
      <div className="flex flex-col gap-6 rounded-3xl border border-glow-mist/10 bg-abyss-950/45 p-6 backdrop-blur">
        <div className="flex items-center gap-2 border-b border-glow-mist/10 pb-4">
          <Wrench className="h-5 w-5 text-glow-cyan" />
          <h2 className="font-display text-lg font-medium text-white">Upgrade Bay Specs</h2>
        </div>

        {/* Coating Paint colors */}
        <div className="space-y-3">
          <label className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
            1. Core Hull Coating Color
          </label>
          <div className="flex flex-wrap gap-2.5">
            {PAINT_COATINGS.map((p) => (
              <button
                key={p.id}
                type="button"
                data-cursor="hover"
                onClick={() => {
                  setPaint(p);
                  playSystemSound("click");
                }}
                className={cn(
                  "relative h-7 w-7 rounded-full border transition-all duration-300",
                  paint.id === p.id
                    ? "border-glow-cyan scale-110 shadow-[0_0_12px_rgba(0,229,255,0.4)]"
                    : "border-slate-500/25 hover:scale-105"
                )}
                style={{ backgroundColor: p.hex }}
                title={p.name}
              >
                {paint.id === p.id && (
                  <span className="absolute inset-0.5 rounded-full border border-white/40" />
                )}
              </button>
            ))}
          </div>
          <p className="font-mono text-[9px] leading-relaxed text-slate-500">{paint.name} — {paint.textureDesc}</p>
        </div>

        {/* Emissive Trims */}
        <div className="space-y-3">
          <label className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
            2. Cabin Light & Power Trim
          </label>
          <div className="flex flex-wrap gap-2.5">
            {TRIM_COLORS.map((t) => (
              <button
                key={t.id}
                type="button"
                data-cursor="hover"
                onClick={() => {
                  setGlow(t);
                  playSystemSound("click");
                }}
                className={cn(
                  "relative h-7 w-7 rounded-full border transition-all duration-300",
                  glow.id === t.id
                    ? "border-glow-cyan scale-110 shadow-[0_0_12px_rgba(0,229,255,0.4)]"
                    : "border-slate-500/25 hover:scale-105"
                )}
                style={{ backgroundColor: t.hex }}
                title={t.name}
              >
                {glow.id === t.id && (
                  <span className="absolute inset-0.5 rounded-full border border-white/40" />
                )}
              </button>
            ))}
          </div>
          <p className="font-mono text-[9px] leading-relaxed text-slate-500">Trim color affects search beams, thruster flames & status rings.</p>
        </div>

        {/* Modular Attachment Toggles */}
        <div className="space-y-4 pt-2">
          <label className="font-mono text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
            3. Exterior Hardware Slots
          </label>

          {/* Grabber Arm upgrade */}
          <div className="flex items-center justify-between p-3 rounded-2xl border border-glow-mist/8 bg-abyss-950/30">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-white">Hydraulic Robotic Arm</span>
              <span className="font-mono text-[8px] text-slate-500">Procedural dual-prong titan claw</span>
            </div>
            <button
              type="button"
              data-cursor="hover"
              onClick={() => {
                setClaw((c) => !c);
                playSystemSound("click");
              }}
              className={cn(
                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                claw ? "bg-glow-cyan" : "bg-abyss-800"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                  claw ? "translate-x-4" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {/* Sonar Sensor Dome */}
          <div className="flex items-center justify-between p-3 rounded-2xl border border-glow-mist/8 bg-abyss-950/30">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-white">Active Sonar Transducer</span>
              <span className="font-mono text-[8px] text-slate-500">Pulsing telemetry echoes scan grid</span>
            </div>
            <button
              type="button"
              data-cursor="hover"
              onClick={() => {
                setSonar((s) => !s);
                playSystemSound("click");
              }}
              className={cn(
                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                sonar ? "bg-glow-cyan" : "bg-abyss-800"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                  sonar ? "translate-x-4" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {/* Quad Spotlight Bar */}
          <div className="flex items-center justify-between p-3 rounded-2xl border border-glow-mist/8 bg-abyss-950/30">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-white">Navigation Quad Lightbar</span>
              <span className="font-mono text-[8px] text-slate-500">Top-mounted quad spotlight pod structure</span>
            </div>
            <button
              type="button"
              data-cursor="hover"
              onClick={() => {
                setLights((l) => !l);
                playSystemSound("click");
              }}
              className={cn(
                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                lights ? "bg-glow-cyan" : "bg-abyss-800"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                  lights ? "translate-x-4" : "translate-x-0"
                )}
              />
            </button>
          </div>
        </div>

        {/* Warning Indicator */}
        <div className="flex items-start gap-2.5 p-3 rounded-2xl border border-yellow-500/15 bg-yellow-500/5 mt-auto">
          <ShieldAlert className="h-4 w-4 text-yellow-500/80 shrink-0 mt-0.5" />
          <p className="font-mono text-[8.5px] leading-relaxed text-yellow-500/75 uppercase tracking-wide">
            WARNING: Mission attachments must verify battery weight limits before launching to Hadal depths.
          </p>
        </div>
      </div>
    </div>
  );
}
