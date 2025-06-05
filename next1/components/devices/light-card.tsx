"use client"

import type React from "react"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface LightCardProps {
  isActive?: boolean
  onToggle?: () => void
}

export function LightCard({ isActive: initialActive = false, onToggle }: LightCardProps) {
  const [isActive, setIsActive] = useState(initialActive)
  const [brightness, setBrightness] = useState(70)

  const handleToggle = () => {
    const newState = !isActive
    setIsActive(newState)
    if (onToggle) onToggle()
  }

  const handleBrightnessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBrightness(Number.parseInt(e.target.value))
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
        <div className="flex items-center gap-2">
          <button className="w-6 h-6 rounded-full bg-[#0A1929]/50 border border-[#00D2FF]/20 flex items-center justify-center hover:border-[#00D2FF]/40 transition-all duration-300">
            <ChevronLeft className="h-4 w-4 text-[#00D2FF]" />
          </button>
          <h3 className="font-medium text-white">Living room</h3>
          <button className="w-6 h-6 rounded-full bg-[#0A1929]/50 border border-[#00D2FF]/20 flex items-center justify-center hover:border-[#00D2FF]/40 transition-all duration-300">
            <ChevronRight className="h-4 w-4 text-[#00D2FF]" />
          </button>
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

      <div className="flex items-center justify-center h-[140px]">
        <div
          className={cn(
            "w-32 h-32 rounded-full transition-all duration-500 flex items-center justify-center",
            isActive ? "bg-gradient-to-r from-[#00D2FF] to-[#0062FF] glow-effect" : "bg-[#0A1929]/50",
            isActive && "animate-pulse-subtle",
          )}
        >
          <div className="text-xs text-white">Smart Lamp</div>
        </div>
      </div>

      {/* 亮度控制 */}
      <div className="mt-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-blue-200/70">Brightness</span>
          <span className="text-xs font-medium text-white">{brightness}%</span>
        </div>

        <div className="tech-slider relative h-1.5 rounded-full">
          <div
            className={cn(
              "tech-slider-track transition-all duration-300",
              isActive ? "bg-gradient-to-r from-[#00D2FF] to-[#0062FF]" : "bg-[#0A1929]/50",
            )}
            style={{ width: `${brightness}%` }}
          ></div>
          <input
            type="range"
            min="0"
            max="100"
            value={brightness}
            onChange={handleBrightnessChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={!isActive}
          />
          {isActive && <div className="tech-slider-thumb" style={{ left: `${brightness}%` }}></div>}
        </div>
      </div>
    </div>
  )
}

