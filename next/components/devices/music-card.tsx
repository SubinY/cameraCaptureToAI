"use client"

import { useState } from "react"
import Image from "next/image"
import { Play, Pause, SkipBack, SkipForward } from "lucide-react"
import { cn } from "@/lib/utils"

interface MusicCardProps {
  isActive?: boolean
  onToggle?: () => void
}

export function MusicCard({ isActive: initialActive = false, onToggle }: MusicCardProps) {
  const [isActive, setIsActive] = useState(initialActive)
  const [isPlaying, setIsPlaying] = useState(true)

  const handleToggle = () => {
    const newState = !isActive
    setIsActive(newState)
    if (onToggle) onToggle()
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  return (
    <div
      className={cn(
        "h-full rounded-3xl p-4 relative overflow-hidden tech-card hover-effect hover-3d card-border transition-all duration-500",
        isActive ? "device-active" : "device-inactive",
        "bg-gradient-to-br from-[#0A1929] to-[#0F2942] text-white",
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="font-medium text-white">Speakers</h3>
          <p className="text-xs text-blue-200/70">Playing</p>
        </div>

        <label className="relative inline-flex items-center cursor-pointer toggle-switch-animation">
          <input type="checkbox" checked={isActive} onChange={handleToggle} className="sr-only peer" />
          <div
            className={cn(
              "w-12 h-6 rounded-full peer transition-all duration-300",
              isActive ? "switch-active" : "switch-inactive",
            )}
          >
            <span
              className="text-[10px] absolute right-1.5 top-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity duration-300"
              style={{ opacity: isActive ? 1 : 0 }}
            >
              ON
            </span>
            <span
              className="text-[10px] absolute left-1.5 top-1/2 -translate-y-1/2 text-gray-300 opacity-0 transition-opacity duration-300"
              style={{ opacity: isActive ? 0 : 1 }}
            >
              OFF
            </span>
          </div>
          <div
            className={cn(
              "absolute top-[2px] left-[2px] bg-white w-5 h-5 rounded-full transition-all duration-300 transform",
              isActive ? "translate-x-6 switch-thumb-active" : "switch-thumb-inactive",
            )}
          ></div>
        </label>
      </div>

      <div className="flex flex-col items-center justify-center h-[140px]">
        {/* 时间指示器 */}
        <div className="flex items-center justify-between w-full mb-2">
          <span className="text-xs text-blue-200/70">0:34</span>
          <span className="text-xs text-blue-200/70">2:27</span>
        </div>

        {/* 进度条 */}
        <div className="tech-progress-track w-full mb-4">
          <div
            className={cn(
              "tech-progress-bar transition-all duration-300",
              isActive ? "bg-gradient-to-r from-[#00D2FF] to-[#0062FF]" : "bg-[#0A1929]/50",
            )}
            style={{ width: "20%" }}
          ></div>
        </div>

        {/* 专辑封面 */}
        <div
          className={cn(
            "relative w-24 h-24 rounded-full overflow-hidden border-4 transition-all duration-500",
            isActive ? "border-[#00D2FF] shadow-[0_0_15px_rgba(0,210,255,0.3)]" : "border-[#0A1929]/50",
          )}
        >
          <Image
            src="/placeholder.svg?height=200&width=200"
            alt="专辑封面"
            fill
            className={cn(
              "object-cover transition-all duration-500",
              isActive && isPlaying ? "animate-rotate-slow" : "",
              !isActive && "opacity-50 grayscale",
            )}
          />
        </div>
      </div>

      {/* 播放控制 */}
      <div className="flex items-center justify-center gap-4 mt-2">
        <button
          className={cn(
            "w-8 h-8 rounded-full bg-[#0A1929]/50 border border-[#00D2FF]/20 flex items-center justify-center hover:border-[#00D2FF]/40 transition-all duration-300 hover:-translate-y-1",
            !isActive && "opacity-50",
          )}
        >
          <SkipBack className="h-4 w-4 text-[#00D2FF]" />
        </button>

        <button
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,210,255,0.4)] hover:-translate-y-1",
            isActive ? "bg-gradient-to-r from-[#00D2FF] to-[#0062FF] text-white" : "bg-[#0A1929]/50 text-gray-400",
          )}
          onClick={togglePlayPause}
          disabled={!isActive}
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
        </button>

        <button
          className={cn(
            "w-8 h-8 rounded-full bg-[#0A1929]/50 border border-[#00D2FF]/20 flex items-center justify-center hover:border-[#00D2FF]/40 transition-all duration-300 hover:-translate-y-1",
            !isActive && "opacity-50",
          )}
        >
          <SkipForward className="h-4 w-4 text-[#00D2FF]" />
        </button>
      </div>
    </div>
  )
}

