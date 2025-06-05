"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

export function HistoryCard({ className }: { className?: string }) {
  const [history, setHistory] = useState<any[]>([])

  // 模拟数据更新
  useEffect(() => {
    const mockData = [
      { time: '10:00', score: 85 },
      { time: '10:30', score: 72 },
      { time: '11:00', score: 90 },
      { time: '11:30', score: 78 },
      { time: '12:00', score: 88 },
      { time: '12:30', score: 95 },
    ]
    
    setHistory(mockData)
  }, [])

  return (
    <div className={`flex flex-col h-full rounded-2xl bg-white dark:bg-milk-dark card-border p-4 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-milk-text dark:text-white">历史记录</h3>
      </div>
     
      <div className="flex-1 overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={history} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="time" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
            <Bar 
              dataKey="score" 
              fill="#3b82f6" 
              radius={[4, 4, 0, 0]} 
              barSize={12} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
} 