"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// 调试状态类型
type DebugState = {
  isDebugMode: boolean;
  isDebugPanelVisible: boolean;
  useMockData: boolean;
  isDevelopment: boolean;
  lastDetectionResult: any | null;
};

// 调试上下文类型
type DebugContextType = DebugState & {
  toggleDebugPanel: () => void;
  toggleMockData: () => void;
  setDetectionResult: (result: any) => void;
};

// 创建上下文
const DebugContext = createContext<DebugContextType | undefined>(undefined);

// 上下文提供者属性
type DebugProviderProps = {
  children: ReactNode;
};

// 调试上下文提供者
export function DebugProvider({ children }: DebugProviderProps) {
  // 初始状态
  const [state, setState] = useState<DebugState>({
    isDebugMode: false, 
    isDebugPanelVisible: false,
    useMockData: true,
    isDevelopment: false,
    lastDetectionResult: null,
  });

  // 检测开发模式
  useEffect(() => {
    setState(prev => ({
      ...prev,
      isDevelopment: process.env.NODE_ENV === "development"
    }));
  }, []);

  // 切换调试面板可见性
  const toggleDebugPanel = () => {
    setState(prev => ({
      ...prev,
      isDebugPanelVisible: !prev.isDebugPanelVisible
    }));
  };

  // 切换是否使用模拟数据
  const toggleMockData = () => {
    setState(prev => ({
      ...prev,
      useMockData: !prev.useMockData
    }));
  };

  // 设置检测结果
  const setDetectionResult = (result: any) => {
    setState(prev => ({
      ...prev,
      lastDetectionResult: result
    }));
  };

  const value = {
    ...state,
    toggleDebugPanel,
    toggleMockData,
    setDetectionResult
  };

  return <DebugContext.Provider value={value}>{children}</DebugContext.Provider>;
}

// 使用调试上下文的自定义Hook
export function useDebug() {
  const context = useContext(DebugContext);
  if (context === undefined) {
    throw new Error("useDebug must be used within a DebugProvider");
  }
  return context;
} 