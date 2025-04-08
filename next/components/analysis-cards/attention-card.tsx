"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";
import { useDetectionData } from "@/hooks/use-detection-data";

interface HeatmapPoint {
  x: number;
  y: number;
  intensity: number;
}

interface AttentionData {
  heatmap: HeatmapPoint[];
  time_slot: Record<string, number>;
}

interface AttentionCardProps {
  className?: string;
}

// Define attention levels
const ATTENTION_LEVELS = {
  HIGH: { min: 80, label: "高度集中", color: "#4CAF50" },
  NORMAL: { min: 60, label: "正常", color: "#2196F3" },
  DISTRACTED: { min: 40, label: "分散", color: "#FFC107" },
  LOW: { min: 0, label: "走神", color: "#F44336" },
};

const AttentionCard = ({ className }: AttentionCardProps) => {
  // 使用detection hook获取数据
  const { data: detectionData, loading } = useDetectionData();
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [data, setData] = useState<AttentionData>({
    heatmap: Array.from({ length: 50 }, () => ({
      x: Math.random(),
      y: Math.random(),
      intensity: Math.random(),
    })),
    time_slot: {
      "0-5min": 75,
      "5-10min": 82,
      "10-15min": 65,
      "15-20min": 58,
      "20-25min": 70,
    },
  });
  const [currentAttention, setCurrentAttention] = useState(75);
  const [attentionHistory, setAttentionHistory] = useState<{ time: string, value: number }[]>([]);
  const [attentionLevel, setAttentionLevel] = useState(ATTENTION_LEVELS.NORMAL);

  // 从检测数据更新组件状态
  useEffect(() => {
    if (detectionData && detectionData.attention) {
      // 更新热力图和时间槽数据
      setData({
        heatmap: detectionData.attention.heatmap.map(point => ({
          x: point[0],
          y: point[1],
          intensity: point[2]
        })),
        time_slot: detectionData.attention.time_slot
      });
      
      // 更新当前注意力值
      const newAttention = detectionData.attention.current_attention;
      setCurrentAttention(newAttention);
      
      // 添加到历史记录
      const now = new Date();
      const timeString = `${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
      
      setAttentionHistory(prev => {
        const newHistory = [...prev, { time: timeString, value: newAttention }];
        if (newHistory.length > 20) {
          return newHistory.slice(-20);
        }
        return newHistory;
      });
      
      // 确定注意力级别
      if (newAttention >= ATTENTION_LEVELS.HIGH.min) {
        setAttentionLevel(ATTENTION_LEVELS.HIGH);
      } else if (newAttention >= ATTENTION_LEVELS.NORMAL.min) {
        setAttentionLevel(ATTENTION_LEVELS.NORMAL);
      } else if (newAttention >= ATTENTION_LEVELS.DISTRACTED.min) {
        setAttentionLevel(ATTENTION_LEVELS.DISTRACTED);
      } else {
        setAttentionLevel(ATTENTION_LEVELS.LOW);
      }
    }
  }, [detectionData]);

  // Prepare chart data
  const chartData = Object.entries(data.time_slot).map(([time, value]) => ({
    time,
    value,
  }));

  // Draw heatmap on canvas
  useEffect(() => {
    if (!canvasRef.current || !data.heatmap.length) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw heatmap
    data.heatmap.forEach(point => {
      const x = point.x * canvas.width;
      const y = point.y * canvas.height;
      const intensity = point.intensity;
      
      // Create radial gradient for each point
      const radius = 30 + intensity * 30;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      
      // Color based on intensity
      const alpha = Math.min(0.7, intensity);
      gradient.addColorStop(0, `rgba(255, 0, 0, ${alpha})`);
      gradient.addColorStop(0.7, `rgba(255, 255, 0, ${alpha * 0.5})`);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Apply blur effect for smoother visualization
    ctx.filter = 'blur(5px)';
    ctx.drawImage(canvas, 0, 0);
    ctx.filter = 'none';
    
  }, [data.heatmap]);

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300 h-full flex flex-col",
      currentAttention < 60 && "border-amber-500",
      currentAttention < 40 && "border-red-500",
      className
    )}>
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg md:text-xl">注意力监测</CardTitle>
          <Badge 
            variant={currentAttention >= 60 ? "default" : "outline"}
            className={cn(
              "bg-opacity-80",
              loading && "animate-pulse",
              currentAttention < 40 && "bg-red-500 text-red-950",
              currentAttention >= 40 && currentAttention < 60 && "bg-amber-500 text-amber-950",
              currentAttention >= 60 && currentAttention < 80 && "bg-green-500 text-green-950",
              currentAttention >= 80 && "bg-blue-500 text-blue-950"
            )}
          >
            {loading ? "加载中..." : attentionLevel.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0 flex-1 overflow-y-auto">
        <div className="relative h-[80px] sm:h-[90px] lg:h-[100px] mb-2 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
          <canvas 
            ref={canvasRef} 
            width={300} 
            height={200} 
            className="w-full h-full"
          />
          <div 
            className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black bg-opacity-50 text-white text-xs rounded"
          >
            注意力: {Math.round(currentAttention)}%
          </div>
        </div>
        
        <div className="h-[100px] sm:h-[110px] lg:h-[120px]">
          <p className="text-xs text-muted-foreground mb-1">注意力时间线</p>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={attentionHistory}>
              <XAxis 
                dataKey="time" 
                fontSize={9}
                tickMargin={3}
                tickFormatter={(value) => value.split(':')[0] + ':' + value.split(':')[1]}
              />
              <YAxis 
                domain={[0, 100]} 
                fontSize={9}
                tickCount={5}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                formatter={(value: number) => [`${value}%`, '注意力']}
                labelFormatter={(label) => `时间: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={attentionLevel.color} 
                strokeWidth={1.5} 
                dot={false}
                activeDot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-1 flex flex-wrap gap-y-1 justify-between items-center">
          <div className="flex flex-wrap gap-2">
            {Object.values(ATTENTION_LEVELS).map((level) => (
              <div key={level.label} className="flex items-center space-x-1">
                <div 
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: level.color }}
                />
                <span className="text-[10px] sm:text-xs whitespace-nowrap">{level.label}</span>
              </div>
            ))}
          </div>
          <div className="text-[10px] sm:text-xs text-muted-foreground">
            平均: {Math.round(
              attentionHistory.reduce((sum, item) => sum + item.value, 0) / 
              (attentionHistory.length || 1)
            )}%
          </div>
        </div>
        
        {currentAttention < 40 && (
          <div className="mt-1 p-1 sm:p-1.5 bg-red-100 dark:bg-red-900 dark:bg-opacity-20 rounded text-[10px] sm:text-xs text-center animate-pulse">
            注意力严重下降，建议短暂休息或转换任务。
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AttentionCard; 