import { useMemo, useRef } from "react";
import { useFrame, useThree, useLoader } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { oceanState } from "@/lib/oceanState";
import { remap } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Depth palette (tuned for ACES filmic output)                        */
/* ------------------------------------------------------------------ */

const STOPS: Array<[number, string, string]> = [
  [0.0, "#4da3e8", "#155097"],
  [0.16, "#2a70c4", "#11499a"],
  [0.34, "#11499a", "#093472"],
  [0.55, "#093472", "#041d44"],
  [0.75, "#031530", "#010a18"],
  [1.0, "#010c1d", "#00060e"],
];

const stopColors = STOPS.map(([p, a, b]) => ({
  p,
  top: new THREE.Color(a),
  bottom: new THREE.Color(b),
}));

export function samplePalette(p: number, outTop: THREE.Color, outBottom: THREE.Color) {
  for (let i = 0; i < stopColors.length - 1; i++) {
    const a = stopColors[i];
    const b = stopColors[i + 1];
    if (p <= b.p) {
      const t = THREE.MathUtils.clamp((p - a.p) / (b.p - a.p), 0, 1);
      outTop.lerpColors(a.top, b.top, t);
      outBottom.lerpColors(a.bottom, b.bottom, t);
      return;
    }
  }
  outTop.copy(stopColors[stopColors.length - 1].top);
  outBottom.copy(stopColors[stopColors.length - 1].bottom);
}

/* ------------------------------------------------------------------ */
/* Gradient backdrop with caustic shimmer                              */
/* ------------------------------------------------------------------ */

