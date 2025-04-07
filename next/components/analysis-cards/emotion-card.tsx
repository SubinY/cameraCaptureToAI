"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import * as d3 from "d3";
import { cn } from "@/lib/utils";

interface EmotionData {
  emotion: "happy" | "neutral" | "sad" | "angry";
  confidence: number;
  duration_sec: number;
}

interface EmotionCardProps {
  className?: string;
}

const EmotionCard = ({ className }: EmotionCardProps) => {
  const [data, setData] = useState<EmotionData>({
    emotion: "neutral",
    confidence: 75,
    duration_sec: 0,
  });
  const [isLowConfidence, setIsLowConfidence] = useState(false);
  const [isNegativeEmotion, setIsNegativeEmotion] = useState(false);
  const [negativeTimer, setNegativeTimer] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const lowConfidenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const negativeEmotionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Simulate API call for demo purposes
  useEffect(() => {
    const fetchEmotionData = () => {
      // Normally this would be a real API call to AliQianwenVision.detect_emotion()
      // Simulating random emotion data for demo
      const emotions = ["happy", "neutral", "sad", "angry"] as const;
      const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
      const randomConfidence = Math.floor(Math.random() * 100);
      
      setData({
        emotion: randomEmotion,
        confidence: randomConfidence,
        duration_sec: data.duration_sec + 1,
      });

      // Check low confidence alert
      if (randomConfidence < 60) {
        if (!isLowConfidence) {
          if (!lowConfidenceTimerRef.current) {
            lowConfidenceTimerRef.current = setTimeout(() => {
              setIsLowConfidence(true);
              lowConfidenceTimerRef.current = null;
            }, 5000); // 5 seconds of low confidence
          }
        }
      } else {
        if (lowConfidenceTimerRef.current) {
          clearTimeout(lowConfidenceTimerRef.current);
          lowConfidenceTimerRef.current = null;
        }
        setIsLowConfidence(false);
      }

      // Check negative emotion alert
      if (randomEmotion === "sad" || randomEmotion === "angry") {
        setNegativeTimer(prev => prev + 1);
        if (negativeTimer >= 30 && !isNegativeEmotion) {
          setIsNegativeEmotion(true);
          // Trigger voice care
          const utterance = new SpeechSynthesisUtterance(
            "I noticed you've been feeling down for a while. Would you like to take a short break?"
          );
          window.speechSynthesis.speak(utterance);
        }
      } else {
        setNegativeTimer(0);
        setIsNegativeEmotion(false);
      }
    };

    const interval = setInterval(fetchEmotionData, 1000);
    
    return () => {
      clearInterval(interval);
      if (lowConfidenceTimerRef.current) clearTimeout(lowConfidenceTimerRef.current);
      if (negativeEmotionTimerRef.current) clearTimeout(negativeEmotionTimerRef.current);
    };
  }, [data.duration_sec, isLowConfidence, isNegativeEmotion, negativeTimer]);

  // D3.js visualization for confidence
  useEffect(() => {
    if (!svgRef.current || !data) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 150;
    const height = 150;
    const radius = Math.min(width, height) / 2;
    const innerRadius = radius * 0.7;

    // Define custom arc type to avoid TypeScript errors
    interface ArcData {
      innerRadius: number;
      outerRadius: number;
      startAngle: number;
      endAngle: number;
    }

    const arcGenerator = d3.arc<ArcData>()
      .innerRadius(d => d.innerRadius)
      .outerRadius(d => d.outerRadius)
      .startAngle(d => d.startAngle)
      .cornerRadius(10);

    const background = svg.append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Background arc
    background.append("path")
      .attr("d", arcGenerator({ 
        innerRadius,
        outerRadius: radius,
        startAngle: 0,
        endAngle: Math.PI * 2
      }))
      .attr("fill", "#ddd");

    // Progress arc
    background.append("path")
      .attr("d", arcGenerator({ 
        innerRadius,
        outerRadius: radius, 
        startAngle: 0,
        endAngle: (data.confidence / 100) * Math.PI * 2
      }))
      .attr("fill", getEmotionColor(data.emotion));

    // Add confidence text
    background.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .attr("class", "font-bold text-xl")
      .text(`${data.confidence}%`);

    // Add emotion icon/emoji
    background.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "3em")
      .attr("class", "text-2xl")
      .text(getEmotionEmoji(data.emotion));

  }, [data]);

  const getEmotionColor = (emotion: EmotionData["emotion"]): string => {
    switch (emotion) {
      case "happy": return "#4CAF50";
      case "neutral": return "#2196F3";
      case "sad": return "#FFC107";
      case "angry": return "#F44336";
      default: return "#9E9E9E";
    }
  };

  const getEmotionEmoji = (emotion: EmotionData["emotion"]): string => {
    switch (emotion) {
      case "happy": return "😊";
      case "neutral": return "😐";
      case "sad": return "😢";
      case "angry": return "😠";
      default: return "❓";
    }
  };

  const getEmotionLabel = (emotion: EmotionData["emotion"]): string => {
    switch (emotion) {
      case "happy": return "Happy";
      case "neutral": return "Neutral";
      case "sad": return "Sad";
      case "angry": return "Angry";
      default: return "Unknown";
    }
  };

  // Duration bar calculation
  const durationBarWidth = () => {
    // Max duration we want to show is 2 minutes (120 seconds)
    const maxDuration = 120;
    const percentage = Math.min((data.duration_sec / maxDuration) * 100, 100);
    return `${percentage}%`;
  };

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300 h-full flex flex-col",
      isLowConfidence && "animate-pulse border-amber-500",
      isNegativeEmotion && "border-red-500",
      className
    )}>
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg md:text-xl">Emotion Analysis</CardTitle>
          <Badge 
            variant={data.confidence > 80 ? "default" : "outline"}
            className={cn(
              "bg-opacity-80",
              data.confidence < 60 && "bg-amber-500"
            )}
          >
            {data.confidence < 60 ? "Low confidence" : "Monitoring"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center flex-1 overflow-y-auto p-4 pt-0">
        <div className="flex flex-col items-center w-full max-w-full">
          <svg 
            ref={svgRef} 
            width="150" 
            height="150" 
            className="w-[100px] h-[100px] md:w-[120px] md:h-[120px] xl:w-[150px] xl:h-[150px]"
          />
          
          <div className="mt-2 w-full">
            <div className="flex justify-between text-xs sm:text-sm text-muted-foreground mb-1">
              <span>Current: {getEmotionLabel(data.emotion)}</span>
              <span>{Math.floor(data.duration_sec)}s</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-300"
                style={{ 
                  width: durationBarWidth(),
                  backgroundColor: getEmotionColor(data.emotion)
                }}
              />
            </div>
          </div>
          
          {isNegativeEmotion && (
            <div className="mt-3 p-2 bg-red-100 dark:bg-red-900 dark:bg-opacity-30 rounded-md text-xs sm:text-sm text-center">
              Prolonged negative emotion detected. Consider taking a break.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmotionCard; 