import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { usePrefersReducedMotion } from "@/hooks/useReducedMotion";
import { oceanState } from "@/lib/oceanState";
import { Asset } from "../three/assets/Asset";

/* ------------------------------------------------------------------ */
/* 1. GPU Gerstner Wave Water Surface                                  */
/* ------------------------------------------------------------------ */

const waterVertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying vec2 vUv;

  // Gerstner Wave function
  vec3 gerstnerWave(vec3 p, vec2 dir, float steepness, float wavelength, float speed, inout vec3 tangent, inout vec3 binormal) {
    float k = 2.0 * 3.14159265 / wavelength;
    float c = sqrt(9.8 / k);
    vec2 d = normalize(dir);
    float f = k * (dot(d, p.xz) - c * speed * uTime);
    float a = steepness / k;

    tangent += vec3(
      -d.x * d.x * (steepness * sin(f)),
      d.x * (steepness * cos(f)),
      -d.x * d.y * (steepness * sin(f))
    );
    binormal += vec3(
      -d.x * d.y * (steepness * sin(f)),
      d.y * (steepness * cos(f)),
      -d.y * d.y * (steepness * sin(f))
    );

    return vec3(
      d.x * (a * cos(f)),
      a * sin(f),
      d.y * (a * cos(f))
    );
  }

  void main() {
    vUv = uv;
    vec3 gridPoint = position;
    vec3 tangent = vec3(1.0, 0.0, 0.0);
    vec3 binormal = vec3(0.0, 0.0, 1.0);
    vec3 p = gridPoint;

    // Interactive mouse displacement ripple
    float distToMouse = length(p.xz - uMouse * 12.0);
    float mouseRipple = sin(distToMouse * 2.0 - uTime * 6.0) * exp(-distToMouse * 0.25) * 0.25;

    // Sum of 4 Gerstner waves
    p += gerstnerWave(gridPoint, vec2(1.0, 0.3), 0.18, 12.0, 1.2, tangent, binormal);
    p += gerstnerWave(gridPoint, vec2(0.6, 0.8), 0.12, 6.0, 1.5, tangent, binormal);
    p += gerstnerWave(gridPoint, vec2(-0.7, 0.5), 0.08, 3.5, 2.0, tangent, binormal);
    p += gerstnerWave(gridPoint, vec2(0.2, -1.0), 0.05, 1.8, 2.8, tangent, binormal);
    p.y += mouseRipple;

    vec3 calcNormal = normalize(cross(binormal, tangent));
    vNormal = normalMatrix * calcNormal;

    vec4 worldPosition = modelMatrix * vec4(p, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const waterFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uSunDirection;
  uniform vec3 uSunColor;
  uniform vec3 uWaterColor;
  uniform vec3 uDeepWaterColor;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying vec2 vUv;

  void main() {
    vec3 worldNormal = normalize(vNormal);
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);

    // Fresnel reflection
    float fresnel = pow(1.0 - max(0.0, dot(viewDir, worldNormal)), 4.0);

    // Sun specular glint
    vec3 halfVector = normalize(uSunDirection + viewDir);
    float NdotH = max(0.0, dot(worldNormal, halfVector));
    float specular = pow(NdotH, 180.0) * 4.5;

    // Foam glitter highlights on wave crests
    float waveCrest = smoothstep(0.12, 0.4, vWorldPosition.y);
    float foamNoise = sin(vWorldPosition.x * 20.0 + uTime * 4.0) * cos(vWorldPosition.z * 20.0 - uTime * 3.0);
    vec3 foamColor = vec3(0.95, 0.98, 1.0) * waveCrest * max(0.0, foamNoise) * 0.4;

    // Base water color gradient
    vec3 waterCol = mix(uDeepWaterColor, uWaterColor, fresnel * 0.7 + 0.3);
    vec3 finalColor = waterCol + (uSunColor * specular) + foamColor;

    // Distance haze blend to horizon
    float dist = length(vWorldPosition - cameraPosition);
    float fogFactor = smoothstep(20.0, 75.0, dist);
    vec3 horizonFog = mix(vec3(0.95, 0.75, 0.55), vec3(0.35, 0.65, 0.9), smoothstep(-5.0, 15.0, vWorldPosition.y));
    finalColor = mix(finalColor, horizonFog, fogFactor * 0.75);

    gl_FragColor = vec4(finalColor, 0.95);
  }
`;

function InfiniteGerstnerOcean() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uSunDirection: { value: new THREE.Vector3(0.2, 0.25, -1.0).normalize() },
      uSunColor: { value: new THREE.Color("#ffeedd") },
      uWaterColor: { value: new THREE.Color("#0ea5e9") },
      uDeepWaterColor: { value: new THREE.Color("#032b56") },
    }),
    []
  );

  useFrame((state: any) => {
    if (!meshRef.current) return;
    const m = meshRef.current.material as THREE.ShaderMaterial;
    m.uniforms.uTime.value = state.clock.getElapsedTime();
    m.uniforms.uMouse.value.set(oceanState.mouseX, oceanState.mouseY);
  });

  return (
    <mesh ref={meshRef} position={[0, -1.35, -10]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[160, 120, 48, 36]} />
      <shaderMaterial
        vertexShader={waterVertexShader}
        fragmentShader={waterFragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* 2. 70% Atmospheric Sunrise Sky & Golden Sun                        */
/* ------------------------------------------------------------------ */

function CinematicSky() {
  const sunRef = useRef<THREE.Group>(null!);

  useFrame((state: any) => {
    if (!sunRef.current) return;
    const t = state.clock.getElapsedTime();
    sunRef.current.position.x = oceanState.mouseX * 0.6 + Math.sin(t * 0.2) * 0.1;
    sunRef.current.position.y = oceanState.mouseY * 0.3 + Math.cos(t * 0.25) * 0.05;
  });

  return (
    <group ref={sunRef}>
      {/* Golden Sunrise Sun Disc */}
      <mesh position={[2, 2.8, -25]}>
        <circleGeometry args={[2.8, 64]} />
        <meshBasicMaterial color="#fffbeb" />
      </mesh>

      {/* Sun Atmosphere Glow Halo */}
      <mesh position={[2, 2.8, -25.1]}>
        <circleGeometry args={[7.0, 64]} />
        <meshBasicMaterial
          color="#fde047"
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Outer Golden Horizon Atmosphere Rays */}
      <mesh position={[2, 2.8, -25.2]}>
        <circleGeometry args={[16, 64]} />
        <meshBasicMaterial
          color="#f97316"
          transparent
          opacity={0.18}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Soft Volumetric Cloud Haze */}
      <SoftVolumetricCloud position={[-12, 5.5, -20]} scale={[14, 4, 1]} speed={0.06} />
      <SoftVolumetricCloud position={[10, 7.0, -22]} scale={[18, 5, 1]} speed={0.04} />
      <SoftVolumetricCloud position={[-2, 4.2, -18]} scale={[12, 3, 1]} speed={0.08} />
    </group>
  );
}

/* Procedural Radial Cloud Shader (No sharp rectangular edges) */
function SoftVolumetricCloud({ position, scale, speed }: { position: [number, number, number]; scale: [number, number, number]; speed: number }) {
  const ref = useRef<THREE.Mesh>(null!);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSpeed: { value: speed },
    }),
    [speed]
  );

  useFrame((state: any) => {
    if (!ref.current) return;
    const m = ref.current.material as THREE.ShaderMaterial;
    m.uniforms.uTime.value = state.clock.getElapsedTime();
  });

  return (
    <mesh ref={ref} position={position} scale={scale}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={/* glsl */ `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={/* glsl */ `
          varying vec2 vUv;
          uniform float uTime;
          uniform float uSpeed;

          void main() {
            vec2 center = vUv - vec2(0.5);
            float dist = length(center * vec2(1.0, 2.5));
            float alpha = smoothstep(0.5, 0.0, dist) * 0.35;
            float puff = sin(vUv.x * 12.0 + uTime * uSpeed * 2.0) * 0.08;
            alpha *= (0.92 + puff);
            vec3 cloudColor = mix(vec3(1.0, 0.95, 0.88), vec3(0.98, 0.85, 0.72), vUv.y);
            gl_FragColor = vec4(cloudColor, alpha);
          }
        `}
      />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Horizon Submarine & Misty Cliffs (Real Production GLB Assets)     */
/* ------------------------------------------------------------------ */

function HorizonVessel() {
  const subRef = useRef<THREE.Group>(null!);

  useFrame((state: any) => {
    if (!subRef.current) return;
    const t = state.clock.getElapsedTime();
    // Natural ocean floating wave heave & pitch
    subRef.current.position.y = -1.2 + Math.sin(t * 1.4) * 0.08;
    subRef.current.rotation.z = Math.sin(t * 1.1) * 0.03;
    subRef.current.rotation.x = Math.cos(t * 0.9) * 0.02;
  });

  return (
    <group ref={subRef} position={[3, -1.2, -14]} rotation={[0, -Math.PI / 4, 0]} scale={[0.45, 0.45, 0.45]}>
      <Asset name="submarine" />
      {/* Submarine spotlight glint */}
      <pointLight position={[1, 0.5, 2]} intensity={2.5} color="#00e5ff" distance={8} />
    </group>
  );
}

function DistantCliffs() {
  return (
    <group>
      {/* Left Coastal Cliff */}
      <group position={[-22, -1.8, -28]} scale={[2.5, 3.2, 2.5]}>
        <Asset name="rocks" />
      </group>
      {/* Right Distant Rocks */}
      <group position={[24, -2.1, -30]} scale={[3.0, 3.8, 3.0]}>
        <Asset name="rocks" />
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Subsurface Underwater Wildlife (Visible in Lower Waterline)      */
/* ------------------------------------------------------------------ */

function SubsurfaceWildlife() {
  const turtleRef = useRef<THREE.Group>(null!);
  const mantaRef = useRef<THREE.Group>(null!);

  useFrame((state: any) => {
    const t = state.clock.getElapsedTime();
    if (turtleRef.current) {
      turtleRef.current.position.x = -2.5 + Math.sin(t * 0.3) * 1.8;
      turtleRef.current.position.y = -2.2 + Math.cos(t * 0.4) * 0.3;
      turtleRef.current.rotation.y = Math.cos(t * 0.3) * 0.2 + Math.PI / 3;
    }
    if (mantaRef.current) {
      mantaRef.current.position.x = 4 + Math.cos(t * 0.25) * 2.5;
      mantaRef.current.position.y = -3.4 + Math.sin(t * 0.35) * 0.4;
      mantaRef.current.rotation.y = -Math.sin(t * 0.25) * 0.3 - Math.PI / 4;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Gliding Sea Turtle */}
      <group ref={turtleRef} position={[-2.5, -2.2, -6]} scale={[0.5, 0.5, 0.5]}>
        <Asset name="turtle" />
      </group>
      {/* Graceful Manta Ray */}
      <group ref={mantaRef} position={[4, -3.4, -9]} scale={[0.7, 0.7, 0.7]}>
        <Asset name="manta" />
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Handheld Floating Camera Rig & Scroll Transition Engine           */
/* ------------------------------------------------------------------ */

function HandheldCameraRig() {
  const { camera } = useThree();

  useFrame((state: any) => {
    const t = state.clock.getElapsedTime();
    const p = oceanState.progress;

    // Handheld micro floating sway centimeters above water
    const floatY = Math.sin(t * 1.2) * 0.08 + Math.cos(t * 0.8) * 0.04;
    const floatX = Math.sin(t * 0.7) * 0.12 + oceanState.mouseX * 0.5;
    const floatZ = Math.cos(t * 0.6) * 0.05;

    // Smooth continuous scroll plunge from 70/30 sky into deep ocean
    const targetY = 0.45 + floatY - p * 12.0;
    const targetZ = 3.8 + floatZ - p * 4.0;
    const targetPitch = -0.06 + Math.sin(t * 0.9) * 0.015 - p * 0.35;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, floatX, 0.04);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.04);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.04);
    camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, targetPitch, 0.04);
  });

  return null;
}

/* ------------------------------------------------------------------ */
/* Main Cinematic Ocean Hero Component                                */
/* ------------------------------------------------------------------ */

export function CinematicOceanHero() {
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      oceanState.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      oceanState.mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  if (reduced) return null;

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <Canvas
        camera={{ position: [0, 0.45, 3.8], fov: 55 }}
        gl={{
          antialias: false,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
        dpr={[1, 1.25]}
      >
        <HandheldCameraRig />

        {/* Sunlight & Atmospheric Illumination */}
        <ambientLight intensity={0.65} color="#e0f2fe" />
        <directionalLight position={[4, 8, -15]} intensity={3.2} color="#ffedd5" />
        <directionalLight position={[-6, 4, 10]} intensity={0.8} color="#38bdf8" />

        {/* 70% Sky & Horizon Sun */}
        <CinematicSky />

        {/* Gerstner Wave Water Surface */}
        <InfiniteGerstnerOcean />

        {/* Production GLB Models */}
        <HorizonVessel />
        <DistantCliffs />
        <SubsurfaceWildlife />
      </Canvas>

      {/* Cinematic 70% Sky to 30% Ocean Horizon Backdrop Gradient */}
      <div
        className="absolute inset-0 pointer-events-none z-[-1]"
        style={{
          background:
            "linear-gradient(180deg, #ffb07c 0%, #fda4af 15%, #60a5fa 40%, #0284c7 65%, #032b56 100%)",
        }}
      />
    </div>
  );
}
