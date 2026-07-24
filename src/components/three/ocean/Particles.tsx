import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { oceanState } from "@/lib/oceanState";
import { remap } from "@/lib/utils";

/**
 * GPU particle layers — positions are advanced entirely in the vertex shader
 * (time-based), so the CPU never touches a vertex after upload.
 * Soft round sprites, depth-tinted, additively blended.
 */

interface LayerProps {
  count: number;
  area?: [number, number, number];
  /** vertical direction: negative sinks (marine snow), positive rises (bubbles) */
  speed?: [number, number];
  dir?: 1 | -1;
  sizeRange?: [number, number];
  colorA?: string;
  colorB?: string;
  baseOpacity?: number;
  twinkle?: boolean;
  drift?: number;
  /** progress window [in0, in1, out0, out1] for opacity */
  window?: [number, number, number, number];
}

function Layer({
  count,
  area = [56, 36, 26],
  speed = [0.2, 0.7],
  dir = -1,
  sizeRange = [4, 9],
  colorA = "#8ED6FF",
  colorB = "#00E5FF",
  baseOpacity = 0.5,
  twinkle = false,
  drift = 0.6,
  window: win = [0.0, 0.06, 2, 3],
}: LayerProps) {
  const mat = useRef<THREE.ShaderMaterial>(null!);

  const { geometry, uniforms } = useMemo(() => {
    const [W, H, D] = area;
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    const spd = new Float32Array(count);
    const siz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * W;
      pos[i * 3 + 1] = Math.random() * H;
      pos[i * 3 + 2] = (Math.random() - 0.5) * D - 6;
      seed[i] = Math.random();
      spd[i] = speed[0] + Math.random() * (speed[1] - speed[0]);
      siz[i] = sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    geometry.setAttribute("aSpeed", new THREE.BufferAttribute(spd, 1));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(siz, 1));
    // generous static bounds — motion happens in the shader
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, -6), Math.max(W, H, D));

    const uniforms = {
      uTime: { value: 0 },
      uH: { value: H },
      uDir: { value: dir },
      uDrift: { value: drift },
      uMix: { value: 0 },
      uOpacity: { value: 0 },
      uColorA: { value: new THREE.Color(colorA) },
      uColorB: { value: new THREE.Color(colorB) },
      uTwinkle: { value: twinkle ? 1 : 0 },
      uPixelRatio: { value: 1 },
    };
    return { geometry, uniforms };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  useFrame((state) => {
    const u = mat.current.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    u.uPixelRatio.value = state.gl.getPixelRatio();
    u.uMix.value = remap(oceanState.progress, 0.35, 0.75, 0, 1);
    const p = oceanState.progress;
    u.uOpacity.value =
      baseOpacity *
      remap(p, win[0], win[1], win[0] === 0 ? 1 : 0, 1) *
      remap(p, win[2], win[3], 1, 0);
  });

  return (
    <points frustumCulled={false}>
      <primitive object={geometry} attach="geometry" />
      <shaderMaterial
        ref={mat}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={/* glsl */ `
          attribute float aSeed;
          attribute float aSpeed;
          attribute float aSize;
          uniform float uTime;
          uniform float uH;
          uniform float uDir;
          uniform float uDrift;
          uniform float uPixelRatio;
          uniform float uTwinkle;
          varying float vFade;

          void main() {
            vec3 p = position;
            float travelled = position.y + uTime * aSpeed * uDir;
            p.y = mod(travelled, uH) - uH * 0.5;
            p.x += sin(uTime * 0.32 + aSeed * 6.2831) * uDrift;
            p.z += cos(uTime * 0.21 + aSeed * 12.566) * uDrift * 0.5;

            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = aSize * uPixelRatio * (26.0 / max(1.0, -mv.z));

            float tw = uTwinkle > 0.5
              ? 0.55 + 0.45 * sin(uTime * (1.5 + aSeed * 2.0) + aSeed * 40.0)
              : 1.0;
            // fade near vertical wrap edges so respawn is invisible
            float edge = smoothstep(0.5, 0.42, abs(p.y / uH));
            vFade = tw * edge;
          }
        `}
        fragmentShader={/* glsl */ `
          uniform vec3 uColorA;
          uniform vec3 uColorB;
          uniform float uMix;
          uniform float uOpacity;
          varying float vFade;

          void main() {
            float d = length(gl_PointCoord - 0.5);
            float disc = smoothstep(0.5, 0.12, d);
            vec3 col = mix(uColorA, uColorB, uMix);
            gl_FragColor = vec4(col, disc * uOpacity * vFade);
          }
        `}
      />
    </points>
  );
}

export function OceanParticles() {
  return (
    <>
      {/* Marine snow — slowly sinking motes, ever-present */}
      {/* Marine snow — reduced from 520 for performance, still visually dense */}
      <Layer
        count={300}
        dir={-1}
        speed={[0.12, 0.4]}
        sizeRange={[3, 7]}
        colorA="#a9d8f5"
        colorB="#37c4e0"
        baseOpacity={0.42}
        window={[0.0, 0.05, 2, 3]}
      />
      {/* Plankton — tiny twinkling drift, glows more with depth */}
      {/* Plankton — reduced from 300 for performance */}
      <Layer
        count={180}
        dir={-1}
        speed={[0.04, 0.14]}
        sizeRange={[1.5, 3.5]}
        colorA="#8ED6FF"
        colorB="#00E5FF"
        baseOpacity={0.75}
        twinkle
        window={[0.05, 0.2, 2, 3]}
      />
      {/* Bubble streams — rise fast, upper ocean only */}
      {/* Bubbles — reduced from 140 for performance */}
      <Layer
        count={100}
        dir={1}
        speed={[1.6, 3.4]}
        sizeRange={[4, 10]}
        colorA="#dff4ff"
        colorB="#bfeaff"
        baseOpacity={0.5}
        drift={0.9}
        window={[0.015, 0.06, 0.3, 0.48]}
      />
    </>
  );
}
