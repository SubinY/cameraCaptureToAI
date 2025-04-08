"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useDebug } from "@/lib/debug-context";
import { SettingsIcon, X, AlertTriangle, Zap } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function DebugPanel() {
  const { 
    isDebugPanelVisible, 
    isDevelopment,
    toggleDebugPanel,
    useMockData,
    toggleMockData,
    setDetectionResult
  } = useDebug();
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // 隐藏面板
  const hidePanel = () => {
    toggleDebugPanel();
  };

  // 测试情绪检测API
  const testDetectionAPI = async () => {
    setLoading(true);
    try {
      // 从视频元素获取当前帧
      const videoElement = document.querySelector("video");
      if (!videoElement) {
        toast.error("找不到视频元素");
        return;
      }

      // 创建canvas并绘制当前视频帧
      const canvas = document.createElement("canvas");
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        toast.error("无法创建canvas上下文");
        return;
      }
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      // 转换为base64
      const imageData = canvas.toDataURL("image/jpeg");
      
      // 发送到AI检测API
      const userId = "test-user-1";
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

      const data = await response.json();
      console.log("AI检测结果:", data);
      
      // 将结果设置为状态和全局上下文
      setResult(data);
      setDetectionResult(data);
      
      // 显示成功消息
      toast.success("AI检测成功");
    } catch (error) {
      console.error("AI检测失败:", error);
      toast.error(`AI检测失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  // 获取阈值配置信息
  const getThresholds = async () => {
    try {
      const response = await fetch("/api/detection/thresholds");
      if (!response.ok) {
        throw new Error(`API错误: ${response.status}`);
      }
      const data = await response.json();
      console.log("阈值配置:", data);
      toast.info("阈值配置已打印到控制台");
    } catch (error) {
      console.error("获取阈值失败:", error);
      toast.error(`获取阈值失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  // 不是开发模式或面板不可见时不渲染
  if (!isDevelopment || !isDebugPanelVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 w-80 md:w-96 transition-all duration-300 ease-in-out">
      <Card className="bg-card/90 backdrop-blur-sm border-border text-foreground shadow-lg rounded-lg">
        <CardHeader className="pb-2 flex flex-row justify-between items-center">
          <CardTitle className="text-xl font-semibold flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" />
            调试面板
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={hidePanel} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center">
                <Zap className="w-4 h-4 mr-2 text-yellow-500" />
                <Label htmlFor="mock-toggle" className="text-sm font-medium">使用模拟数据</Label>
              </div>
              <Switch 
                id="mock-toggle"
                checked={useMockData}
                onCheckedChange={toggleMockData}
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={testDetectionAPI} 
                disabled={loading}
                variant="default"
                className="flex-1"
                size="sm"
              >
                {loading ? "检测中..." : "测试AI检测"}
              </Button>
              
              <Button 
                onClick={getThresholds} 
                variant="outline"
                className="flex-1"
                size="sm"
              >
                获取阈值配置
              </Button>
            </div>
            
            {result && (
              <div className="mt-2 space-y-2 overflow-auto max-h-[300px] text-sm border border-border rounded-md p-3">
                <h3 className="font-semibold text-primary">检测结果:</h3>
                
                <div className="space-y-1">
                  <h4 className="font-medium text-secondary-foreground">情绪分析:</h4>
                  <div className="bg-muted rounded-sm p-2 overflow-x-auto">
                    <pre className="text-xs">{JSON.stringify(result.emotion, null, 2)}</pre>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h4 className="font-medium text-secondary-foreground">体态监测:</h4>
                  <div className="bg-muted rounded-sm p-2 overflow-x-auto">
                    <pre className="text-xs">{JSON.stringify(result.posture, null, 2)}</pre>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h4 className="font-medium text-secondary-foreground">注意力分析:</h4>
                  <div className="bg-muted rounded-sm p-2 overflow-x-auto">
                    <pre className="text-xs">{JSON.stringify(result.attention, null, 2)}</pre>
                  </div>
                </div>
                
                {result.alerts && result.alerts.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="font-medium text-yellow-500">警报:</h4>
                    <div className="bg-yellow-950/20 rounded-sm p-2 overflow-x-auto">
                      <pre className="text-xs">{JSON.stringify(result.alerts, null, 2)}</pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 调试开关按钮组件
export function DebugToggle() {
  const { isDevelopment, toggleDebugPanel } = useDebug();

  // 不是开发模式时不渲染
  if (!isDevelopment) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className="fixed right-4 bottom-4 z-50 bg-background/80 backdrop-blur-sm hover:bg-muted"
      onClick={toggleDebugPanel}
    >
      <SettingsIcon className="h-5 w-5 text-primary" />
    </Button>
  );
} 