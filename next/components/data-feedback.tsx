"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart2, TrendingUp, Eye, Activity, AlertCircle, Zap } from "lucide-react"

// Mock data for demonstration
const mockData = {
  emotions: [
    { time: "00:00", happy: 65, neutral: 25, sad: 10 },
    { time: "00:05", happy: 70, neutral: 20, sad: 10 },
    { time: "00:10", happy: 60, neutral: 30, sad: 10 },
    { time: "00:15", happy: 55, neutral: 35, sad: 10 },
    { time: "00:20", happy: 50, neutral: 40, sad: 10 },
    { time: "00:25", happy: 60, neutral: 30, sad: 10 },
    { time: "00:30", happy: 70, neutral: 20, sad: 10 },
  ],
  engagement: [
    { time: "00:00", value: 65 },
    { time: "00:05", value: 70 },
    { time: "00:10", value: 60 },
    { time: "00:15", value: 55 },
    { time: "00:20", value: 50 },
    { time: "00:25", value: 60 },
    { time: "00:30", value: 70 },
  ],
  attention: [
    { time: "00:00", value: 85 },
    { time: "00:05", value: 80 },
    { time: "00:10", value: 75 },
    { time: "00:15", value: 70 },
    { time: "00:20", value: 65 },
    { time: "00:25", value: 75 },
    { time: "00:30", value: 85 },
  ],
}

export function DataFeedback() {
  const [currentData, setCurrentData] = useState(mockData)

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update with random fluctuations
      setCurrentData((prev) => {
        const lastEmotionEntry = { ...prev.emotions[prev.emotions.length - 1] }
        const lastEngagementEntry = { ...prev.engagement[prev.engagement.length - 1] }
        const lastAttentionEntry = { ...prev.attention[prev.attention.length - 1] }

        // Update time
        const time = new Date()
        const timeString = `${time.getMinutes().toString().padStart(2, "0")}:${time.getSeconds().toString().padStart(2, "0")}`

        // Random fluctuations
        const happyChange = Math.floor(Math.random() * 10) - 5
        const neutralChange = Math.floor(Math.random() * 10) - 5
        const sadChange = Math.floor(Math.random() * 6) - 3

        const engagementChange = Math.floor(Math.random() * 10) - 5
        const attentionChange = Math.floor(Math.random() * 10) - 5

        // Ensure values stay within bounds
        const newHappy = Math.max(0, Math.min(100, lastEmotionEntry.happy + happyChange))
        const newNeutral = Math.max(0, Math.min(100, lastEmotionEntry.neutral + neutralChange))
        const newSad = Math.max(0, Math.min(100, lastEmotionEntry.sad + sadChange))

        const newEngagement = Math.max(0, Math.min(100, lastEngagementEntry.value + engagementChange))
        const newAttention = Math.max(0, Math.min(100, lastAttentionEntry.value + attentionChange))

        // Create new entries
        const newEmotionEntry = {
          time: timeString,
          happy: newHappy,
          neutral: newNeutral,
          sad: newSad,
        }

        const newEngagementEntry = {
          time: timeString,
          value: newEngagement,
        }

        const newAttentionEntry = {
          time: timeString,
          value: newAttention,
        }

        // Keep only the last 7 entries
        const emotions = [...prev.emotions.slice(-6), newEmotionEntry]
        const engagement = [...prev.engagement.slice(-6), newEngagementEntry]
        const attention = [...prev.attention.slice(-6), newAttentionEntry]

        return {
          emotions,
          engagement,
          attention,
        }
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="data-grid">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center">
            <BarChart2 className="h-5 w-5 mr-2 text-primary" />
            Emotion Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full relative">
            {/* Simplified chart visualization */}
            <div className="absolute inset-0 flex items-end justify-between p-2">
              {currentData.emotions.map((entry, index) => (
                <div key={index} className="flex flex-col items-center w-8">
                  <div className="w-full bg-green-500 rounded-t" style={{ height: `${entry.happy * 1.5}px` }}></div>
                  <div
                    className="w-full bg-blue-500 rounded-t mt-0.5"
                    style={{ height: `${entry.neutral * 1.5}px` }}
                  ></div>
                  <div
                    className="w-full bg-yellow-500 rounded-t mt-0.5"
                    style={{ height: `${entry.sad * 1.5}px` }}
                  ></div>
                  <span className="text-xs mt-1 text-muted-foreground">{entry.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
              <span>Happy</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
              <span>Neutral</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
              <span>Sad</span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center text-sm">
              <Zap className="h-4 w-4 mr-2 text-primary" />
              <span>
                <strong>Insight:</strong> Positive emotions trending upward in the last 5 minutes.
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center">
            <Activity className="h-5 w-5 mr-2 text-primary" />
            Engagement Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full relative">
            {/* Simplified chart visualization */}
            <div className="absolute inset-0 flex items-end justify-between p-2">
              {currentData.engagement.map((entry, index) => (
                <div key={index} className="flex flex-col items-center w-8">
                  <div className="w-full bg-primary rounded-t" style={{ height: `${entry.value * 1.5}px` }}></div>
                  <span className="text-xs mt-1 text-muted-foreground">{entry.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center text-sm">
              <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
              <span>Engagement Score</span>
            </div>
            <span className="font-medium">{currentData.engagement[currentData.engagement.length - 1].value}%</span>
          </div>

          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center text-sm">
              <Zap className="h-4 w-4 mr-2 text-primary" />
              <span>
                <strong>Insight:</strong> Engagement peaks during interactive segments.
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center">
            <Eye className="h-5 w-5 mr-2 text-primary" />
            Attention Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full relative">
            {/* Simplified chart visualization */}
            <div className="absolute inset-0 flex items-end justify-between p-2">
              {currentData.attention.map((entry, index) => (
                <div key={index} className="flex flex-col items-center w-8">
                  <div
                    className={`w-full rounded-t ${entry.value > 70 ? "bg-green-500" : entry.value > 50 ? "bg-yellow-500" : "bg-red-500"}`}
                    style={{ height: `${entry.value * 1.5}px` }}
                  ></div>
                  <span className="text-xs mt-1 text-muted-foreground">{entry.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center text-sm">
              <AlertCircle className="h-4 w-4 mr-1 text-yellow-500" />
              <span>Attention Level</span>
            </div>
            <span className="font-medium">{currentData.attention[currentData.attention.length - 1].value}%</span>
          </div>

          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center text-sm">
              <Zap className="h-4 w-4 mr-2 text-primary" />
              <span>
                <strong>Insight:</strong> Attention drops after 15 minutes of continuous content.
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

