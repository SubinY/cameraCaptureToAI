"use client"

import { Zap, WifiOff } from "lucide-react"

export function StatusIndicators() {
  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-1">
        <Zap className="h-3.5 w-3.5 text-milk-dark dark:text-white" />
        <span className="text-xs font-medium text-milk-dark dark:text-white">
          网络良好
        </span>
      </div>
    </div>
  )
} 