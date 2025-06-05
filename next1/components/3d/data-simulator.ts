// 数据模拟器 - 生成模拟数据并实现平滑过渡
import { useState, useEffect, useRef } from 'react';

// 数据类型定义
export interface SimulatedData {
  value1: number; // 主要波浪高度 (0-1)
  value2: number; // 波浪频率 (0-1)
  value3: number; // 波浪速度 (0-1)
  value4: number; // 细节波浪/声纹强度 (0-1)
}

// 缓动函数 - 使用三次方缓动实现更自然的过渡
export const easeInOutCubic = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

// 应用缓动的平滑过渡函数
export const smoothEasedTransition = (current: number, target: number, progress: number): number => {
  const easedProgress = easeInOutCubic(progress);
  return current + (target - current) * easedProgress;
};

// 数据模拟器钩子
export const useDataSimulator = (isActive: boolean = true, updateInterval: number = 1000) => {
  // 当前数据状态
  const [data, setData] = useState<SimulatedData>({
    value1: 0.5, // 初始波浪高度
    value2: 0.5, // 初始波浪频率
    value3: 0.5, // 初始波浪速度
    value4: 0.3, // 初始细节波浪/声纹强度
  });

  // 目标数据状态 - 用于平滑过渡
  const targetDataRef = useRef<SimulatedData>({
    value1: 0.5,
    value2: 0.5,
    value3: 0.5,
    value4: 0.3,
  });

  // 过渡进度跟踪
  const [transitionProgress, setTransitionProgress] = useState(1); // 1表示过渡完成
  
  // 动画帧引用
  const animationFrameRef = useRef<number>();
  
  // 上次更新时间戳
  const lastUpdateTimestampRef = useRef(performance.now());
  
  // 上次数据变化时间戳
  const lastDataChangeTimestampRef = useRef(performance.now());

  // 生成随机目标数据
  const generateRandomTargetData = () => {
    // 为了模拟声纹/心电图效果，value4(声纹强度)变化最大
    return {
      value1: 0.3 + Math.random() * 0.5, // 0.3-0.8范围，波浪高度适中
      value2: 0.4 + Math.random() * 0.4, // 0.4-0.8范围，波浪频率适中
      value3: 0.3 + Math.random() * 0.6, // 0.3-0.9范围，波浪速度变化较大
      value4: Math.random() > 0.7 
        ? 0.7 + Math.random() * 0.3 // 30%概率产生高强度声纹 (0.7-1.0)
        : 0.1 + Math.random() * 0.5, // 70%概率产生低到中等强度声纹 (0.1-0.6)
    };
  };

  // 更新数据的函数 - 使用requestAnimationFrame实现平滑过渡
  useEffect(() => {
    if (!isActive) return;
    
    const TRANSITION_DURATION = 800; // 过渡持续时间(毫秒)
    
    // 动画帧函数
    const animate = (timestamp: number) => {
      const deltaTime = timestamp - lastUpdateTimestampRef.current;
      lastUpdateTimestampRef.current = timestamp;
      
      // 检查是否需要生成新的目标数据
      if (timestamp - lastDataChangeTimestampRef.current > updateInterval && transitionProgress >= 1) {
        targetDataRef.current = generateRandomTargetData();
        setTransitionProgress(0); // 重置过渡进度
        lastDataChangeTimestampRef.current = timestamp;
      }
      
      // 更新过渡进度
      if (transitionProgress < 1) {
        setTransitionProgress(prev => {
          const newProgress = Math.min(prev + deltaTime / TRANSITION_DURATION, 1);
          return newProgress;
        });
      }
      
      // 平滑过渡到目标数据
      setData(prev => ({
        value1: smoothEasedTransition(prev.value1, targetDataRef.current.value1, transitionProgress),
        value2: smoothEasedTransition(prev.value2, targetDataRef.current.value2, transitionProgress),
        value3: smoothEasedTransition(prev.value3, targetDataRef.current.value3, transitionProgress),
        value4: smoothEasedTransition(prev.value4, targetDataRef.current.value4, transitionProgress),
      }));
      
      // 继续动画循环
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    // 启动动画
    animationFrameRef.current = requestAnimationFrame(animate);
    
    // 清理函数
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
    };
  }, [isActive, updateInterval, transitionProgress]);

  return { data };
};