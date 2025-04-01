"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Smile, Clock, Users, Eye, Activity, AlertCircle } from "lucide-react"

// Mock data for demonstration
const mockEmotions = [
  { name: "Happy", value: 65, color: "bg-green-500" },
  { name: "Neutral", value: 25, color: "bg-blue-500" },
  { name: "Sad", value: 10, color: "bg-yellow-500" },
]

const mockEngagement = [
  { name: "High", value: 45, color: "bg-green-500" },
  { name: "Medium", value: 35, color: "bg-blue-500" },
  { name: "Low", value: 20, color: "bg-red-500" },
]

export function AnalyticsPanel() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeUsers, setActiveUsers] = useState(Math.floor(Math.random() * 100) + 50)
  const [viewDuration, setViewDuration] = useState(Math.floor(Math.random() * 300) + 60)

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Format time as HH:MM:SS
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Real-time Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Current Time</span>
              </div>
              <span className="font-medium">{formatTime(currentTime)}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Active Viewers</span>
              </div>
              <span className="font-medium">{activeUsers}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Avg. View Duration</span>
              </div>
              <span className="font-medium">
                {Math.floor(viewDuration / 60)}m {viewDuration % 60}s
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="emotions">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="emotions">
            <Smile className="h-4 w-4 mr-2" /> Emotions
          </TabsTrigger>
          <TabsTrigger value="engagement">
            <Activity className="h-4 w-4 mr-2" /> Engagement
          </TabsTrigger>
        </TabsList>

        <TabsContent value="emotions" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {mockEmotions.map((emotion) => (
                  <div key={emotion.name} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{emotion.name}</span>
                      <span className="text-sm font-medium">{emotion.value}%</span>
                    </div>
                    <Progress value={emotion.value} className={emotion.color} />
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Smile className="h-3 w-3 text-green-500" />
                  <span className="text-xs">Positive Trend</span>
                </Badge>

                <Badge variant="outline" className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 text-yellow-500" />
                  <span className="text-xs">Attention Needed</span>
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {mockEngagement.map((level) => (
                  <div key={level.name} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{level.name}</span>
                      <span className="text-sm font-medium">{level.value}%</span>
                    </div>
                    <Progress value={level.value} className={level.color} />
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Activity className="h-3 w-3 text-blue-500" />
                  <span className="text-xs">Engagement Score</span>
                </Badge>

                <span className="text-sm font-medium">76/100</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

