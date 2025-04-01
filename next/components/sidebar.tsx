"use client"

import { useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Home, Settings, BarChart2, Bell, User } from "lucide-react"

export function Sidebar() {
  const [activeItem, setActiveItem] = useState("home")

  const menuItems = [
    { id: "home", label: "首页", icon: Home },
    { id: "analytics", label: "分析", icon: BarChart2 },
    { id: "notifications", label: "通知", icon: Bell },
    { id: "settings", label: "设置", icon: Settings },
  ]

  return (
    <div className="h-full flex flex-col py-6">
      {/* Logo */}
      <div className="px-6 mb-8">
        <div className="flex items-center space-x-2">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 bg-tech-gradient rounded-lg animate-pulse-subtle"></div>
            <div className="absolute inset-0 flex items-center justify-center text-white font-bold">智</div>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-tech-gradient">智能家居</span>
        </div>
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 px-3">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.id}
                href="#"
                onClick={() => setActiveItem(item.id)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-300 relative overflow-hidden group",
                  activeItem === item.id
                    ? "text-tech-blue dark:text-tech-cyan font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-tech-light-gray dark:hover:bg-tech-dark/50",
                )}
              >
                {activeItem === item.id && (
                  <div className="absolute inset-0 bg-tech-light-blue dark:bg-tech-blue/10 rounded-xl -z-10"></div>
                )}
                <Icon
                  className={cn(
                    "h-5 w-5 transition-all duration-300",
                    activeItem === item.id
                      ? "text-tech-blue dark:text-tech-cyan"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                />
                <span>{item.label}</span>
                {activeItem === item.id && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-tech-gradient rounded-r-full"></div>
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* 用户资料 */}
      <div className="mt-auto px-3">
        <div className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-tech-light-gray dark:hover:bg-tech-dark/50 transition-all duration-300 cursor-pointer">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-tech-gradient flex items-center justify-center text-white">
              <User className="h-4 w-4" />
            </div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-background dark:border-tech-dark-blue"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">用户名</span>
            <span className="text-xs text-muted-foreground">在线</span>
          </div>
        </div>
      </div>
    </div>
  )
}

