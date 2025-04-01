"use client"

import { useState } from "react"
import { VacuumCard } from "@/components/devices/vacuum-card"
import { LightCard } from "@/components/devices/light-card"
import { MusicCard } from "@/components/devices/music-card"

export function DeviceGrid() {
  const [activeDevices, setActiveDevices] = useState({
    vacuum: true,
    light: true,
    music: true,
  })

  const toggleDevice = (device: keyof typeof activeDevices) => {
    setActiveDevices((prev) => ({
      ...prev,
      [device]: !prev[device],
    }))
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">设备控制</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <VacuumCard isActive={activeDevices.vacuum} onToggle={() => toggleDevice("vacuum")} />
        <LightCard isActive={activeDevices.light} onToggle={() => toggleDevice("light")} />
        <MusicCard isActive={activeDevices.music} onToggle={() => toggleDevice("music")} />
      </div>
    </section>
  )
}

