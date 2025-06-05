"use client"

import { useState } from "react"
import Image from "next/image"
import { StatusIndicators } from "@/components/common/status-indicators"
import { Camera, CameraOff } from "lucide-react"
import { WebRTCCamera } from "./webrtc-camera"

export function RoomView() {
  const [showCamera, setShowCamera] = useState(false)
  
  const toggleCamera = () => {
    setShowCamera(prev => !prev)
  }

  return (
    <div className="h-full rounded-2xl sm:rounded-3xl overflow-hidden relative tech-card hover-3d card-border">
      {/* 房间图片或摄像头 */}
      <div className="absolute inset-0">
        {showCamera ? (
          <WebRTCCamera onAnalysisResult={(data) => console.log('分析结果:', data)} />
        ) : (
          <>
            <Image src="/placeholder.jpg" alt="摄像头预览" fill className="object-cover room-image-zoom" />
            {/* 渐变叠加层 */}
            <div className="absolute inset-0 bg-gradient-to-t from-milk-text-dark/60 to-transparent"></div>
          </>
        )}
      </div>

      {/* 顶部状态栏 */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleCamera}
            className="tech-badge tech-badge-secondary flex items-center gap-1.5 py-1 px-3 ml-2 card-border hover:bg-milk-dark hover:text-white transition-colors"
          >
            {showCamera ? <CameraOff className="h-3 w-3" /> : <Camera className="h-3 w-3" />}
            <span className="text-xs">{showCamera ? '关闭摄像头' : '打开摄像头'}</span>
          </button>
        </div>

        {/* 状态指标 */}
        <StatusIndicators />
      </div>

      {/* 底部信息 */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold mb-1">AI视觉识别</h3>
            <p className="text-xs sm:text-sm text-white/80">基于WebRTC的实时分析</p>
          </div>
        </div>
      </div>
    </div>
  )
} 