"use client";

import { useState, useRef, useEffect } from "react";
import { io, Socket } from "socket.io-client";

interface WebRTCCameraProps {
  onAnalysisResult?: (data: any) => void;
}

export function WebRTCCamera({ onAnalysisResult }: WebRTCCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const initWebRTC = async () => {
    try {
      // 获取本地媒体流
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // 初始化WebSocket连接
      const SERVER_BASE_URL =
        process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
      const socket = io(SERVER_BASE_URL);
      socketRef.current = socket;

      // 创建RTCPeerConnection
      const peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      peerConnectionRef.current = peerConnection;

      // 添加本地流
      stream.getTracks().forEach((track) => {
        if (peerConnection) {
          peerConnection.addTrack(track, stream);
        }
      });

      // 处理ICE候选
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            userId: socket.id,
            candidate: event.candidate,
          });
        }
      };

      // WebSocket事件处理
      socket.on("webrtc-ready", async () => {
        try {
          if (peerConnection) {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            socket.emit("webrtc-offer", {
              userId: socket.id,
              offer,
            });
          }
        } catch (error: any) {
          console.error("创建offer失败:", error);
          setConnectionStatus(`创建连接失败: ${error.message || "未知错误"}`);
        }
      });

      socket.on("connect", () => {
        setConnectionStatus("已连接到服务器");
        setIsConnected(true);
        // 加入WebRTC会话
        socket.emit("webrtc-join", { userId: socket.id });
      });

      socket.on("disconnect", () => {
        setConnectionStatus("已断开连接");
        setIsConnected(false);
        stopCapture();
      });

      socket.on("webrtc-answer", async ({ answer }) => {
        try {
          if (peerConnection) {
            await peerConnection.setRemoteDescription(answer);
            setConnectionStatus("已建立WebRTC连接");
          }
        } catch (error: any) {
          console.error("设置远程描述失败:", error);
          setConnectionStatus(`WebRTC连接失败: ${error.message || "未知错误"}`);
        }
      });

      socket.on("ice-candidate", async ({ candidate }) => {
        try {
          if (peerConnection && candidate) {
            await peerConnection.addIceCandidate(candidate);
          }
        } catch (error: any) {
          console.error("添加ICE候选失败:", error);
        }
      });

      socket.on("analysis-result", (data) => {
        console.log("收到分析结果:", data);
        if (onAnalysisResult) {
          onAnalysisResult(data);
        }
      });
    } catch (error: any) {
      console.error("初始化WebRTC失败:", error);
      setConnectionStatus(`摄像头启动失败: ${error.message || "未知错误"}`);
    }
  };

  // 捕获视频帧并发送到服务器
  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current || !socketRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    // 设置canvas尺寸与视频相同
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // 在canvas上绘制当前视频帧
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 将canvas内容转换为base64图像
    const imageData = canvas.toDataURL("image/jpeg", 0.7);
    
    // 发送到服务器
    socketRef.current.emit("frame-data", {
      userId: socketRef.current.id,
      imageData,
    });
  };

  const startCapture = () => {
    if (!isCapturing && isConnected) {
      const interval = setInterval(captureFrame, 1000); // 每秒捕获一帧
      captureIntervalRef.current = interval;
      setIsCapturing(true);
    }
  };

  const stopCapture = () => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
      setIsCapturing(false);
    }
  };

  const toggleCapture = () => {
    if (isCapturing) {
      stopCapture();
    } else {
      startCapture();
    }
  };

  useEffect(() => {
    initWebRTC();

    return () => {
      // 清理资源
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      stopCapture();
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />
      
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
        <div className="tech-badge tech-badge-secondary py-1 px-3 text-xs">
          {connectionStatus || "正在连接..."}
        </div>
        
        <button
          onClick={toggleCapture}
          className={`tech-badge py-1 px-3 text-xs ${
            isCapturing ? "tech-badge-active" : "tech-badge-secondary"
          }`}
          disabled={!isConnected}
        >
          {isCapturing ? "停止分析" : "开始分析"}
        </button>
      </div>
    </div>
  );
} 