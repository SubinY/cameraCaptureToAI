"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { WaveSphere3D } from "@/components/3d/wave-sphere";
import { useDataSimulator } from "@/components/3d/data-simulator";
import { defaultWaveConfig } from "@/components/3d/config";

interface WaveSphereCardProps {
  isActive?: boolean;
  onToggle?: () => void;
}

export function WaveSphereCard({
  isActive: initialActive = false,
  onToggle,
}: WaveSphereCardProps) {
  const [isActive, setIsActive] = useState(initialActive);
  const [waveIntensity, setWaveIntensity] = useState(defaultWaveConfig.intensity);
  
  // 使用数据模拟器生成模拟数据
  const { data } = useDataSimulator(isActive, 1000); // 1秒更新一次数据

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
          <h3 className="font-medium text-white">波浪球体</h3>
          <p className="text-xs text-blue-200/70">数据可视化</p>
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
            <WaveSphere3D 
              isActive={isActive} 
              waveIntensity={waveIntensity} 
              data={data}
            />
            {isActive && <OrbitControls enableZoom={false} enablePan={false} />}
          </Canvas>
        </div>
      </div>

      {/* 数据可视化指示器 */}
      <div className="mt-2 mb-3">
        <div className="flex items-center justify-between text-xs text-blue-200/70">
          <span>波浪高度: {Math.round(data.value1 * 100)}%</span>
          <span>波浪频率: {Math.round(data.value2 * 100)}%</span>
        </div>
        <div className="flex items-center justify-between text-xs text-blue-200/70 mt-1">
          <span>波浪速度: {Math.round(data.value3 * 100)}%</span>
          <span>声纹强度: {Math.round(data.value4 * 100)}%</span>
        </div>
      </div>

      {/* 波浪强度控制 */}
      <div className="mt-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-blue-200/70">波浪强度</span>
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