"use client"

import { useState } from "react"
import { Menu, Bell, Search, X } from "lucide-react"
import { RoomsList } from "./rooms-list"
import { cn } from "@/lib/utils"

export function MobileHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <>
      <header className="bg-milk-white h-16 px-4 flex items-center justify-between shadow-milk-md">
        <div className="flex items-center">
          <button className="tech-icon-button h-10 w-10 mr-3" onClick={() => setMenuOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-milk-text-dark">智能家居</h1>
            <p className="text-xs text-milk-text-light">客厅</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="tech-icon-button h-10 w-10" onClick={() => setSearchOpen(!searchOpen)}>
            <Search className="h-5 w-5" />
          </button>

          <button className="tech-icon-button h-10 w-10 relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-milk-dark rounded-full"></span>
          </button>
        </div>
      </header>

      {/* 搜索栏 */}
      <div
        className={cn(
          "fixed left-0 right-0 bg-milk-white px-4 py-3 shadow-milk-md transition-all duration-300 z-50",
          searchOpen ? "top-16" : "-top-20",
        )}
      >
        <div className="relative">
          <input
            type="text"
            placeholder="搜索设备、房间..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-milk-light border-none focus:ring-2 focus:ring-milk-dark"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-milk-text-light" />
        </div>
      </div>

      {/* 侧边菜单 */}
      <div
        className={cn(
          "fixed inset-0 bg-black/10 z-50 transition-opacity duration-300",
          menuOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      >
        <div
          className={cn(
            "absolute top-0 left-0 bottom-0 w-4/5 max-w-xs bg-milk-white shadow-milk-xl transition-transform duration-300 transform",
            menuOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between p-4 border-b border-milk-light">
            <div className="flex items-center space-x-2">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 bg-milk-gradient rounded-lg animate-pulse-subtle"></div>
                <div className="absolute inset-0 flex items-center justify-center text-milk-text-dark font-bold">
                  智
                </div>
              </div>
              <span className="text-xl font-bold bg-clip-text text-milk-text-dark">智能家居</span>
            </div>
            <button className="tech-icon-button h-9 w-9" onClick={() => setMenuOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-4 h-full overflow-auto">
            <h3 className="font-medium text-lg text-milk-text-dark mb-4">房间</h3>
            <RoomsList compact />
          </div>
        </div>
      </div>
    </>
  )
}

