"use client"

import { useState } from "react"
import Image from "next/image"
import { Clock, Box, Battery } from "lucide-react"
import { cn } from "@/lib/utils"

interface VacuumCardProps {
  isActive?: boolean
  onToggle?: () => void
}

export function VacuumCard({ isActive: initialActive = false, onToggle }: VacuumCardProps) {
  const [isActive, setIsActive] = useState(initialActive)

  const handleToggle = () => {
    const newState = !isActive
    setIsActive(newState)
    if (onToggle) onToggle()
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
          <h3 className="font-medium text-white">Bedroom</h3>
          <p className="text-xs text-blue-200/70">Robot vacuum cleaner</p>
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

      <div className="relative h-[140px] flex items-center justify-center">
        <div className="relative w-[140px] h-[140px]">
          <Image
            src="/placeholder.svg?height=200&width=200"
            alt="吸尘器"
            fill
            className={cn(
              "object-contain transition-all duration-500",
              isActive && "animate-float",
              !isActive && "opacity-50 grayscale",
            )}
          />
        </div>

        {/* 过滤器状态 */}
        <div className="absolute top-0 left-0 glass-effect rounded-lg px-2 py-1 text-xs">
          <div className="font-medium text-white">90%</div>
          <div className="text-blue-200/70 text-[10px]">Filter status</div>
        </div>

        {/* 下次清扫时间 */}
        <div className="absolute top-0 right-0 glass-effect rounded-lg px-2 py-1 text-xs">
          <div className="font-medium text-white">10:00 AM</div>
          <div className="text-blue-200/70 text-[10px]">Next cleaning</div>
        </div>
      </div>

      {/* 状态指标 */}
      <div className="grid grid-cols-3 gap-2 mt-2">
        <div className="bg-[#0A1929]/50 p-2 flex flex-col items-center rounded-xl border border-[#00D2FF]/20 hover:border-[#00D2FF]/40 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center gap-1 mb-1">
            <Box className="h-3.5 w-3.5 text-[#00D2FF]" />
            <span className="text-xs font-medium text-white">75 m²</span>
          </div>
          <span className="text-[10px] text-blue-200/70">Area cleaned</span>
        </div>

        <div className="bg-[#0A1929]/50 p-2 flex flex-col items-center rounded-xl border border-[#00D2FF]/20 hover:border-[#00D2FF]/40 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center gap-1 mb-1">
            <Clock className="h-3.5 w-3.5 text-[#00D2FF]" />
            <span className="text-xs font-medium text-white">30 min</span>
          </div>
          <span className="text-[10px] text-blue-200/70">Cleaning time</span>
        </div>

        <div className="bg-[#0A1929]/50 p-2 flex flex-col items-center rounded-xl border border-[#00D2FF]/20 hover:border-[#00D2FF]/40 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center gap-1 mb-1">
            <Battery className="h-3.5 w-3.5 text-[#00D2FF]" />
            <span className="text-xs font-medium text-white">80%</span>
          </div>
          <span className="text-[10px] text-blue-200/70">Battery charge</span>
        </div>
      </div>
    </div>
  )
}

