"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Download,
  MessageCircle,
  AlertTriangle,
  MousePointer,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useDebug } from "@/lib/debug-context";

interface InteractionEvent {
  id: string;
  timestamp: string;
  event_type: "voice" | "alert" | "action";
  content: string;
  severity: 1 | 2 | 3;
}

interface HistoryCardProps {
  className?: string;
}

const HistoryCard = ({ className }: HistoryCardProps) => {
  const [events, setEvents] = useState<InteractionEvent[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { useMockData } = useDebug();
  const prevMockDataRef = useRef(useMockData);

  // Simulate event generation
  useEffect(() => {
    // Clear events when switching from mock to real mode
    if (prevMockDataRef.current !== useMockData) {
      setEvents([]);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
    prevMockDataRef.current = useMockData;

    // Only generate mock events if in mock mode
    if (!useMockData) {
      return;
    }

    // Initial load
    const initialEvents: InteractionEvent[] = [
      {
        id: `event-${Date.now()}-1`,
        timestamp: new Date(Date.now() - 8000).toISOString(),
        event_type: "voice",
        content: "Hello, how can I help you today?",
        severity: 1,
      },
      {
        id: `event-${Date.now()}-2`,
        timestamp: new Date(Date.now() - 5000).toISOString(),
        event_type: "action",
        content: "Camera activated",
        severity: 1,
      },
      {
        id: `event-${Date.now()}-3`,
        timestamp: new Date(Date.now() - 2000).toISOString(),
        event_type: "alert",
        content: "Low confidence in emotion detection",
        severity: 2,
      },
    ];

    setEvents(initialEvents);

    // Simulate periodic events
    const eventTypes = ["voice", "alert", "action"] as const;
    const voiceContents = [
      "Adjusting lighting for better visibility",
      "I notice you've been working for a while",
      "Would you like me to summarize your activity?",
      "Your posture appears to be improving",
      "Remember to take a short break soon",
    ];
    const alertContents = [
      "Prolonged screen time detected",
      "Poor lighting conditions",
      "High stress indicators detected",
      "Camera view partially obstructed",
      "Network connectivity issues",
    ];
    const actionContents = [
      "User adjusted camera angle",
      "Saved analysis report",
      "Changed monitoring preferences",
      "Paused monitoring temporarily",
      "Enabled voice notifications",
    ];

    const generateRandomEvent = (): InteractionEvent => {
      const eventType =
        eventTypes[Math.floor(Math.random() * eventTypes.length)];
      let content = "";
      let severity: 1 | 2 | 3 = 1;

      if (eventType === "voice") {
        content =
          voiceContents[Math.floor(Math.random() * voiceContents.length)];
        severity = 1;
      } else if (eventType === "alert") {
        content =
          alertContents[Math.floor(Math.random() * alertContents.length)];
        severity = Math.random() > 0.7 ? 3 : 2;
      } else {
        content =
          actionContents[Math.floor(Math.random() * actionContents.length)];
        severity = 1;
      }

      return {
        id: `event-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        timestamp: new Date().toISOString(),
        event_type: eventType,
        content,
        severity,
      };
    };

    // Add new event every 5-15 seconds
    const scheduleNextEvent = () => {
      const randomDelay = 5000 + Math.random() * 10000;
      timeoutRef.current = setTimeout(() => {
        const newEvent = generateRandomEvent();
        setEvents((prev) => {
          // 始终将新事件放在第一位，同时保持类型分类但保留时间顺序
          const allEvents = [newEvent, ...prev];

          // 分类但不需要分别截取，只保留最近的25条总记录
          let filteredEvents: InteractionEvent[] = [];

          // 优先保留严重警报
          const severeAlerts = allEvents.filter(
            (e) => e.event_type === "alert" && e.severity === 3
          );
          filteredEvents = [...filteredEvents, ...severeAlerts];

          // 剩余空间用于其他普通事件，但保持时间顺序
          const remainingEvents = allEvents
            .filter((e) => !(e.event_type === "alert" && e.severity === 3))
            .slice(0, 25 - severeAlerts.length);

          filteredEvents = [...filteredEvents, ...remainingEvents];

          // 按时间顺序排序，最新的在最前面
          return filteredEvents.sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
        });

        scheduleNextEvent();
      }, 2000);
    };

    scheduleNextEvent();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [useMockData]);

  // Format relative time
  const formatRelativeTime = (timestamp: string) => {
    const now = new Date().getTime();
    const eventTime = new Date(timestamp).getTime();
    const diffSeconds = Math.floor((now - eventTime) / 1000);

    if (diffSeconds < 60) {
      return `${diffSeconds}s ago`;
    } else if (diffSeconds < 3600) {
      return `${Math.floor(diffSeconds / 60)}m ago`;
    } else if (diffSeconds < 86400) {
      return `${Math.floor(diffSeconds / 3600)}h ago`;
    } else {
      return `${Math.floor(diffSeconds / 86400)}d ago`;
    }
  };

  // Get icon based on event type
  const getEventIcon = (eventType: InteractionEvent["event_type"]) => {
    switch (eventType) {
      case "voice":
        return <MessageCircle className="h-4 w-4" />;
      case "alert":
        return <AlertTriangle className="h-4 w-4" />;
      case "action":
        return <MousePointer className="h-4 w-4" />;
    }
  };

  // Get event color based on type and severity
  const getEventColor = (event: InteractionEvent) => {
    if (event.event_type === "alert") {
      return event.severity === 3 ? "text-red-500" : "text-amber-500";
    } else if (event.event_type === "voice") {
      return "text-blue-500";
    } else {
      return "text-green-500";
    }
  };

  // Generate a daily report in Markdown format
  const generateDailyReport = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString();

    const alertCount = events.filter((e) => e.event_type === "alert").length;
    const severeAlertCount = events.filter(
      (e) => e.event_type === "alert" && e.severity === 3
    ).length;
    const voiceInteractions = events.filter(
      (e) => e.event_type === "voice"
    ).length;
    const userActions = events.filter((e) => e.event_type === "action").length;

    const markdown = `# Daily Activity Report - ${dateStr}

## Summary
- **Total Events**: ${events.length}
- **Voice Interactions**: ${voiceInteractions}
- **User Actions**: ${userActions}
- **Alerts**: ${alertCount} (${severeAlertCount} severe)

## Timeline
${events
  .slice()
  .sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )
  .map((event) => {
    const time = new Date(event.timestamp).toLocaleTimeString();
    const stars = "⭐".repeat(event.severity);
    return `- **${time}** [${event.event_type.toUpperCase()}] ${stars} ${
      event.content
    }`;
  })
  .join("\n")}

## Recommendations
- ${
      alertCount > 5
        ? "Consider adjusting your environment to reduce alerts"
        : "Environment conditions look good"
    }
- ${
      userActions > 10
        ? "High activity level detected"
        : "Normal activity levels observed"
    }
- ${
      severeAlertCount > 2
        ? "Address the severe alerts highlighted above"
        : "No critical issues to address"
    }

_Generated at ${now.toLocaleTimeString()}_
`;

    // Create a blob and trigger download
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-report-${dateStr}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className={cn("flex flex-col h-full", className)}>
      <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg font-medium">交互历史</CardTitle>
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2 sm:px-3 text-xs sm:text-sm"
            onClick={generateDailyReport}
          >
            <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">导出日报</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 sm:p-2 flex-1 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="h-full">
          <div className="p-2 sm:p-3 space-y-2 sm:space-y-3">
            <AnimatePresence mode="popLayout">
              {events.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                >
                  <div className="flex-shrink-0 mt-1">
                    {event.event_type === "voice" && (
                      <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                    )}
                    {event.event_type === "alert" && (
                      <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
                    )}
                    {event.event_type === "action" && (
                      <MousePointer className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          {formatRelativeTime(event.timestamp)}
                        </span>
                      </div>
                      <Badge
                        variant={
                          event.severity === 3
                            ? "destructive"
                            : event.severity === 2
                            ? "warning"
                            : "default"
                        }
                        className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0 h-4 sm:h-5"
                      >
                        {event.event_type === "voice"
                          ? "语音"
                          : event.event_type === "alert"
                          ? "提醒"
                          : "操作"}
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm line-clamp-2">{event.content}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default HistoryCard;
