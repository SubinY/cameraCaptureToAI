"use client";

import { useState, useEffect, useRef } from "react";
import { useDebug } from "@/lib/debug-context";
import { generateDynamicMockData } from "@/lib/mock-data";
import { toast } from "sonner";

const SAMPLING_INTERVAL = 10000; // 数据采样间隔（毫秒）

export type DetectionData = {
  timestamp: string;
  emotion: {
    emotion: string;
    confidence: number;
    duration_sec: number;
  };
  posture: {
    neck_angle: number;
    screen_distance: number;
    sit_duration: number;
  };
  attention: {
    heatmap: [number, number, number][];
    time_slot: Record<string, number>;
    current_attention: number;
  };
  alerts: {
    type: string;
    message: string;
    severity: number;
  }[];
};

export function useDetectionData() {
  const { useMockData, lastDetectionResult, isDevelopment } = useDebug();
  const [data, setData] = useState<DetectionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const prevMockDataRef = useRef(useMockData);

  // 从真实服务器获取数据
  const fetchRealData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 从视频元素获取当前帧
      const videoElement = document.querySelector("video");
      if (!videoElement) {
        throw new Error("找不到视频元素");
      }

      // 创建canvas并绘制当前视频帧
      const canvas = document.createElement("canvas");
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("无法创建canvas上下文");
      }
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      // 转换为base64
      const imageData = canvas.toDataURL("image/jpeg");
      
      // 发送到AI检测API
      const userId = "user-1";
      const response = await fetch(`/api/detection/analyze/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: imageData }),
      });

      if (!response.ok) {
        throw new Error(`API错误: ${response.status}`);
      }

      const result = await response.json();
      // 确保结果中的heatmap格式正确
      if (result && result.attention && Array.isArray(result.attention.heatmap)) {
        const formattedHeatmap = result.attention.heatmap.map((point: any) => {
          if (Array.isArray(point) && point.length === 3) {
            return point as [number, number, number];
          }
          return [0, 0, 0] as [number, number, number];
        });
        result.attention.heatmap = formattedHeatmap;
      }
      setData(result);
    } catch (err) {
      console.error("获取检测数据失败:", err);
      setError(err instanceof Error ? err.message : "未知错误");
      
      // 开发环境显示错误
      if (isDevelopment) {
        toast.error(`获取真实数据失败: ${err instanceof Error ? err.message : '未知错误'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // 获取模拟数据
  const fetchMockData = () => {
    setLoading(true);
    // 模拟网络延迟
    setTimeout(() => {
      const mockData = generateDynamicMockData();
      // 确保heatmap格式正确
      const formattedMockData = {
        ...mockData,
        attention: {
          ...mockData.attention,
          heatmap: mockData.attention.heatmap.map(point => {
            if (Array.isArray(point) && point.length === 3) {
              return point as [number, number, number];
            }
            return [0, 0, 0] as [number, number, number];
          })
        }
      };
      setData(formattedMockData);
      setLoading(false);
    }, 300);
  };

  // 手动触发数据刷新
  const refreshData = () => {
    if (useMockData) {
      fetchMockData();
    } else {
      fetchRealData();
    }
  };

  // 使用最后一次检测结果（如果有）
  useEffect(() => {
    if (lastDetectionResult) {
      setData(lastDetectionResult);
    }
  }, [lastDetectionResult]);

  // 设置数据采样定时器并处理模式切换
  useEffect(() => {
    // 当从模拟模式切换到真实模式时，清空数据
    if (prevMockDataRef.current !== useMockData && prevMockDataRef.current === true && useMockData === false) {
      setData(null);
    }
    
    // 更新之前的模式状态
    prevMockDataRef.current = useMockData;
    
    // 首次获取数据
    refreshData();
    
    // 定时获取数据
    intervalRef.current = setInterval(refreshData, SAMPLING_INTERVAL);
    
    // 清理函数
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [useMockData]); // 依赖于useMockData变化

  return {
    data,
    loading,
    error,
    refreshData
  };
} 