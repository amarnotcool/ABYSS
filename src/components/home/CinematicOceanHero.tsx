import { useRef, useMemo, useEffect, Suspense, Component, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, useTexture, useFBO } from "@react-three/drei";
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
  varying vec4 vScreenPos;

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
    float distToMouse = length(p.xz - uMouse * 15.0);
    float mouseRipple = sin(distToMouse * 3.0 - uTime * 5.0) * exp(-distToMouse * 0.2) * 0.15;

    // Sum of Gerstner waves - Tweaked for natural ocean swells (less systematic)
    p += gerstnerWave(gridPoint, vec2(1.0, 0.4), 0.08, 18.0, 0.8, tangent, binormal);
    p += gerstnerWave(gridPoint, vec2(0.7, -0.3), 0.05, 11.0, 1.1, tangent, binormal);
    p += gerstnerWave(gridPoint, vec2(-0.5, 0.8), 0.03, 6.0, 1.4, tangent, binormal);
    
    p.y += mouseRipple;

    vec3 calcNormal = normalize(cross(binormal, tangent));
    vNormal = normalMatrix * calcNormal;

    vec4 worldPosition = modelMatrix * vec4(p, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
    vScreenPos = gl_Position;
  }
`;

const waterFragmentShader = /* glsl */ `
  uniform sampler2D uWaterNormal;
  uniform sampler2D uWaterColorTex;
  uniform sampler2D uFoamMask;
  uniform sampler2D uNewWaterTex;
  uniform float uTime;
  uniform vec3 uSunDirection;
  uniform vec3 uSunColor;
  uniform vec3 uWaterColor;
  uniform vec3 uDeepWaterColor;
  uniform sampler2D uTransmissionMap;
  uniform sampler2D uDepthMap;
  uniform vec2 uResolution;
  uniform float uCameraNear;
  uniform float uCameraFar;
  
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying vec2 vUv;
  varying vec4 vScreenPos;

  // Linearize depth helper
  float linearizeDepth(float z, float near, float far) {
    float z_n = 2.0 * z - 1.0;
    return 2.0 * near * far / (far + near - z_n * (far - near));
  }

  void main() {
    float timeScale = uTime * 0.015;
    vec2 uv1 = vUv * 4.0 + vec2(timeScale, timeScale * 0.5);
    vec2 uv2 = vUv * 4.0 * 1.3 - vec2(timeScale * 0.8, -timeScale * 0.6);

    vec3 normalTex1 = texture2D(uWaterNormal, uv1).rgb * 2.0 - 1.0;
    vec3 normalTex2 = texture2D(uWaterNormal, uv2).rgb * 2.0 - 1.0;
        // Blend normals
    vec3 combinedNormal = normalize(normalTex1 + normalTex2);
    vec3 perturbedNormal = normalize(vNormal + combinedNormal * 0.35);
    vec3 actualNormal = gl_FrontFacing ? perturbedNormal : -perturbedNormal;

    // 1. Screen Space Coordinates for Refraction
    vec2 screenUv = (vScreenPos.xy / vScreenPos.w) * 0.5 + 0.5;
    vec2 distortedUv = screenUv + (actualNormal.xz * 0.06);

    // 2. Depth Calculation for Volumetric Absorption
    float rawDepth = texture2D(uDepthMap, screenUv).r;
    float sceneDepth = linearizeDepth(rawDepth, uCameraNear, uCameraFar);
    float surfaceDepth = linearizeDepth(gl_FragCoord.z, uCameraNear, uCameraFar);
    
    // Distance from the water surface to the ocean floor / objects (or camera to surface if looking up)
    float waterDepth = gl_FrontFacing ? max(0.0, sceneDepth - surfaceDepth) : surfaceDepth;

    // 3. Transmission (Refraction)
    vec3 refractionColor = texture2D(uTransmissionMap, distortedUv).rgb;

    // 4. Absorption Factor (Exponential falloff)
    float absorption = exp(-waterDepth * 0.55);

    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    float fresnel = pow(1.0 - max(0.0, dot(viewDir, actualNormal)), 5.0);

    vec3 halfVector = normalize(uSunDirection + viewDir);
    float NdotH = max(0.0, dot(actualNormal, halfVector));
    float specular = pow(NdotH, 250.0) * 4.0;

    float waveCrest = smoothstep(0.1, 0.4, vWorldPosition.y);
    vec4 foamTex = texture2D(uFoamMask, vUv * 6.0 + vec2(uTime * 0.005));
    float foamAlpha = waveCrest * foamTex.r * 0.7;
    vec3 foamColor = gl_FrontFacing ? (vec3(0.95, 0.98, 1.0) * foamAlpha) : vec3(0.0);

    vec3 newTexColor = texture2D(uNewWaterTex, vUv * 3.0).rgb;
    vec3 oldTexColor = texture2D(uWaterColorTex, vUv * 4.0).rgb;
    vec3 baseTexColor = mix(oldTexColor, newTexColor, 0.6);

    vec3 finalColor;
    if (gl_FrontFacing) {
        // Mix refraction with deep water color based on absorption
        vec3 waterBodyColor = mix(uDeepWaterColor, uWaterColor * baseTexColor, absorption * 0.8 + 0.2);
        vec3 finalRefraction = mix(waterBodyColor, refractionColor, absorption);
        // Final color blends refraction with reflection (fresnel) and highlights
        finalColor = mix(finalRefraction, uWaterColor * 1.4, fresnel * 0.6) + (uSunColor * specular) + foamColor;
    } else {
        // Underwater looking up — fully transparent so the blue ocean
        // backdrop shows through seamlessly. No visible plane from below.
        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
        return;
    }

    float dist = length(vWorldPosition - cameraPosition);
    float fogFactor = smoothstep(15.0, 65.0, dist);
    vec3 horizonFog = mix(vec3(0.85, 0.75, 0.65), vec3(0.05, 0.25, 0.55), smoothstep(-2.0, 10.0, vWorldPosition.y));
    finalColor = mix(finalColor, horizonFog, fogFactor * 0.85);

    gl_FragColor = vec4(finalColor, 0.96);
  }
