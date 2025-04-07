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

  // Simulate event generation
  useEffect(() => {
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
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

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
    <Card className={cn("overflow-hidden h-full flex flex-col", className)}>
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg md:text-xl">
            Interaction History
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={generateDailyReport}
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="w-full">
            <div className="p-4">
              <div className="max-h-[260px] relative pl-6 border-l border-gray-200 dark:border-gray-700 space-y-4">
                <AnimatePresence initial={false}>
                  {events.map((event) => (
                    <motion.div
                      key={event.id}
                      className="relative"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Timeline dot */}
                      <div
                        className={cn(
                          "absolute left-[-14px] top-1 w-5 h-5 rounded-full flex items-center justify-center",
                          event.event_type === "voice"
                            ? "bg-blue-100 dark:bg-blue-900"
                            : event.event_type === "alert"
                            ? "bg-red-100 dark:bg-red-900"
                            : "bg-green-100 dark:bg-green-900"
                        )}
                      >
                        <span className={cn("h-4 w-4", getEventColor(event))}>
                          {getEventIcon(event.event_type)}
                        </span>
                      </div>

                      {/* Event content */}
                      <div className="mb-2">
                        <div className="flex items-center justify-between flex-wrap">
                          <div className="flex items-center">
                            <Badge
                              variant="outline"
                              className={cn(
                                "capitalize text-xs",
                                event.event_type === "voice"
                                  ? "text-blue-500 border-blue-300"
                                  : event.event_type === "alert"
                                  ? "text-red-500 border-red-300"
                                  : "text-green-500 border-green-300"
                              )}
                            >
                              {event.event_type}
                            </Badge>
                            <span className="ml-2 text-xs text-muted-foreground flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatRelativeTime(event.timestamp)}
                            </span>
                          </div>
                          {event.severity > 1 && (
                            <div className="text-amber-500 mt-1 sm:mt-0">
                              {"⭐".repeat(event.severity)}
                            </div>
                          )}
                        </div>
                        <p className="mt-1 text-sm">{event.content}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </ScrollArea>
        </div>

        <div className="flex justify-between items-center p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex-shrink-0">
          <span className="text-xs text-muted-foreground">
            {events.length} events
          </span>
          <div className="flex space-x-2">
            <Badge
              variant="outline"
              className="text-blue-500 border-blue-300 text-xs"
            >
              <MessageCircle className="h-3 w-3 mr-1" />
              {events.filter((e) => e.event_type === "voice").length}
            </Badge>
            <Badge
              variant="outline"
              className="text-red-500 border-red-300 text-xs"
            >
              <AlertTriangle className="h-3 w-3 mr-1" />
              {events.filter((e) => e.event_type === "alert").length}
            </Badge>
            <Badge
              variant="outline"
              className="text-green-500 border-green-300 text-xs"
            >
              <MousePointer className="h-3 w-3 mr-1" />
              {events.filter((e) => e.event_type === "action").length}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HistoryCard;
