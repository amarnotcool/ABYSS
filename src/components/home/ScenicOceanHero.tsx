import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { usePrefersReducedMotion } from "@/hooks/useReducedMotion";

/* ------------------------------------------------------------------ */
/* 1. Dynamic 3D Ocean Surface Mesh                                   */
/* ------------------------------------------------------------------ */

function OceanSurface({ mousePos }: { mousePos: { x: number; y: number } }) {
  const meshRef = useRef<THREE.Mesh>(null!);

  // Create plane geometry with vertex grid for wave displacement
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(60, 40, 64, 48);
    geo.rotateX(-Math.PI / 2.2);
    return geo;
  }, []);

  const posAttr = useMemo(() => geometry.attributes.position, [geometry]);
  const originalZ = useMemo(() => {
    const arr = new Float32Array(posAttr.count);
    for (let i = 0; i < posAttr.count; i++) {
      arr[i] = posAttr.getZ(i);
    }
    return arr;
  }, [posAttr]);

  useFrame((state: any) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    const mx = mousePos.x * 1.5;
    const my = mousePos.y * 1.5;

    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);

      // Complex multi-frequency wave formula
      const wave1 = Math.sin(x * 0.25 + t * 1.4) * 0.45;
      const wave2 = Math.cos(y * 0.35 + t * 1.8) * 0.35;
      const wave3 = Math.sin((x + y) * 0.15 + t * 2.2) * 0.25;

      // Interactive mouse ripple effect near center
      const distToMouse = Math.sqrt((x - mx) ** 2 + (y - my) ** 2);
      const mouseRipple = Math.sin(distToMouse * 0.8 - t * 4) * Math.max(0, 0.4 - distToMouse * 0.03);

      posAttr.setZ(i, originalZ[i] + wave1 + wave2 + wave3 + mouseRipple);
    }
    posAttr.needsUpdate = true;
    geometry.computeVertexNormals();
  });

  return (
    <mesh ref={meshRef} geometry={geometry} position={[0, -2.5, -4]}>
      <meshStandardMaterial
        color="#1a6bb0"
        roughness={0.12}
        metalness={0.8}
        emissive="#062b54"
        emissiveIntensity={0.4}
        flatShading={false}
      />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Flocking Seabirds in the Sky                                     */
/* ------------------------------------------------------------------ */

function Bird({ initialPos, speed, scale, delay }: { initialPos: [number, number, number]; speed: number; scale: number; delay: number }) {
  const groupRef = useRef<THREE.Group>(null!);
  const leftWing = useRef<THREE.Mesh>(null!);
  const rightWing = useRef<THREE.Mesh>(null!);

  useFrame((state: any) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime() + delay;

    // Flight motion path
    const x = initialPos[0] + Math.sin(t * speed * 0.4) * 12;
    const y = initialPos[1] + Math.sin(t * speed * 0.8) * 0.8;
    const z = initialPos[2] + Math.cos(t * speed * 0.4) * 4;

    groupRef.current.position.set(x, y, z);
    groupRef.current.rotation.y = Math.cos(t * speed * 0.4) * 0.5 + Math.PI / 2;
    groupRef.current.rotation.z = Math.sin(t * speed * 0.8) * 0.15;

    // Flapping wings
    const flap = Math.sin(t * 12) * 0.6;
    if (leftWing.current) leftWing.current.rotation.z = flap;
    if (rightWing.current) rightWing.current.rotation.z = -flap;
  });

  return (
    <group ref={groupRef} scale={[scale, scale, scale]}>
      {/* Bird Body */}
      <mesh>
        <coneGeometry args={[0.08, 0.4, 4]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {/* Left Wing */}
      <mesh ref={leftWing} position={[-0.15, 0, 0]}>
        <boxGeometry args={[0.3, 0.02, 0.12]} />
        <meshBasicMaterial color="#e0f2fe" />
      </mesh>
      {/* Right Wing */}
      <mesh ref={rightWing} position={[0.15, 0, 0]}>
        <boxGeometry args={[0.3, 0.02, 0.12]} />
        <meshBasicMaterial color="#e0f2fe" />
      </mesh>
    </group>
  );
}

function SeabirdsFlock() {
  const birds = useMemo(
    () => [
      { initialPos: [-8, 4.5, -6] as [number, number, number], speed: 0.8, scale: 0.8, delay: 0 },
      { initialPos: [-5, 5.2, -8] as [number, number, number], speed: 0.7, scale: 0.65, delay: 1.2 },
      { initialPos: [2, 4.8, -5] as [number, number, number], speed: 0.9, scale: 0.75, delay: 2.5 },
      { initialPos: [6, 5.8, -9] as [number, number, number], speed: 0.75, scale: 0.6, delay: 3.8 },
      { initialPos: [-12, 6.0, -10] as [number, number, number], speed: 0.65, scale: 0.5, delay: 4.5 },
    ],
    []
  );

  return (
    <group>
      {birds.map((b, i) => (
        <Bird key={i} {...b} />
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Leaping Dolphins with Water Splash Rings                         */
/* ------------------------------------------------------------------ */

function Dolphin({ delay, offset }: { delay: number; offset: number }) {
  const groupRef = useRef<THREE.Group>(null!);
  const splashRef = useRef<THREE.Mesh>(null!);

  useFrame((state: any) => {
    if (!groupRef.current) return;
    const t = (state.clock.getElapsedTime() + delay) % 7; // Cycle every 7 seconds

    if (t < 2.8) {
      // Jumping arc phase
      const progress = t / 2.8; // 0 to 1
      const x = offset + (progress - 0.5) * 14;
      const y = -2.2 + Math.sin(progress * Math.PI) * 4.2;
      const z = -4 + Math.sin(progress * Math.PI * 2) * 1.5;

      groupRef.current.position.set(x, y, z);
      // Pitch rotation along the arc
      groupRef.current.rotation.z = -(progress - 0.5) * 1.8;
      groupRef.current.visible = true;

      // Water splash animation near entry/exit
      if (splashRef.current) {
        if (progress < 0.15 || progress > 0.85) {
          splashRef.current.position.set(x, -2.3, z);
          const splashProgress = progress < 0.15 ? progress / 0.15 : (1 - progress) / 0.15;
          splashRef.current.scale.set(1 + splashProgress * 2.5, 1, 1 + splashProgress * 2.5);
          (splashRef.current.material as THREE.MeshBasicMaterial).opacity = (1 - splashProgress) * 0.7;
          splashRef.current.visible = true;
        } else {
          splashRef.current.visible = false;
        }
      }
    } else {
      // Underwater resting phase
      groupRef.current.visible = false;
      if (splashRef.current) splashRef.current.visible = false;
    }
  });

  return (
    <>
      <group ref={groupRef} scale={[0.85, 0.85, 0.85]}>
        {/* Streamlined Dolphin Body */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[0.35, 1.8, 12]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.2} metalness={0.6} />
        </mesh>
        {/* Dolphin Snout */}
        <mesh position={[0.95, -0.05, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.12, 0.45, 8]} />
          <meshStandardMaterial color="#7dd3fc" roughness={0.2} />
        </mesh>
        {/* Dorsal Fin */}
        <mesh position={[0.1, 0.35, 0]} rotation={[0, 0, -0.4]}>
          <boxGeometry args={[0.35, 0.45, 0.08]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>
        {/* Flukes / Tail */}
        <mesh position={[-0.9, 0, 0]}>
          <boxGeometry args={[0.12, 0.06, 0.7]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>
      </group>

      {/* Splash Ring */}
      <mesh ref={splashRef} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.4, 0.7, 24]} />
        <meshBasicMaterial color="#bae6fd" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
    </>
  );
}

function DolphinsPod() {
  return (
    <group>
      <Dolphin delay={0} offset={-2} />
      <Dolphin delay={3.5} offset={4} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Horizon Sun & Atmospheric Sky                                   */
/* ------------------------------------------------------------------ */

function SunAndSky({ mousePos }: { mousePos: { x: number; y: number } }) {
  const sunGroupRef = useRef<THREE.Group>(null!);

  useFrame(() => {
    if (!sunGroupRef.current) return;
    sunGroupRef.current.position.x = mousePos.x * 1.2;
    sunGroupRef.current.position.y = mousePos.y * 0.8;
  });

  return (
    <group ref={sunGroupRef}>
      {/* Sun Disc */}
      <mesh position={[0, 3.2, -15]}>
        <circleGeometry args={[2.8, 48]} />
        <meshBasicMaterial color="#fffbeb" />
      </mesh>
      {/* Sun Glow Outer Flare */}
      <mesh position={[0, 3.2, -15.1]}>
        <circleGeometry args={[6.5, 48]} />
        <meshBasicMaterial
          color="#fde047"
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Atmospheric Horizon Light */}
      <directionalLight position={[0, 6, -10]} intensity={2.8} color="#fff7ed" />
      <ambientLight intensity={0.7} color="#38bdf8" />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Main 3D Scenic Ocean Hero Canvas                                   */
/* ------------------------------------------------------------------ */

export function ScenicOceanHero() {
  const reduced = usePrefersReducedMotion();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (reduced) return;
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      setMousePos({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [reduced]);

  if (reduced) return null;

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <Canvas
        camera={{ position: [0, 1.5, 7], fov: 55 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
      >
        <SunAndSky mousePos={mousePos} />
        <OceanSurface mousePos={mousePos} />
        <SeabirdsFlock />
        <DolphinsPod />
      </Canvas>

      {/* Sky & Horizon Atmosphere Gradient Overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, #b0e0fd 0%, #7dd3fc 28%, #38bdf8 45%, rgba(14, 116, 144, 0.4) 65%, rgba(10, 37, 77, 0.95) 100%)",
          mixBlendMode: "normal",
        }}
      />
    </div>
  );
}
