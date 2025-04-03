import { VacuumCard } from "@/components/devices/vacuum-card"
import { LightCard } from "@/components/devices/light-card"
import { MusicCard } from "@/components/devices/music-card"
import { WaveSphereCard } from "@/components/devices/wave-sphere-card"

export function DeviceControls() {
  return (
    <>
      <VacuumCard isActive={true} />
      <LightCard isActive={true} />
      <WaveSphereCard isActive={true} />
      {/* <MusicCard isActive={true} /> */}
    </>
  )
}

