"use client"

import { useState } from "react"
import { Home, Settings, Zap, Plus, History } from "lucide-react"
import { cn } from "@/lib/utils"
import { DeviceSheet } from "./device-sheet"
import { HistoryCard } from "./analysis-cards"

export function MobileNav() {
  const [activeTab, setActiveTab] = useState("home")
  const [deviceSheetOpen, setDeviceSheetOpen] = useState(false)
  const [historySheetOpen, setHistorySheetOpen] = useState(false)

  const tabs = [
    { id: "home", label: "首页", icon: Home },
    { id: "devices", label: "设备", icon: Zap },
    { id: "history", label: "历史", icon: History },
    { id: "settings", label: "设置", icon: Settings },
  ]

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId)
    
    if (tabId === "devices") {
      setDeviceSheetOpen(true)
    } else if (tabId === "history") {
      setHistorySheetOpen(true)
    }
  }

  return (
    <>
      <nav className="bg-milk-white h-16 px-2 sm:px-4 flex items-center justify-between shadow-milk-lg border-t border-milk-light">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              className={cn(
                "flex flex-col items-center justify-center w-14 sm:w-16 h-full transition-all duration-300",
                activeTab === tab.id ? "text-milk-text-dark" : "text-milk-text-light",
              )}
              onClick={() => handleTabClick(tab.id)}
            >
              <Icon className={cn("h-5 w-5 mb-1", activeTab === tab.id && "animate-pulse-subtle")} />
              <span className="text-[10px] sm:text-xs">{tab.label}</span>
            </button>
          )
        })}

        <button
          className="flex flex-col items-center justify-center w-14 sm:w-16 h-full"
          onClick={() => setDeviceSheetOpen(true)}
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-milk-gradient flex items-center justify-center text-milk-text-dark shadow-milk-md card-border">
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </button>
      </nav>

      <DeviceSheet open={deviceSheetOpen} onOpenChange={setDeviceSheetOpen} />
      
      {/* 历史记录抽屉 */}
      <div className={cn(
        "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300",
        historySheetOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <div className={cn(
          "absolute bottom-0 left-0 right-0 bg-milk-white rounded-t-2xl transition-transform duration-300 transform",
          historySheetOpen ? "translate-y-0" : "translate-y-full"
        )}>
          <div className="h-[80vh] p-4">
            <HistoryCard className="h-full" />
          </div>
        </div>
      </div>
    </>
  )
}

