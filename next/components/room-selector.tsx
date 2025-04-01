"use client"

import { Bed, Coffee, Sofa, ShowerHeadIcon as Shower } from "lucide-react"
import { cn } from "@/lib/utils"

interface Room {
  id: string
  name: string
  devices: number
}

interface RoomSelectorProps {
  rooms: Room[]
  activeRoom: string
  onSelectRoom: (roomId: string) => void
}

export function RoomSelector({ rooms, activeRoom, onSelectRoom }: RoomSelectorProps) {
  const getRoomIcon = (roomId: string) => {
    switch (roomId) {
      case "living":
        return <Sofa className="h-5 w-5" />
      case "bedroom":
        return <Bed className="h-5 w-5" />
      case "kitchen":
        return <Coffee className="h-5 w-5" />
      case "bathroom":
        return <Shower className="h-5 w-5" />
      default:
        return <Sofa className="h-5 w-5" />
    }
  }

  return (
    <div className="space-y-3">
      {rooms.map((room) => (
        <button
          key={room.id}
          onClick={() => onSelectRoom(room.id)}
          className={cn(
            "w-full flex items-center p-3 rounded-xl transition-all duration-300 relative overflow-hidden",
            activeRoom === room.id ? "tech-card-active" : "tech-card hover:translate-y-[-2px]",
          )}
        >
          {/* 背景效果 */}
          {activeRoom === room.id && (
            <div className="absolute inset-0 bg-tech-light-blue/20 dark:bg-tech-blue/10 -z-10"></div>
          )}

          {/* 图标 */}
          <div
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-lg mr-3 transition-all duration-300",
              activeRoom === room.id
                ? "bg-tech-blue text-white"
                : "bg-tech-light-gray dark:bg-tech-dark text-tech-blue dark:text-tech-cyan",
            )}
          >
            {getRoomIcon(room.id)}
          </div>

          {/* 文本 */}
          <div className="flex flex-col items-start">
            <span
              className={cn(
                "font-medium transition-all duration-300",
                activeRoom === room.id ? "text-tech-blue dark:text-tech-cyan" : "",
              )}
            >
              {room.name}
            </span>
            <span className="text-xs text-muted-foreground">{room.devices} 个设备</span>
          </div>

          {/* 活动指示器 */}
          {activeRoom === room.id && <div className="ml-auto w-2 h-8 bg-tech-gradient rounded-full"></div>}
        </button>
      ))}
    </div>
  )
}

