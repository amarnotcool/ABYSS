import { Canvas } from "@react-three/fiber";
import { OrbitControls, Float } from "@react-three/drei";
import { useState, Suspense } from "react";
import * as THREE from "three";
import { Asset, AssetBoundary } from "../three/assets/Asset";
import { type ModelName } from "../three/assets/registry";
import { Play, Pause, EyeOff, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

const creatureToModel: Record<string, ModelName> = {
  "sea-turtle": "turtle",
  "blue-whale": "whale",
  "octopus": "octopus",
  "hammerhead": "shark",
  "jellyfish": "jellyfish",
  "coral": "coral",
  "stingray": "manta",
  "manta-ray": "manta",
  "anglerfish": "angler",
};

interface CreatureInspector3DProps {
  creatureId: string;
  fallbackSvg: React.ReactNode;
}

export function CreatureInspector3D({ creatureId, fallbackSvg }: CreatureInspector3DProps) {
  const [biolum, setBiolum] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [showGrid, setShowGrid] = useState(true);

  const modelName = creatureToModel[creatureId];
  if (!modelName) {
    return <div className="mx-auto mt-4 h-52 w-full">{fallbackSvg}</div>;
  }

  // Model-specific adjustments in the viewer
  const getModelProps = (name: ModelName) => {
    switch (name) {
      case "whale":
        return { size: 6.5, yPos: 0 };
      case "manta":
        return { size: 5.0, yPos: 0 };
      case "shark":
        return { size: 4.8, yPos: 0 };
      case "jellyfish":
        return { size: 3.5, yPos: -0.5 };
      case "turtle":
        return { size: 4.6, yPos: 0 };
      case "octopus":
        return { size: 4.2, yPos: 0 };
      case "angler":
        return { size: 3.8, yPos: -0.2 };
      case "coral":
        return { size: 5.5, yPos: -1.8 };
      default:
        return { size: 4.5, yPos: 0 };
    }
  };

  const { size, yPos } = getModelProps(modelName);

  const tune = biolum
    ? {
        wireframe: true,
        color: "#00e5ff",
        emissive: "#00e5ff",
        emissiveIntensity: 1.8,
        envMapIntensity: 0.2,
      }
    : {
        envMapIntensity: 1.2,
      };

  return (
    <div className="relative group/inspector flex flex-col items-center select-none w-full mt-6 rounded-3xl border border-glow-mist/10 bg-abyss-950/70 overflow-hidden">
      {/* 3D Viewport wrapper */}
      <div className="relative h-64 md:h-80 w-full cursor-grab active:cursor-grabbing border-b border-glow-mist/10">
        <Suspense
          fallback={
            <div className="absolute inset-0 flex items-center justify-center bg-abyss-950/80">
              <div className="relative h-12 w-12">
                <div className="absolute inset-0 animate-sonar rounded-full border border-glow-cyan/50" />
                <p className="font-mono text-[8px] uppercase tracking-widest text-glow-mist/60 text-center absolute top-14 left-1/2 -translate-x-1/2">
                  Scanning
                </p>
              </div>
            </div>
          }
        >
          <Canvas
            dpr={[1, 1.5]}
            camera={{ position: [0, 1.2, 5.5], fov: 45 }}
            gl={{ antialias: true }}
          >
            <ambientLight intensity={biolum ? 0.08 : 0.45} color={biolum ? "#00e5ff" : "#8ed6ff"} />
            <directionalLight
              position={[5, 8, 5]}
              intensity={biolum ? 0.1 : 2.5}
              color={biolum ? "#00e5ff" : "#eaffff"}
            />
            <pointLight position={[-4, 3, -2]} intensity={biolum ? 1.5 : 0.8} color="#00E5FF" />

            <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.4}>
              <group position={[0, yPos, 0]}>
                <AssetBoundary>
                  <Asset name={modelName} size={size} clipSpeed={speed} tune={tune} />
                </AssetBoundary>
              </group>
            </Float>

            {showGrid && (
              <gridHelper
                args={[10, 10, "rgba(0,229,255,0.45)", "rgba(142,214,255,0.2)"]}
                position={[0, -2, 0]}
              />
            )}

            <OrbitControls
              enableZoom={true}
              maxDistance={10}
              minDistance={3}
              enablePan={false}
              autoRotate={speed === 0 ? false : true}
              autoRotateSpeed={0.8}
            />
          </Canvas>
        </Suspense>

        {/* HUD Overlay inside Viewport */}
        <div className="pointer-events-none absolute bottom-4 left-5 font-mono text-[8px] leading-relaxed tracking-widest text-glow-mist/40">
          <p>SCAN MODE: {biolum ? "BIOLUMINESCENT SCAN" : "STANDARD SPECIES ARCHIVE"}</p>
          <p>ANIMA-TICK RATIO: {speed.toFixed(2)}x</p>
          <p>DEPTH CALIBRATION: ACTIVE</p>
        </div>

        <div className="absolute right-4 top-4 rounded-full bg-abyss-950/60 backdrop-blur-md px-3 py-1 border border-glow-mist/10 font-mono text-[9px] uppercase tracking-widest text-glow-cyan animate-pulse">
          3D Live feed
        </div>
      </div>

      {/* Control bar */}
      <div className="flex flex-wrap items-center justify-between w-full p-4 gap-4 bg-abyss-950/40">
        {/* Speed Adjustment */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            data-cursor="hover"
            onClick={() => setSpeed((s) => (s > 0 ? 0 : 1))}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full border border-slate-400/20 text-slate-300 transition-colors",
              speed === 0
                ? "bg-glow-cyan/10 border-glow-cyan/40 text-glow-ice"
                : "hover:border-glow-cyan/50 hover:text-glow-ice"
            )}
            title={speed === 0 ? "Play animation" : "Pause animation"}
          >
            {speed === 0 ? <Play size={12} fill="currentColor" /> : <Pause size={12} />}
          </button>
          <div className="flex flex-col">
            <span className="font-mono text-[9px] uppercase tracking-widest text-slate-500">
              Motion Engine
            </span>
            <input
              type="range"
              min={0}
              max={2}
              step={0.1}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="h-1 w-20 md:w-28 cursor-pointer appearance-none rounded-full bg-abyss-800 accent-[#00E5FF]"
            />
          </div>
        </div>

        {/* Feature Triggers */}
        <div className="flex items-center gap-2">
          {/* Grid Toggle */}
          <button
            type="button"
            data-cursor="hover"
            onClick={() => setShowGrid((g) => !g)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-400/20 text-[10px] font-mono uppercase tracking-widest transition-all",
              showGrid
                ? "border-glow-cyan/45 bg-glow-cyan/5 text-glow-ice"
                : "text-slate-400 hover:text-white hover:border-glow-mist/40"
            )}
          >
            <LayoutGrid size={11} />
            Grid
          </button>

          {/* Biolum Scan Toggle */}
          <button
            type="button"
            data-cursor="hover"
            onClick={() => setBiolum((b) => !b)}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-mono uppercase tracking-widest transition-all duration-300",
              biolum
                ? "border-glow-cyan/60 bg-glow-cyan/15 text-glow-ice shadow-[0_0_20px_rgba(0,229,255,0.25)] animate-pulse"
                : "border-slate-400/20 text-slate-400 hover:text-white hover:border-glow-mist/40"
            )}
          >
            {biolum ? <EyeOff size={11} /> : <div className="h-1.5 w-1.5 rounded-full bg-glow-cyan animate-ping" />}
            Biolum Scan
          </button>
        </div>
      </div>
    </div>
  );
}
