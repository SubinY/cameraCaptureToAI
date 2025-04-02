"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface FluidSphereCardProps {
  isActive?: boolean;
  onToggle?: () => void;
}

// Shader material for fluid effect
const fragmentShader = `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
uniform float uTime;
uniform vec3 uColor1;
uniform vec3 uColor2;

void main() {
  // Create fluid-like effect with sine waves
  float noise = sin(vPosition.x * 10.0 + uTime) * sin(vPosition.y * 10.0 + uTime) * sin(vPosition.z * 10.0 + uTime) * 0.5 + 0.5;
  
  // Mix two colors based on the noise
  vec3 color = mix(uColor1, uColor2, noise);
  
  // Add lighting effect based on normals
  float lighting = dot(vNormal, normalize(vec3(1.0)));
  color += lighting * 0.1;
  
  gl_FragColor = vec4(color, 1.0);
}
`;

const vertexShader = `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
uniform float uTime;

void main() {
  vUv = uv;
  vNormal = normal;
  
  // Create displacement effect
  vec3 pos = position;
  float displacement = sin(pos.x * 5.0 + uTime) * sin(pos.y * 5.0 + uTime) * sin(pos.z * 5.0 + uTime) * 0.1;
  pos += normal * displacement;
  
  vPosition = pos;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

// Fluid Sphere component that will be rendered in the Canvas
function FluidSphere({ isActive }: { isActive: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Animation loop
  useFrame(({ clock }) => {
    if (meshRef.current && materialRef.current && isActive) {
      // Update time uniform for shader animation
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();

      // Gentle rotation
      meshRef.current.rotation.y += 0.003;
      meshRef.current.rotation.x += 0.001;
    }
  });

  // Colors for the fluid effect
  const color1 = isActive
    ? new THREE.Color("#00D2FF")
    : new THREE.Color("#0A1929");
  const color2 = isActive
    ? new THREE.Color("#0062FF")
    : new THREE.Color("#0F2942");

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uColor1: { value: color1 },
          uColor2: { value: color2 },
        }}
      />
    </mesh>
  );
}

export function FluidSphereCard({
  isActive: initialActive = false,
  onToggle,
}: FluidSphereCardProps) {
  const [isActive, setIsActive] = useState(initialActive);
  const [waveIntensity, setWaveIntensity] = useState(50);

  const handleToggle = () => {
    const newState = !isActive;
    setIsActive(newState);
    if (onToggle) onToggle();
  };

  const handleIntensityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWaveIntensity(Number.parseInt(e.target.value));
  };

  return (
    <div
      className={cn(
        "h-full rounded-3xl p-4 relative overflow-hidden tech-card hover-effect hover-3d card-border transition-all duration-500",
        isActive ? "device-active" : "device-inactive",
        "bg-gradient-to-br from-[#0A1929] to-[#0F2942] text-white"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="font-medium text-white">Fluid Sphere</h3>
          <p className="text-xs text-blue-200/70">Interactive</p>
        </div>

        <label className="relative inline-flex items-center cursor-pointer toggle-switch-animation">
          <input
            type="checkbox"
            checked={isActive}
            onChange={handleToggle}
            className="sr-only peer"
          />
          <div
            className={cn(
              "w-12 h-6 rounded-full peer transition-all duration-300",
              isActive ? "switch-active" : "switch-inactive"
            )}
          >
            <span
              className="text-[10px] absolute right-1.5 top-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity duration-300"
              style={{ opacity: isActive ? 1 : 0 }}
            >
              ON
            </span>
            <span
              className="text-[10px] absolute left-1.5 top-1/2 -translate-y-1/2 text-gray-300 opacity-0 transition-opacity duration-300"
              style={{ opacity: isActive ? 0 : 1 }}
            >
              OFF
            </span>
          </div>
          <div
            className={cn(
              "absolute top-[2px] left-[2px] bg-white w-5 h-5 rounded-full transition-all duration-300 transform",
              isActive
                ? "translate-x-6 switch-thumb-active"
                : "switch-thumb-inactive"
            )}
          ></div>
        </label>
      </div>

      <div className="flex items-center justify-center h-[140px]">
        <div className="w-32 h-32 rounded-full overflow-hidden">
          {/* Three.js Canvas */}
          <Canvas camera={{ position: [0, 0, 2.5] }}>
            <ambientLight intensity={0.5} />
            <FluidSphere isActive={isActive} />
            {isActive && <OrbitControls enableZoom={false} enablePan={false} />}
          </Canvas>
        </div>
      </div>

      {/* Wave Intensity Control */}
      <div className="mt-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-blue-200/70">Wave Intensity</span>
          <span className="text-xs font-medium text-white">
            {waveIntensity}%
          </span>
        </div>

        <div className="tech-slider relative h-1.5 rounded-full">
          <div
            className={cn(
              "tech-slider-track transition-all duration-300",
              isActive
                ? "bg-gradient-to-r from-[#00D2FF] to-[#0062FF]"
                : "bg-[#0A1929]/50"
            )}
          ></div>
          <input
            type="range"
            min="0"
            max="100"
            value={waveIntensity}
            onChange={handleIntensityChange}
            className="tech-slider-thumb absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
            disabled={!isActive}
          />
          <div
            className={cn(
              "tech-slider-progress absolute top-0 left-0 h-full rounded-full transition-all duration-300",
              isActive
                ? "bg-gradient-to-r from-[#00D2FF] to-[#0062FF]"
                : "bg-[#0A1929]/50"
            )}
            style={{ width: `${waveIntensity}%` }}
          ></div>
          <div
            className={cn(
              "tech-slider-handle absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full transition-all duration-300",
              isActive
                ? "bg-white border-[#00D2FF]"
                : "bg-gray-400 border-gray-600"
            )}
            style={{ left: `calc(${waveIntensity}% - 6px)` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
