"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VacuumCard } from "@/components/devices/vacuum-card"
import { LightCard } from "@/components/devices/light-card"
import { MusicCard } from "@/components/devices/music-card"

interface DeviceSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeviceSheet({ open, onOpenChange }: DeviceSheetProps) {
  const [activeTab, setActiveTab] = useState("vacuum")

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl p-0 bg-tech-cream dark:bg-tech-dark-mocha">
        <SheetHeader className="px-6 pt-6 pb-2">
          <SheetTitle>设备控制</SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="vacuum" value={activeTab} onValueChange={setActiveTab} className="px-6">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="vacuum">吸尘器</TabsTrigger>
            <TabsTrigger value="light">灯光</TabsTrigger>
            <TabsTrigger value="music">音乐</TabsTrigger>
          </TabsList>

          <TabsContent value="vacuum" className="mt-0">
            <VacuumCard isActive={true} />
          </TabsContent>

          <TabsContent value="light" className="mt-0">
            <LightCard isActive={true} />
          </TabsContent>

          <TabsContent value="music" className="mt-0">
            <MusicCard isActive={true} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}

