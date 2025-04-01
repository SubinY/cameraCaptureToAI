"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Pause, Square, Download, Camera, Mic, MicOff, Settings, Maximize, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

export function VideoRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([])
  const [recordingTime, setRecordingTime] = useState(0)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [recordingMode, setRecordingMode] = useState<"video" | "screen">("video")
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Format recording time as MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = time % 60
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  // Initialize camera stream
  const initializeStream = async (mode: "video" | "screen") => {
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }

      let newStream: MediaStream

      if (mode === "video") {
        newStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: audioEnabled,
        })
      } else {
        newStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: audioEnabled,
        })
      }

      setStream(newStream)

      if (videoRef.current) {
        videoRef.current.srcObject = newStream
      }
    } catch (error) {
      console.error("Error accessing media devices:", error)
    }
  }

  // Switch recording mode
  const switchMode = async (mode: "video" | "screen") => {
    if (isRecording) {
      stopRecording()
    }
    setRecordingMode(mode)
    await initializeStream(mode)
  }

  // Toggle audio
  const toggleAudio = async () => {
    const newAudioEnabled = !audioEnabled
    setAudioEnabled(newAudioEnabled)

    if (stream) {
      await initializeStream(recordingMode)
    }
  }

  // Start recording
  const startRecording = () => {
    if (!stream) return

    setRecordedChunks([])
    setDownloadUrl(null)

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: "video/webm;codecs=vp9,opus",
    })

    mediaRecorderRef.current = mediaRecorder

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        setRecordedChunks((prev) => [...prev, event.data])
      }
    }

    mediaRecorder.start(1000) // Collect data every second
    setIsRecording(true)
    setIsPaused(false)

    // Start timer
    setRecordingTime(0)
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1)
    }, 1000)
  }

  // Pause/resume recording
  const togglePause = () => {
    if (!mediaRecorderRef.current) return

    if (isPaused) {
      mediaRecorderRef.current.resume()
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } else {
      mediaRecorderRef.current.pause()
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }

    setIsPaused(!isPaused)
  }

  // Stop recording
  const stopRecording = () => {
    if (!mediaRecorderRef.current) return

    mediaRecorderRef.current.stop()
    setIsRecording(false)
    setIsPaused(false)

    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    // Create download URL
    if (recordedChunks.length > 0) {
      const blob = new Blob(recordedChunks, {
        type: "video/webm",
      })
      const url = URL.createObjectURL(blob)
      setDownloadUrl(url)

      // Set the recorded video as the source
      if (videoRef.current) {
        videoRef.current.srcObject = null
        videoRef.current.src = url
      }
    }
  }

  // Download recorded video
  const downloadVideo = () => {
    if (!downloadUrl) return

    const a = document.createElement("a")
    a.href = downloadUrl
    a.download = `recording-${new Date().toISOString()}.webm`
    a.click()
  }

  // Reset recording
  const resetRecording = async () => {
    if (isRecording) {
      stopRecording()
    }

    setRecordedChunks([])
    setDownloadUrl(null)
    setRecordingTime(0)

    await initializeStream(recordingMode)
  }

  // Initialize on component mount
  useEffect(() => {
    initializeStream("video")

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  return (
    <Card className="futuristic-border overflow-hidden">
      <CardContent className="p-0">
        <div className="relative">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-auto aspect-video bg-black" />

          {/* Recording indicator */}
          {isRecording && (
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 text-white px-3 py-1 rounded-full">
              <div className={cn("w-3 h-3 rounded-full bg-red-500", isPaused ? "" : "animate-pulse")} />
              <span className="text-sm font-medium">
                {isPaused ? "Paused" : "Recording"} • {formatTime(recordingTime)}
              </span>
            </div>
          )}

          {/* Controls overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {!isRecording ? (
                  <Button
                    onClick={startRecording}
                    variant="default"
                    size="sm"
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    <Play className="h-4 w-4 mr-1" /> Record
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={togglePause}
                      variant="outline"
                      size="sm"
                      className="bg-black/30 border-white/20 text-white hover:bg-black/50"
                    >
                      {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                    </Button>
                    <Button
                      onClick={stopRecording}
                      variant="outline"
                      size="sm"
                      className="bg-black/30 border-white/20 text-white hover:bg-black/50"
                    >
                      <Square className="h-4 w-4" />
                    </Button>
                  </>
                )}

                {downloadUrl && (
                  <Button
                    onClick={downloadVideo}
                    variant="outline"
                    size="sm"
                    className="bg-black/30 border-white/20 text-white hover:bg-black/50"
                  >
                    <Download className="h-4 w-4 mr-1" /> Save
                  </Button>
                )}

                <Button
                  onClick={resetRecording}
                  variant="outline"
                  size="sm"
                  className="bg-black/30 border-white/20 text-white hover:bg-black/50"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={toggleAudio}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "bg-black/30 border-white/20 text-white hover:bg-black/50",
                    !audioEnabled && "text-red-500",
                  )}
                >
                  {audioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </Button>

                <Tabs defaultValue="video" className="w-auto">
                  <TabsList className="bg-black/30 border border-white/20">
                    <TabsTrigger
                      value="video"
                      onClick={() => switchMode("video")}
                      className="data-[state=active]:bg-primary"
                    >
                      <Camera className="h-4 w-4 mr-1" /> Camera
                    </TabsTrigger>
                    <TabsTrigger
                      value="screen"
                      onClick={() => switchMode("screen")}
                      className="data-[state=active]:bg-primary"
                    >
                      <Maximize className="h-4 w-4 mr-1" /> Screen
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <Button
                  variant="outline"
                  size="sm"
                  className="bg-black/30 border-white/20 text-white hover:bg-black/50"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

