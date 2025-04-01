"use client"

import { useState } from "react"
import { Menu, Bell, Search, X } from "lucide-react"
import { MobileNav } from "@/components/mobile-nav"
import { StatusBadge } from "@/components/status-badge"

export function Header() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 dark:bg-tech-dark-blue/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4">
        {/* 移动端菜单按钮 */}
        <button className="lg:hidden tech-icon-button h-9 w-9" onClick={() => setMobileNavOpen(true)}>
          <Menu className="h-5 w-5" />
        </button>

        {/* 搜索栏 */}
        <div
          className={`relative max-w-md w-full mx-4 transition-all duration-300 ${searchFocused ? "scale-105" : ""}`}
        >
          <div
            className={`flex items-center h-9 rounded-full border ${
              searchFocused
                ? "border-tech-blue dark:border-tech-cyan shadow-[0_0_0_1px_rgba(0,98,255,0.3)] dark:shadow-[0_0_0_1px_rgba(0,210,255,0.3)]"
                : "border-input"
            } bg-background dark:bg-tech-dark-blue/50 px-3 transition-all duration-300`}
          >
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索..."
              className="flex-1 bg-transparent border-0 outline-none px-2 text-sm placeholder:text-muted-foreground"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>
        </div>

        {/* 状态指示器 */}
        <div className="flex items-center space-x-3">
          <StatusBadge label="24°C" icon="temperature" />
          <StatusBadge label="50%" icon="humidity" />
          <StatusBadge label="350W" icon="power" />
          <StatusBadge label="80%" icon="battery" />

          {/* 通知按钮 */}
          <button className="tech-icon-button h-9 w-9 relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>

      {/* 移动导航 */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed inset-y-0 left-0 w-3/4 max-w-xs bg-background dark:bg-tech-dark-blue shadow-xl animate-in slide-in-from-left">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-2">
                <div className="relative w-8 h-8">
                  <div className="absolute inset-0 bg-tech-gradient rounded-lg animate-pulse-subtle"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-white font-bold">智</div>
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-tech-gradient">智能家居</span>
              </div>
              <button className="tech-icon-button h-9 w-9" onClick={() => setMobileNavOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <MobileNav onClose={() => setMobileNavOpen(false)} />
          </div>
        </div>
      )}
    </header>
  )
}

