"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { StatusIndicators } from "./status-indicators"
import { Zap, Camera, CameraOff, ChevronDown, ChevronUp } from "lucide-react"
import { WebRTCCamera } from "./webrtc-camera"
import { cn } from "@/lib/utils"

export function RoomView() {
  const [isLive, setIsLive] = useState(true)
  const [showCamera, setShowCamera] = useState(false)
  const [showMobileControls, setShowMobileControls] = useState(false)
  
  const toggleCamera = () => {
    setShowCamera(prev => !prev)
  }

  const toggleMobileControls = () => {
    setShowMobileControls(prev => !prev)
  }

  return (
    <div className="h-full rounded-2xl sm:rounded-3xl overflow-hidden relative tech-card hover-3d card-border">
      {/* 房间图片或摄像头 */}
      <div className="absolute inset-0">
        {showCamera ? (
          <WebRTCCamera onAnalysisResult={(data) => console.log('分析结果:', data)} />
        ) : (
          <>
            <Image src="/placeholder.svg?height=800&width=1200" alt="客厅" fill className="object-cover room-image-zoom" />
            {/* 渐变叠加层 */}
            <div className="absolute inset-0 bg-gradient-to-t from-milk-text-dark/60 to-transparent"></div>
          </>
        )}
      </div>

      {/* 顶部状态栏 - 在移动设备上隐藏 */}
      <div className="absolute top-4 left-4 right-4 hidden md:flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div
            className={`tech-badge ${isLive ? "tech-badge-active" : "tech-badge-secondary"} flex items-center gap-1.5 py-1 px-3 card-border`}
          >
            <span className={`w-2 h-2 rounded-full ${isLive ? "bg-milk-dark animate-pulse" : "bg-milk-medium"}`}></span>
            <span className="text-xs">Live</span>
          </div>
          <button
            onClick={toggleCamera}
            className="tech-badge tech-badge-secondary flex items-center gap-1.5 py-1 px-3 ml-2 card-border hover:bg-milk-dark hover:text-white transition-colors"
          >
            {showCamera ? <CameraOff className="h-3 w-3" /> : <Camera className="h-3 w-3" />}
            <span className="text-xs">{showCamera ? '关闭摄像头' : '打开摄像头'}</span>
          </button>
        </div>

        {/* 状态指标 - 放在视频区域内部 */}
        <StatusIndicators />
      </div>

      {/* 底部信息 */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold mb-1">客厅</h3>
            <p className="text-xs sm:text-sm text-white/80">5 个设备</p>
          </div>

          {/* 移动设备上显示的快捷操作按钮 */}
          <div className="flex md:hidden items-center gap-2">
            <button 
              onClick={toggleMobileControls}
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 card-border"
            >
              {showMobileControls ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 移动端控制面板 */}
      <div className={cn(
        "md:hidden absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-md transition-all duration-300 transform",
        showMobileControls ? "translate-y-0" : "translate-y-full"
      )}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div
                className={`tech-badge ${isLive ? "tech-badge-active" : "tech-badge-secondary"} flex items-center gap-1.5 py-1 px-3 card-border`}
              >
                <span className={`w-2 h-2 rounded-full ${isLive ? "bg-milk-dark animate-pulse" : "bg-milk-medium"}`}></span>
                <span className="text-xs">Live</span>
              </div>
              <button
                onClick={toggleCamera}
                className="tech-badge tech-badge-secondary flex items-center gap-1.5 py-1 px-3 ml-2 card-border hover:bg-milk-dark hover:text-white transition-colors"
              >
                {showCamera ? <CameraOff className="h-3 w-3" /> : <Camera className="h-3 w-3" />}
                <span className="text-xs">{showCamera ? '关闭摄像头' : '打开摄像头'}</span>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <button className="w-full py-2 px-3 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 card-border">
              <Zap className="h-4 w-4 mr-2" />
              <span className="text-xs">控制设备</span>
            </button>
            <button className="w-full py-2 px-3 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 card-border">
              <Zap className="h-4 w-4 mr-2" />
              <span className="text-xs">查看历史</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2.5D 悬浮元素 - 在移动设备上隐藏 */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 hidden md:block">
        <div className="glass-effect rounded-xl p-3 floating card-border">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-milk-dark pulse-glow"></div>
            <span className="text-xs font-medium text-white">系统正常</span>
          </div>
        </div>
      </div>
    </div>
  )
}

