import type React from "react"
import { Thermometer, Droplets, Zap, Battery } from "lucide-react"

export function StatusIndicators() {
  return (
    <div className="flex items-center space-x-2">
      <StatusPill icon={<Thermometer className="h-3.5 w-3.5" />} label="24°C" />
      <StatusPill icon={<Droplets className="h-3.5 w-3.5" />} label="50%" />
      <StatusPill icon={<Zap className="h-3.5 w-3.5" />} label="350W" />
      <StatusPill icon={<Battery className="h-3.5 w-3.5" />} label="80%" />
    </div>
  )
}

interface StatusPillProps {
  icon: React.ReactNode
  label: string
}

function StatusPill({ icon, label }: StatusPillProps) {
  return (
    <div className="glass-effect flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-white hover:shadow-milk-glow transition-all duration-300 hover:-translate-y-1 hover:bg-white/30 card-border">
      {icon}
      <span>{label}</span>
    </div>
  )
}

