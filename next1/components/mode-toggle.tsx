"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Sun, Moon, Monitor } from "lucide-react"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // 避免水合不匹配
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button className="tech-icon-button h-10 w-10 card-border">
        <Sun className="h-5 w-5" />
      </button>
    )
  }

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark")
    } else if (theme === "dark") {
      setTheme("system")
    } else {
      setTheme("light")
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className="tech-icon-button h-10 w-10 shadow-milk-md hover:shadow-milk-lg transition-all duration-300 hover:-translate-y-2 hover:rotate-12 card-border"
    >
      {theme === "light" && <Sun className="h-5 w-5 text-milk-text-dark" />}
      {theme === "dark" && <Moon className="h-5 w-5 text-milk-text-dark" />}
      {theme === "system" && <Monitor className="h-5 w-5 text-milk-text-dark" />}
    </button>
  )
}

