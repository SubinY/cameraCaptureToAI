"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { cn } from "@/lib/utils";

interface PostureData {
  neck_angle: number; // 0-90°
  screen_distance: number; // 30-150cm
  sit_duration: number; // minutes
}

const NORMAL_ANGLE_RANGE = { min: 15, max: 35 };
const NORMAL_DISTANCE_RANGE = { min: 50, max: 80 };
const SIT_WARNING_THRESHOLD = 45; // minutes

interface PostureCardProps {
  className?: string;
}

const PostureCard = ({ className }: PostureCardProps) => {
  const [data, setData] = useState<PostureData>({
    neck_angle: 25,
    screen_distance: 65,
    sit_duration: 0,
  });
  const [warnings, setWarnings] = useState({
    angle: false,
    distance: false,
    duration: false,
  });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const modelRef = useRef<THREE.Group>(null);

  // Simulate API call for demo purposes
  useEffect(() => {
    const fetchPostureData = () => {
      // Normally this would be a real API call to AliQianwenVision.detect_posture()
      // Simulating random posture data for demo

      // Neck angle varies slowly around a baseline
      const newAngle = Math.max(5, Math.min(90, data.neck_angle + (Math.random() - 0.5) * 5));
      
      // Screen distance varies slowly
      const newDistance = Math.max(30, Math.min(150, data.screen_distance + (Math.random() - 0.5) * 10));
      
      // Sitting duration increases with time
      const newDuration = data.sit_duration + (1/60); // Increment by 1 second converted to minutes
      
      setData({
        neck_angle: newAngle,
        screen_distance: newDistance,
        sit_duration: newDuration,
      });

      // Check warnings
      setWarnings({
        angle: newAngle < NORMAL_ANGLE_RANGE.min || newAngle > NORMAL_ANGLE_RANGE.max,
        distance: newDistance < NORMAL_DISTANCE_RANGE.min,
        duration: newDuration >= SIT_WARNING_THRESHOLD,
      });
    };

    intervalRef.current = setInterval(fetchPostureData, 1000); // Update every second
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [data]);

  // Update 3D model rotation based on neck angle
  useEffect(() => {
    if (modelRef.current) {
      modelRef.current.rotation.x = THREE.MathUtils.degToRad(data.neck_angle);
    }
  }, [data.neck_angle]);

  // Get color based on value and range
  const getIndicatorColor = (value: number, normalMin: number, normalMax: number) => {
    if (value < normalMin) return "text-amber-500";
    if (value > normalMax) return "text-red-500";
    return "text-green-500";
  };

  // Get suggestion text based on current warnings
  const getSuggestion = () => {
    if (warnings.angle && data.neck_angle < NORMAL_ANGLE_RANGE.min) {
      return "Raise your head, you're looking down too much.";
    }
    if (warnings.angle && data.neck_angle > NORMAL_ANGLE_RANGE.max) {
      return "Lower your head slightly for a better neck posture.";
    }
    if (warnings.distance) {
      return "Move back from your screen. Current distance is too close.";
    }
    if (warnings.duration) {
      return "You've been sitting for too long. Take a short break.";
    }
    return "Your posture looks good!";
  };

  // Calculate remaining sit time before warning
  const getRemainingMinutes = () => {
    return Math.max(0, SIT_WARNING_THRESHOLD - data.sit_duration);
  };

  // Simple 3D head model for rotation visualization
  const HeadModel = () => {
    return (
      <group ref={modelRef}>
        {/* Head */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color="#f0d0b0" />
        </mesh>
        {/* Neck */}
        <mesh position={[0, -1.2, 0]} rotation={[0.2, 0, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 1.5, 32]} />
          <meshStandardMaterial color="#e0c0a0" />
        </mesh>
        {/* Eyes */}
        <mesh position={[0.4, 0.3, 0.85]}>
          <sphereGeometry args={[0.2, 32, 32]} />
          <meshStandardMaterial color="#222" />
        </mesh>
        <mesh position={[-0.4, 0.3, 0.85]}>
          <sphereGeometry args={[0.2, 32, 32]} />
          <meshStandardMaterial color="#222" />
        </mesh>
        {/* Mouth */}
        <mesh position={[0, -0.3, 0.85]} rotation={[0.1, 0, 0]}>
          <torusGeometry args={[0.4, 0.1, 16, 32, Math.PI]} />
          <meshStandardMaterial color="#d08080" />
        </mesh>
      </group>
    );
  };

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300 h-full flex flex-col",
      (warnings.angle || warnings.distance) && "border-amber-500",
      warnings.duration && "border-red-500",
      className
    )}>
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg md:text-xl">Posture Monitoring</CardTitle>
          <Badge 
            variant={!warnings.angle && !warnings.distance && !warnings.duration ? "default" : "outline"}
            className={cn(
              "bg-opacity-80",
              (warnings.angle || warnings.distance) && "bg-amber-500 text-amber-950",
              warnings.duration && "bg-red-500 text-red-950"
            )}
          >
            {warnings.duration 
              ? "Break needed" 
              : warnings.angle || warnings.distance 
                ? "Adjust posture" 
                : "Good posture"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0 flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="h-[100px] sm:h-[110px] lg:h-[120px]">
            <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <HeadModel />
              <OrbitControls enableZoom={false} enablePan={false} />
            </Canvas>
          </div>
          
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs sm:text-sm">Neck Angle</span>
                <span className={cn(
                  "text-xs sm:text-sm font-medium",
                  getIndicatorColor(data.neck_angle, NORMAL_ANGLE_RANGE.min, NORMAL_ANGLE_RANGE.max)
                )}>
                  {Math.round(data.neck_angle)}°
                </span>
              </div>
              <Progress 
                value={(data.neck_angle / 90) * 100} 
                className={cn(
                  "h-1.5 sm:h-2",
                  warnings.angle ? "bg-amber-200" : "bg-slate-200"
                )}
                indicatorClassName={cn(
                  warnings.angle ? "bg-amber-500" : "bg-green-500"
                )}
              />
              
              <div className="flex justify-between mt-2 mb-1">
                <span className="text-xs sm:text-sm">Screen Distance</span>
                <span className={cn(
                  "text-xs sm:text-sm font-medium",
                  getIndicatorColor(data.screen_distance, NORMAL_DISTANCE_RANGE.min, 150)
                )}>
                  {Math.round(data.screen_distance)}cm
                </span>
              </div>
              <Progress 
                value={(data.screen_distance / 150) * 100} 
                className={cn(
                  "h-1.5 sm:h-2",
                  warnings.distance ? "bg-amber-200" : "bg-slate-200"
                )}
                indicatorClassName={cn(
                  warnings.distance ? "bg-amber-500" : "bg-green-500"
                )}
              />
            </div>
          </div>
        </div>
        
        <div className="mt-2">
          <div className="flex justify-between mb-1">
            <span className="text-xs sm:text-sm">Sit Duration</span>
            <span className={cn(
              "text-xs sm:text-sm font-medium",
              warnings.duration ? "text-red-500" : "text-muted-foreground"
            )}>
              {Math.floor(data.sit_duration)} min
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 sm:h-2.5 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-300",
                warnings.duration ? "bg-red-500" : "bg-green-500"
              )}
              style={{ 
                width: `${Math.min((data.sit_duration / SIT_WARNING_THRESHOLD) * 100, 100)}%`
              }}
            />
          </div>
          
          <div className="mt-2 p-1.5 sm:p-2 bg-slate-100 dark:bg-slate-800 rounded-md text-xs sm:text-sm">
            {getSuggestion()}
          </div>
          
          {warnings.duration && (
            <div className="mt-1 text-center text-red-500 text-xs sm:text-sm font-medium animate-pulse">
              Time for a break! Stand up and stretch.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PostureCard; 