`;

export function InfiniteGerstnerOcean() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const depthTexture = useMemo(() => {
    const tex = new THREE.DepthTexture(window.innerWidth, window.innerHeight);
    tex.type = THREE.UnsignedShortType;
    return tex;
  }, []);
  
  const fbo = useFBO(window.innerWidth, window.innerHeight, {
    depthBuffer: true,
    depthTexture: depthTexture,
    format: THREE.RGBAFormat,
  });

  const [waterNormal, waterColorTex, foamMask, newWaterTex] = useTexture([
    "/textures/water_normal.jpg",
    "/textures/water_color.jpg",
    "/textures/foam_mask.jpg",
    "/models/water.png",
  ]);

  useMemo(() => {
    waterNormal.wrapS = waterNormal.wrapT = THREE.RepeatWrapping;
    waterColorTex.wrapS = waterColorTex.wrapT = THREE.RepeatWrapping;
    foamMask.wrapS = foamMask.wrapT = THREE.RepeatWrapping;
    newWaterTex.wrapS = newWaterTex.wrapT = THREE.RepeatWrapping;
  }, [waterNormal, waterColorTex, foamMask, newWaterTex]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uWaterNormal: { value: waterNormal },
      uWaterColorTex: { value: waterColorTex },
      uFoamMask: { value: foamMask },
      uNewWaterTex: { value: newWaterTex },
      uTransmissionMap: { value: fbo.texture },
      uDepthMap: { value: fbo.depthTexture },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      uCameraNear: { value: 0.1 },
      uCameraFar: { value: 1000.0 },
      uSunDirection: { value: new THREE.Vector3(0.2, 0.25, -1.0).normalize() },
      uSunColor: { value: new THREE.Color("#ffeedd") },
      uWaterColor: { value: new THREE.Color("#0ea5e9") },
      uDeepWaterColor: { value: new THREE.Color("#032b56") },
    }),
    [waterNormal, waterColorTex, foamMask, newWaterTex, fbo]
  );

  useFrame((state: any) => {
    if (!meshRef.current) return;
    const m = meshRef.current.material as THREE.ShaderMaterial;
    
    // Render transmission/depth FBO
    meshRef.current.visible = false;
    state.gl.setRenderTarget(fbo);
    state.gl.render(state.scene, state.camera);
    state.gl.setRenderTarget(null);
    meshRef.current.visible = true;

    // Update uniforms
    m.uniforms.uTime.value = state.clock.getElapsedTime();
    m.uniforms.uMouse.value.set(oceanState.mouseX, oceanState.mouseY);
    m.uniforms.uCameraNear.value = state.camera.near;
    m.uniforms.uCameraFar.value = state.camera.far;
  });

  return (
    <mesh ref={meshRef} position={[0, -1.35, -10]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[160, 120, 32, 24]} />
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

export function HorizonVessel() {
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

export function DistantCliffs() {
  return (
    <group>
      {/* Left Coastal Cliff */}
      <group position={[-50, -2.5, -45]} scale={[1.2, 1.2, 1.2]} rotation={[0, 0.4, 0]}>
        <Asset name="cliff" />
      </group>
      {/* Right Distant Cliffs */}
      <group position={[55, -3.0, -50]} scale={[1.5, 1.5, 1.5]} rotation={[0, -1.2, 0]}>
        <Asset name="cliff" />
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Subsurface Underwater Wildlife (Visible in Lower Waterline)      */
/* ------------------------------------------------------------------ */

export function AtmosphericFogLayer() {
  const fogTex = useTexture("/models/Texturelabs_Atmosphere_210M.jpg");
  const fogRef = useRef<THREE.Mesh>(null!);

  useFrame((state: any) => {
    if (!fogRef.current) return;
    const t = state.clock.getElapsedTime();
    fogRef.current.position.x = Math.sin(t * 0.08) * 1.5;
    fogRef.current.position.y = 1.8 + Math.cos(t * 0.12) * 0.2;
  });

  return (
    <mesh ref={fogRef} position={[0, 1.8, -16]} scale={[48, 20, 1]}>
      <meshBasicMaterial
        map={fogTex}
        transparent
        opacity={0.65}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

export function SubsurfaceWildlife() {
  const carpRef = useRef<THREE.Group>(null!);
  const neonRef = useRef<THREE.Group>(null!);
  const turtleRef = useRef<THREE.Group>(null!);

  useFrame((state: any) => {
    const t = state.clock.getElapsedTime();
    if (carpRef.current) {
      carpRef.current.position.x = -1.5 + Math.sin(t * 0.5) * 3.0;
      carpRef.current.position.y = -1.9 + Math.cos(t * 0.6) * 0.35;
      carpRef.current.rotation.y = Math.cos(t * 0.5) * 0.35 + Math.PI / 2;
    }
    if (neonRef.current) {
      neonRef.current.position.x = 2.8 + Math.cos(t * 0.45) * 2.2;
      neonRef.current.position.y = -2.8 + Math.sin(t * 0.55) * 0.4;
      neonRef.current.rotation.y = -Math.sin(t * 0.45) * 0.3 - Math.PI / 3;
    }
    if (turtleRef.current) {
      turtleRef.current.position.x = -3.2 + Math.sin(t * 0.3) * 1.6;
      turtleRef.current.position.y = -2.4 + Math.cos(t * 0.4) * 0.3;
      turtleRef.current.rotation.y = Math.cos(t * 0.3) * 0.2 + Math.PI / 3;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 3D Carp Fish Model */}
      <group ref={carpRef} position={[-1.5, -1.9, -5.5]} scale={[0.6, 0.6, 0.6]}>
        <Asset name="carp" />
      </group>
      {/* 3D Neon Tetra Model */}
      <group ref={neonRef} position={[2.8, -2.8, -7]} scale={[0.8, 0.8, 0.8]}>
        <Asset name="neon" />
      </group>
      {/* Sea Turtle */}
      <group ref={turtleRef} position={[-3.2, -2.4, -6.5]} scale={[0.5, 0.5, 0.5]}>
        <Asset name="turtle" />
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

export function SurfaceWorld() {
  const ref = useRef<THREE.Group>(null!);

  useFrame(() => {
    if (!ref.current) return;
    // Hide the entire surface world once the camera is well below water —
    // the DoubleSide water shader renders bright white when viewed from below.
    ref.current.visible = oceanState.progress < 0.15;
  });

  return (
    <group ref={ref}>
      <AtmosphericFogLayer />
      <InfiniteGerstnerOcean />
      <HorizonVessel />
      <DistantCliffs />
      <SubsurfaceWildlife />
    </group>
  );
}
