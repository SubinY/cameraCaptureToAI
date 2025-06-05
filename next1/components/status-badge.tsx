import { Thermometer, Droplets, Zap, Battery } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  label: string
  icon: "temperature" | "humidity" | "power" | "battery"
  className?: string
}

export function StatusBadge({ label, icon, className }: StatusBadgeProps) {
  const getIcon = () => {
    switch (icon) {
      case "temperature":
        return <Thermometer className="h-3.5 w-3.5" />
      case "humidity":
        return <Droplets className="h-3.5 w-3.5" />
      case "power":
        return <Zap className="h-3.5 w-3.5" />
      case "battery":
        return <Battery className="h-3.5 w-3.5" />
    }
  }

  return (
    <div
      className={cn(
        "tech-glass flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all duration-300 hover:shadow-tech-sm",
        className,
      )}
    >
      {getIcon()}
      <span>{label}</span>
    </div>
  )
}