export function Backdrop() {
  const mat = useRef<THREE.ShaderMaterial>(null!);
  const uniforms = useMemo(
    () => ({
      uTop: { value: new THREE.Color("#4da3e8") },
      uBottom: { value: new THREE.Color("#155097") },
      uTime: { value: 0 },
      uCaustics: { value: 1 },
    }),
    []
  );

  useFrame((state) => {
    const m = mat.current;
    if (!m) return;
    m.uniforms.uTime.value = state.clock.elapsedTime;
    samplePalette(oceanState.progress, m.uniforms.uTop.value, m.uniforms.uBottom.value);
    m.uniforms.uCaustics.value = remap(oceanState.progress, 0.0, 0.3, 1, 0);

    // Make backdrop track the camera vertically so it covers the entire 250m descent
    const mesh = m as any;
    if (mesh._parentMesh) {
      // Keep the top of the Backdrop underwater (y <= 0) by clamping its center to -70
      mesh._parentMesh.position.y = Math.min(state.camera.position.y, -70);
    }
  });

  return (
    <mesh position={[0, -70, -44]} ref={(el) => { if (el && mat.current) (mat.current as any)._parentMesh = el; }}>
      <planeGeometry args={[240, 140]} />
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        depthWrite={false}
        vertexShader={/* glsl */ `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={/* glsl */ `
          varying vec2 vUv;
          uniform vec3 uTop;
          uniform vec3 uBottom;
          uniform float uTime;
          uniform float uCaustics;

          void main() {
            vec3 col = mix(uBottom, uTop, pow(vUv.y, 1.3));
            float c1 = sin(vUv.x * 42.0 + uTime * 0.7) * sin(vUv.y * 30.0 - uTime * 0.5);
            float c2 = sin(vUv.x * 23.0 - uTime * 0.4 + vUv.y * 18.0);
            float caustic = pow(max(0.0, c1 * c2), 2.0) * uCaustics * smoothstep(0.45, 1.0, vUv.y);
            col += vec3(0.4, 0.75, 0.85) * caustic * 0.22;
            gl_FragColor = vec4(col, 1.0);
          }
        `}
      />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* God rays                                                            */
/* ------------------------------------------------------------------ */

export function GodRays() {
  const mat = useRef<THREE.ShaderMaterial>(null!);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uIntensity: { value: 1 } }), []);

  useFrame((state) => {
    const m = mat.current;
    if (!m) return;
    m.uniforms.uTime.value = state.clock.elapsedTime;
    m.uniforms.uIntensity.value = remap(oceanState.progress, 0.02, 0.34, 1, 0);
  });

  return (
    <mesh position={[0, 9, -30]}>
      <planeGeometry args={[160, 95]} />
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
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
          uniform float uIntensity;

          void main() {
            vec2 p = vUv - vec2(0.5, 1.35);
            float a = atan(p.x, -p.y);
            float rays = sin(a * 26.0 + uTime * 0.22) * 0.5 + 0.5;
            rays *= sin(a * 13.0 - uTime * 0.13) * 0.5 + 0.5;
            rays = pow(rays, 2.4);
            float fade = smoothstep(0.05, 0.95, vUv.y);
            float centerFade = 1.0 - smoothstep(0.0, 0.8, abs(vUv.x - 0.5) * 2.0);
            gl_FragColor = vec4(vec3(0.7, 0.92, 1.0), rays * fade * centerFade * uIntensity * 0.5);
          }
        `}
      />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* The surface, seen from below                                        */
/* ------------------------------------------------------------------ */

export function SurfaceFromBelow() {
  const mat = useRef<THREE.ShaderMaterial>(null!);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uFade: { value: 0 } }), []);

  useFrame((state) => {
    const m = mat.current;
    if (!m) return;
    m.uniforms.uTime.value = state.clock.elapsedTime;
    m.uniforms.uFade.value = remap(oceanState.progress, 0.02, 0.2, 0.85, 0);
  });

  return (
    <mesh position={[0, 12, -18]} rotation={[Math.PI / 2, 0, 0]}>
      <planeGeometry args={[300, 220, 1, 1]} />
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
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
          uniform float uFade;

          // layered directional waves -> fake normal
          vec2 waveN(vec2 p) {
            float n1 = sin(p.x * 6.0 + uTime * 0.9) * 0.5;
            float n2 = sin((p.x + p.y) * 9.0 - uTime * 1.3) * 0.3;
            float n3 = sin(p.y * 13.0 + uTime * 0.7) * 0.2;
            float nx = n1 + n2 * 0.7 + n3 * 0.4;
            float ny = n2 + n3;
            return vec2(nx, ny);
          }

          void main() {
            vec2 p = (vUv - 0.5) * 14.0;
            vec2 n2 = waveN(p);
            vec3 n = normalize(vec3(n2.x * 0.35, 1.0, n2.y * 0.35));
            vec3 sunDir = normalize(vec3(0.25, 1.0, 0.35));
            float spec = pow(max(dot(n, sunDir), 0.0), 60.0);
            float sheen = pow(max(dot(n, sunDir), 0.0), 6.0);

            vec3 col = mix(vec3(0.32, 0.62, 0.86), vec3(1.0, 0.98, 0.9), spec);
            col += vec3(0.5, 0.75, 0.9) * sheen * 0.35;

            float radial = 1.0 - smoothstep(0.15, 0.5, length(vUv - 0.5));
            gl_FragColor = vec4(col, (0.25 + spec * 0.75 + sheen * 0.2) * radial * uFade);
          }
        `}
      />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* Fog, lights and image-based lighting that deepen with descent       */
/* ------------------------------------------------------------------ */

export function Atmosphere() {
  const { scene } = useThree();
  const fog = useMemo(() => new THREE.FogExp2("#11499a", 0.02), []);
  const sun = useRef<THREE.DirectionalLight>(null!);
  const hemi = useRef<THREE.HemisphereLight>(null!);
  const tmpTop = useMemo(() => new THREE.Color(), []);
  const tmpBottom = useMemo(() => new THREE.Color(), []);

  useFrame(() => {
    const p = oceanState.progress;
    scene.fog = fog;
    samplePalette(p, tmpTop, tmpBottom);
    fog.color.copy(tmpBottom);
    fog.density = 0.016 + p * 0.02;
    scene.environmentIntensity = remap(p, 0, 0.7, 1.1, 0.18);
    if (sun.current) sun.current.intensity = remap(p, 0, 0.55, 2.6, 0.3);
    if (hemi.current) hemi.current.intensity = remap(p, 0, 0.7, 0.9, 0.15);
  });

  return (
    <>
      <CinematicMist />
      <hemisphereLight ref={hemi} args={["#9fd4f8", "#0a2c58", 0.9]} />
      <directionalLight ref={sun} position={[6, 18, 4]} color="#cfeaff" intensity={2.6} />
      <ambientLight intensity={0.25} color="#4A90E2" />
      <Environment resolution={64} frames={1}>
        {/* bright sheet overhead = the sun through water */}
        <Lightformer
          intensity={3}
          position={[0, 12, 0]}
          rotation-x={Math.PI / 2}
          scale={[26, 26, 1]}
          color="#cfeaff"
        />
        <Lightformer intensity={0.8} position={[-10, 2, -8]} scale={[14, 22, 1]} color="#1F509A" />
        <Lightformer intensity={0.7} position={[10, -2, 6]} scale={[12, 18, 1]} color="#0e3f6e" />
        <Lightformer intensity={0.4} position={[0, -12, 0]} rotation-x={-Math.PI / 2} scale={[24, 24, 1]} color="#02142c" />
      </Environment>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Underwater camera — never on a tripod                               */
/* ------------------------------------------------------------------ */

export function CameraRig() {
  const targetLook = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const cam = state.camera;
    const p = oceanState.progress;

    // 1. Deep underwater sway
    const swayX = oceanState.mouseX * 0.9 + Math.sin(t * 0.11) * 0.4 + Math.sin(t * 0.23) * 0.18;
    const swayY = oceanState.mouseY * 0.55 + Math.sin(t * 0.17) * 0.28 + Math.cos(t * 0.07) * 0.12;

    // 2. Surface handheld sway
    const floatY = Math.sin(t * 1.2) * 0.08 + Math.cos(t * 0.8) * 0.04;
    const floatX = Math.sin(t * 0.7) * 0.12 + oceanState.mouseX * 0.5;
    const floatZ = Math.cos(t * 0.6) * 0.05;

    // 3. True scale physical camera descent to -245 meters
    //    Clamped so the camera never sinks below the seabed floor
    const descentY = Math.max(-245, 0.45 - p * 245.0);

    // Blend factors (Surface to Deep transition between p=0 and p=0.08)
    const surfaceWeight = Math.max(0, 1.0 - p * 12.0); 
    const deepWeight = 1.0 - surfaceWeight;

    // Blend camera position
    const targetX = floatX * surfaceWeight + swayX * deepWeight;
    const targetY = descentY + floatY * surfaceWeight + swayY * deepWeight;
    const targetZ = (3.8 + floatZ) * surfaceWeight + 9.0 * deepWeight;

    cam.position.x = THREE.MathUtils.lerp(cam.position.x, targetX, 0.04);
    cam.position.y = THREE.MathUtils.lerp(cam.position.y, targetY, 0.04);
    cam.position.z = THREE.MathUtils.lerp(cam.position.z, targetZ, 0.04);

    // Blend look target
    // At surface (pitch ~-0.06), look target is roughly straight ahead and slightly down.
    const surfaceLookX = 0;
    const surfaceLookY = targetY - 1.0; 
    const surfaceLookZ = targetZ - 13.8;
    
    // Deep underwater look target
    const deepLookX = 0;
    const deepLookY = targetY;
    const deepLookZ = targetZ - 21.0;

    targetLook.x = THREE.MathUtils.lerp(targetLook.x, surfaceLookX * surfaceWeight + deepLookX * deepWeight, 0.04);
    targetLook.y = THREE.MathUtils.lerp(targetLook.y, surfaceLookY * surfaceWeight + deepLookY * deepWeight, 0.04);
    targetLook.z = THREE.MathUtils.lerp(targetLook.z, surfaceLookZ * surfaceWeight + deepLookZ * deepWeight, 0.04);

    cam.lookAt(targetLook);

    // Deep sea roll (z rotation)
    cam.rotation.z += (Math.sin(t * 0.13) * 0.013 + Math.sin(t * 0.31) * 0.004) * deepWeight;
  });
  return null;
}

/* ------------------------------------------------------------------ */
/* Cinematic volumetric mist overlay                                   */
/* ------------------------------------------------------------------ */

export function CinematicMist() {
  const tex = useLoader(THREE.TextureLoader, "/models/Texturelabs_Atmosphere_210M.jpg");
  const matRef = useRef<THREE.MeshBasicMaterial>(null!);

  useFrame(() => {
    if (!matRef.current) return;
    const p = oceanState.progress;
    // Fade mist in as you plunge, fade out when super deep
    const inFade = remap(p, 0.05, 0.3, 0.0, 0.25);
    const outFade = remap(p, 0.7, 0.95, 1.0, 0.0);
    matRef.current.opacity = inFade * outFade;
  });

  return (
    <group>
      {Array.from({ length: 4 }).map((_, i) => (
        <MistPlane key={i} tex={tex} index={i} matRef={i === 0 ? matRef : undefined} />
      ))}
    </group>
  );
}

function MistPlane({ tex, index, matRef }: { tex: THREE.Texture; index: number; matRef?: any }) {
  const ref = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    
    // Position slightly differently based on index to create parallax
    const offsetZ = -12 - (index * 6);
    const floatY = Math.sin(t * 0.15 + index * 2.1) * 6;
    const floatX = Math.cos(t * 0.12 + index * 1.7) * 10;
    
    ref.current.position.set(
      state.camera.position.x + floatX,
      state.camera.position.y + floatY,
      state.camera.position.z + offsetZ
    );
    
    // Always face camera
    ref.current.quaternion.copy(state.camera.quaternion);
  });

  return (
    <mesh ref={ref}>
      <planeGeometry args={[55, 55]} />
      <meshBasicMaterial
        ref={matRef}
        map={tex}
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        color="#7ac3ff"
      />
    </mesh>
  );
}

