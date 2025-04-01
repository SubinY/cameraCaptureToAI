"use client"

import { useState } from "react"
import { Home, Settings, Zap, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { DeviceSheet } from "./device-sheet"

export function MobileNav() {
  const [activeTab, setActiveTab] = useState("home")
  const [deviceSheetOpen, setDeviceSheetOpen] = useState(false)

  const tabs = [
    { id: "home", label: "首页", icon: Home },
    { id: "devices", label: "设备", icon: Zap },
    { id: "settings", label: "设置", icon: Settings },
  ]

  return (
    <>
      <nav className="bg-milk-white h-16 px-4 flex items-center justify-between shadow-milk-lg border-t border-milk-light">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-full transition-all duration-300",
                activeTab === tab.id ? "text-milk-text-dark" : "text-milk-text-light",
              )}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className={cn("h-5 w-5 mb-1", activeTab === tab.id && "animate-pulse-subtle")} />
              <span className="text-xs">{tab.label}</span>
            </button>
          )
        })}

        <button
          className="flex flex-col items-center justify-center w-16 h-full"
          onClick={() => setDeviceSheetOpen(true)}
        >
          <div className="w-10 h-10 rounded-full bg-milk-gradient flex items-center justify-center text-milk-text-dark shadow-milk-md card-border">
            <Plus className="h-5 w-5" />
          </div>
        </button>
      </nav>

      <DeviceSheet open={deviceSheetOpen} onOpenChange={setDeviceSheetOpen} />
    </>
  )
}

