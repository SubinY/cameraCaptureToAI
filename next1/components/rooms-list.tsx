"use client"

import { useState } from "react"
import { Bed, Coffee, Sofa, ShowerHead, Plus, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface RoomsListProps {
  compact?: boolean
}

export function RoomsList({ compact = false }: RoomsListProps) {
  const [activeRoom, setActiveRoom] = useState("living")

  const rooms = [
    { id: "bedroom", name: "Bedroom", icon: Bed, devices: 3 },
    { id: "kitchen", name: "Kitchen", icon: Coffee, devices: 2 },
    { id: "living", name: "Living room", icon: Sofa, devices: 5 },
    { id: "bathroom", name: "Bathroom", icon: ShowerHead, devices: 1 },
  ]

  if (compact) {
    return (
      <div className="space-y-2">
        {rooms.map((room) => {
          const Icon = room.icon
          return (
            <button
              key={room.id}
              onClick={() => setActiveRoom(room.id)}
              className={cn(
                "w-full flex items-center p-3 rounded-xl transition-all duration-300 card-hover-effect card-border",
                activeRoom === room.id
                  ? "bg-milk-white shadow-milk-md"
                  : "hover:bg-milk-white/80 hover:shadow-milk-sm hover:-translate-y-1",
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center mr-3 transition-all duration-300 card-border",
                  activeRoom === room.id ? "bg-milk-dark text-white" : "bg-milk-cream text-milk-text",
                )}
              >
                <Icon className="h-5 w-5" />
              </div>

              <div className="flex flex-col items-start text-left">
                <span
                  className={cn(
                    "font-medium transition-all duration-300",
                    activeRoom === room.id && "text-milk-text-dark",
                  )}
                >
                  {room.name}
                </span>
                <span className="text-xs text-milk-text-light">
                  {room.devices} device{room.devices !== 1 ? "s" : ""}
                </span>
              </div>

              <ChevronRight
                className={cn(
                  "h-4 w-4 ml-auto transition-all duration-300",
                  activeRoom === room.id ? "text-milk-text-dark" : "text-milk-text-light",
                )}
              />
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="h-full rounded-3xl bg-milk-cream p-4 flex flex-col tech-card card-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-lg text-milk-text-dark">Rooms</h3>
        <button className="w-6 h-6 rounded-full bg-milk-white flex items-center justify-center hover:shadow-milk-sm transition-all duration-300 hover:-translate-y-0.5 card-border">
          <span className="text-xs text-milk-text">?</span>
        </button>
      </div>

      <div className="space-y-2 flex-1">
        {rooms.map((room) => {
          const Icon = room.icon
          return (
            <button
              key={room.id}
              onClick={() => setActiveRoom(room.id)}
              className={cn(
                "w-full flex items-center p-3 rounded-xl transition-all duration-300 card-hover-effect card-border",
                activeRoom === room.id
                  ? "bg-milk-white shadow-milk-md"
                  : "hover:bg-milk-white/80 hover:shadow-milk-sm hover:-translate-y-1",
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center mr-3 transition-all duration-300 card-border",
                  activeRoom === room.id ? "bg-milk-dark text-white" : "bg-milk-cream text-milk-text",
                )}
              >
                <Icon className="h-5 w-5" />
              </div>

              <div className="flex flex-col items-start text-left">
                <span
                  className={cn(
                    "font-medium transition-all duration-300",
                    activeRoom === room.id && "text-milk-text-dark",
                  )}
                >
                  {room.name}
                </span>
                <span className="text-xs text-milk-text-light">
                  {room.devices} device{room.devices !== 1 ? "s" : ""}
                </span>
              </div>

              <ChevronRight
                className={cn(
                  "h-4 w-4 ml-auto transition-all duration-300",
                  activeRoom === room.id ? "text-milk-text-dark" : "text-milk-text-light",
                )}
              />
            </button>
          )
        })}
      </div>

      <div className="section-divider"></div>

      <button className="mt-2 w-full flex items-center justify-center p-3 rounded-xl bg-milk-cream hover:bg-milk-light transition-all duration-300 hover:shadow-milk-md hover:-translate-y-1 card-border">
        <div className="flex items-center gap-2 text-milk-text-dark">
          <Plus className="h-5 w-5" />
          <span className="font-medium">Add Room</span>
        </div>
      </button>
    </div>
  )
}

