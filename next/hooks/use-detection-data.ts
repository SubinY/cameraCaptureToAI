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

// 全局状态
type GlobalState = {
  data: DetectionData | null;
  loading: boolean;
  error: string | null;
  subscribers: Set<(data: DetectionData | null) => void>;
  intervalId: NodeJS.Timeout | null;
  isRequesting: boolean; // 添加请求锁
  lastRequestTime: number; // 添加最后请求时间
};

const globalState: GlobalState = {
  data: null,
  loading: false,
  error: null,
  subscribers: new Set(),
  intervalId: null,
  isRequesting: false,
  lastRequestTime: 0,
};

// 从真实服务器获取数据
const fetchRealData = async () => {
  // 如果已经在请求中，或者距离上次请求不足3秒，则跳过
  const now = Date.now();
  if (globalState.isRequesting || (now - globalState.lastRequestTime < 3000)) {
    return;
  }

  globalState.isRequesting = true;
  globalState.loading = true;
  globalState.error = null;
  notifySubscribers();
  
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
    globalState.data = result;
    globalState.lastRequestTime = Date.now();
    notifySubscribers();
  } catch (err) {
    console.error("获取检测数据失败:", err);
    globalState.error = err instanceof Error ? err.message : "未知错误";
    
    // 开发环境显示错误
    if (process.env.NODE_ENV === 'development') {
      toast.error(`获取真实数据失败: ${err instanceof Error ? err.message : '未知错误'}`);
    }
    notifySubscribers();
  } finally {
    globalState.loading = false;
    globalState.isRequesting = false;
    notifySubscribers();
  }
};

// 获取模拟数据
const fetchMockData = () => {
  // 如果已经在请求中，或者距离上次请求不足3秒，则跳过
  const now = Date.now();
  if (globalState.isRequesting || (now - globalState.lastRequestTime < 3000)) {
    return;
  }

  globalState.isRequesting = true;
  globalState.loading = true;
  notifySubscribers();
  
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
    globalState.data = formattedMockData;
    globalState.loading = false;
    globalState.isRequesting = false;
    globalState.lastRequestTime = Date.now();
    notifySubscribers();
  }, 300);
};

// 通知所有订阅者
const notifySubscribers = () => {
  globalState.subscribers.forEach(callback => {
    callback(globalState.data);
  });
};

// 开始数据采样
const startSampling = (useMockData: boolean) => {
  if (globalState.intervalId) {
    clearInterval(globalState.intervalId);
  }
  
  // 首次获取数据
  if (useMockData) {
    fetchMockData();
  } else {
    fetchRealData();
  }
  
  // 设置定时器
  globalState.intervalId = setInterval(
    () => useMockData ? fetchMockData() : fetchRealData(),
    SAMPLING_INTERVAL
  );
};

// 停止数据采样
const stopSampling = () => {
  if (globalState.intervalId) {
    clearInterval(globalState.intervalId);
    globalState.intervalId = null;
  }
};

export function useDetectionData() {
  const { useMockData, lastDetectionResult } = useDebug();
  const [localData, setLocalData] = useState<DetectionData | null>(globalState.data);
  const [localLoading, setLocalLoading] = useState(globalState.loading);
  const [localError, setLocalError] = useState<string | null>(globalState.error);
  const prevMockDataRef = useRef(useMockData);

  // 订阅全局状态变化
  useEffect(() => {
    const handleDataChange = (newData: DetectionData | null) => {
      setLocalData(newData);
      setLocalLoading(globalState.loading);
      setLocalError(globalState.error);
    };

    // 添加订阅
    globalState.subscribers.add(handleDataChange);

    // 如果是第一个订阅者，开始数据采样
    if (globalState.subscribers.size === 1) {
      startSampling(useMockData);
    }

    // 清理函数
    return () => {
      globalState.subscribers.delete(handleDataChange);
      // 如果没有订阅者了，停止数据采样
      if (globalState.subscribers.size === 0) {
        stopSampling();
      }
    };
  }, [useMockData]);

  // 处理模式切换
  useEffect(() => {
    if (prevMockDataRef.current !== useMockData) {
      if (prevMockDataRef.current === true && useMockData === false) {
        globalState.data = null;
        notifySubscribers();
      }
      startSampling(useMockData);
    }
    prevMockDataRef.current = useMockData;
  }, [useMockData]);

  // 使用最后一次检测结果（如果有）
  useEffect(() => {
    if (lastDetectionResult) {
      globalState.data = lastDetectionResult;
      notifySubscribers();
    }
  }, [lastDetectionResult]);

  const refreshData = () => {
    if (useMockData) {
      fetchMockData();
    } else {
      fetchRealData();
    }
  };

  return {
    data: localData,
    loading: localLoading,
    error: localError,
    refreshData
  };
} 