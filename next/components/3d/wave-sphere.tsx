"use client";

import { useState, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { cn } from "@/lib/utils";
import { 
  vertexShader, 
  fragmentShader, 
  defaultColors,
  defaultWaveConfig,
  sphereGeometryConfig 
} from "./config";
import { useDataSimulator, SimulatedData } from "./data-simulator";

interface WaveSphereProps {
  isActive: boolean;
  waveIntensity: number;
  colors?: {
    color1: string;
    color2: string;
    highlightColor: string;
    inactiveColor1: string;
    inactiveColor2: string;
  };
}

// 3D球体组件 - 在Canvas中渲染
export function WaveSphere3D({ 
  isActive, 
  waveIntensity,
  data,
  colors = defaultColors
}: WaveSphereProps & { data: SimulatedData }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  // 平滑过渡波浪强度
  const [transitionFactor, setTransitionFactor] = useState(0); // 0-1之间的过渡因子
  const prevWaveIntensityRef = useRef(waveIntensity);
  const animationFrameRef = useRef<number>();

  // 计算实际位移量
  const actualWaveIntensity = isActive ? waveIntensity / 100 : 0;

  // 缓动函数 - 使用三次方缓动实现更自然的过渡
  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  // 平滑过渡波浪强度
  useEffect(() => {
    if (!isActive) return;
    
    // 检测波浪强度变化
    if (prevWaveIntensityRef.current !== waveIntensity) {
      // 重置过渡因子，开始新的过渡
      setTransitionFactor(0);
      prevWaveIntensityRef.current = waveIntensity;
    }
    
    // 使用requestAnimationFrame实现平滑过渡
    let lastTime = performance.now();
    const TRANSITION_DURATION = defaultWaveConfig.transitionDuration; // 过渡持续时间(毫秒)
    
    const animateTransition = (time: number) => {
      const deltaTime = time - lastTime;
      lastTime = time;
      
      // 更新过渡因子
      setTransitionFactor(prev => {
        const newValue = Math.min(prev + deltaTime / TRANSITION_DURATION, 1);
        return newValue;
      });
      
      // 如果过渡未完成，继续动画
      if (transitionFactor < 1) {
        animationFrameRef.current = requestAnimationFrame(animateTransition);
      }
    };
    
    // 启动过渡动画
    if (transitionFactor < 1) {
      animationFrameRef.current = requestAnimationFrame(animateTransition);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, waveIntensity, transitionFactor]);
  
  // 动画循环 - 更新着色器参数
  useFrame(({ clock }) => {
    if (meshRef.current && materialRef.current) {
      // 更新时间uniform用于着色器动画
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
      
      if (isActive) {
        // 更新着色器中的数据参数
        materialRef.current.uniforms.uDataValue1.value = data.value1;
        materialRef.current.uniforms.uDataValue2.value = data.value2;
        materialRef.current.uniforms.uDataValue3.value = data.value3;
        materialRef.current.uniforms.uDataValue4.value = data.value4;
        
        // 平滑过渡波浪强度 - 使用缓动函数
        const easedWaveIntensity = easeInOutCubic(transitionFactor);
        materialRef.current.uniforms.uWaveIntensity.value = actualWaveIntensity;
        
        // 根据数据调整网格变形
        if (meshRef.current.scale) {
          // 根据数据值1轻微调整球体大小
          const targetScaleFactor = 1 + (data.value1 - 0.5) * 0.1;
          // 当前缩放值
          const currentScale = meshRef.current.scale.x;
          // 平滑过渡到目标缩放值
          const newScale = currentScale + (targetScaleFactor - currentScale) * 0.05;
          meshRef.current.scale.set(newScale, newScale, newScale);
        }
        
        // 根据数据值3和数据值4调整旋转速度
        const rotationSpeed = 0.003 * (1 + (data.value3 + data.value4) * 0.25);
        meshRef.current.rotation.y += rotationSpeed;
        meshRef.current.rotation.x += rotationSpeed * 0.3;
      }
    }
  });

  // 根据活跃状态设置颜色
  const color1 = isActive
    ? new THREE.Color(colors.color1)
    : new THREE.Color(colors.inactiveColor1);
  const color2 = isActive
    ? new THREE.Color(colors.color2)
    : new THREE.Color(colors.inactiveColor2);
  const highlightColor = isActive
    ? new THREE.Color(colors.highlightColor)
    : new THREE.Color(colors.inactiveColor2);

  return (
    <mesh ref={meshRef}>
      <sphereGeometry 
        args={[
          sphereGeometryConfig.radius, 
          sphereGeometryConfig.widthSegments, 
          sphereGeometryConfig.heightSegments
        ]} 
      />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uColor1: { value: color1 },
          uColor2: { value: color2 },
          uHighlightColor: { value: highlightColor },
          // 数据值传递给着色器
          uDataValue1: { value: data.value1 },
          uDataValue2: { value: data.value2 },
          uDataValue3: { value: data.value3 },
          uDataValue4: { value: data.value4 },
          // 波浪强度参数
          uWaveIntensity: { value: actualWaveIntensity },
        }}
        transparent={true}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// 波浪球体卡片组件 - 包含UI控制
export function WaveSphereCard({
  isActive: initialActive = false,
  onToggle,
}: {
  isActive?: boolean;
  onToggle?: () => void;
}) {
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
          <h3 className="font-medium text-white">Wave Sphere</h3>
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
          <span>数据值1: {Math.round(data.value1 * 100)}%</span>
          <span>数据值2: {Math.round(data.value2 * 100)}%</span>
        </div>
        <div className="flex items-center justify-between text-xs text-blue-200/70 mt-1">
          <span>数据值3: {Math.round(data.value3 * 100)}%</span>
          <span>数据值4: {Math.round(data.value4 * 100)}%</span>
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