"use client"

import { useState, useEffect, useCallback } from 'react';

interface UseCameraResult {
  isCameraOn: boolean;
  toggleCamera: () => void;
  error: string | null;
}

export function useCamera(): UseCameraResult {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 切换摄像头状态
  const toggleCamera = useCallback(() => {
    setIsCameraOn((prev) => !prev);
  }, []);

  return {
    isCameraOn,
    toggleCamera,
    error
  };
} 