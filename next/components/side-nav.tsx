"use client"

import { useState } from "react"
import { Home, MapPin, Music, Thermometer, Shield, User } from "lucide-react"
import { cn } from "@/lib/utils"

export function SideNav() {
  const [activeItem, setActiveItem] = useState("home")

  const navItems = [
    { id: "home", icon: Home },
    { id: "location", icon: MapPin },
    { id: "music", icon: Music },
    { id: "climate", icon: Thermometer },
    { id: "security", icon: Shield },
  ]

  return (
    <div className="w-16 h-full bg-milk-cream flex flex-col items-center py-6">
      {/* Logo */}
      <div className="mb-10">
        <div className="w-10 h-10 rounded-xl bg-milk-gradient flex items-center justify-center text-milk-text-dark font-bold text-xl animate-pulse-subtle">
          智
        </div>
      </div>

      {/* 导航项 */}
      <div className="flex flex-col items-center space-y-6 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => setActiveItem(item.id)}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 card-border",
                activeItem === item.id
                  ? "bg-milk-dark text-white shadow-milk-md"
                  : "text-milk-text hover:text-milk-text-dark hover:bg-milk-white hover:shadow-milk-sm hover:-translate-y-1",
              )}
            >
              <Icon
                className={cn("h-5 w-5 transition-all duration-300", activeItem === item.id && "animate-pulse-subtle")}
              />
            </button>
          )
        })}
      </div>

      {/* 用户头像 */}
      <div className="mt-auto">
        <button className="w-10 h-10 rounded-full bg-milk-cream flex items-center justify-center overflow-hidden hover:shadow-milk-md transition-all duration-300 hover:-translate-y-1 card-border">
          <User className="h-5 w-5 text-milk-text-dark" />
        </button>
      </div>
    </div>
  )
}

