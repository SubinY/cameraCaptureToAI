"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WebRTCCamera } from "@/components/webrtc-camera"
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Camera, BarChart2 } from "lucide-react"

interface CameraCardProps {
  isActive: boolean
}

// 颜色配置
const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function CameraCard({ isActive }: CameraCardProps) {
  const [showCamera, setShowCamera] = useState(false)
  const [analysisData, setAnalysisData] = useState<any>({
    statistics: {
      work: { count: 45 },
      eating: { count: 12 },
      drinking_water: { count: 8 },
      phone: { count: 15 },
      other: { count: 5 }
    }
  })

  // 定义行为名称转换函数
  const getBehaviorName = (key: string) => {
    const names: Record<string, string> = {
      work: '工作',
      eating: '吃东西',
      drinking_water: '喝水',
      drinking_beverage: '喝饮料',
      phone: '玩手机',
      sleeping: '睡觉',
      other: '其他'
    }
    return names[key] || key
  }

  // 转换数据为图表格式
  const chartData = Object.entries(analysisData.statistics || {}).map(([key, value]: [string, any]) => ({
    name: getBehaviorName(key),
    value: value.count,
  }))

  const handleAnalysisResult = (data: any) => {
    console.log('收到分析结果:', data)
    setAnalysisData(data)
  }

  return (
    <Card className="tech-card card-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center justify-between">
          <div className="flex items-center">
            <Camera className="h-5 w-5 mr-2 text-primary" />
            摄像头
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowCamera(!showCamera)}
          >
            {showCamera ? '关闭摄像头' : '打开摄像头'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {showCamera ? (
          <div className="h-[250px] w-full rounded-lg overflow-hidden mb-4">
            <WebRTCCamera onAnalysisResult={handleAnalysisResult} />
          </div>
        ) : null}

        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2 flex items-center">
            <BarChart2 className="h-4 w-4 mr-1 text-primary" />
            数据统计
          </h4>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}