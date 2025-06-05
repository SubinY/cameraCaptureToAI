"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
      // 使用环境变量中配置的服务器URL，确保连接正确
      const SERVER_BASE_URL = "http://localhost:3000";
      
      // 更新: 连接到重构后的WebRTC服务
      const socket = io(SERVER_BASE_URL, {
        transports: ["websocket", "polling"], // 支持多种传输方式
        reconnection: true, // 启用自动重连
        reconnectionAttempts: 5, // 最大重连次数
        reconnectionDelay: 1000, // 重连延迟
        timeout: 20000, // 连接超时时间
        path: '/' // 重构后的服务使用默认路径
      });
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

      // 连接状态变化
      peerConnection.onconnectionstatechange = () => {
        const state = peerConnection?.connectionState;
        setConnectionStatus(`连接状态: ${state}`);
        console.log(`WebRTC连接状态变化: ${state}`);

        // 根据连接状态更新UI
        if (state === "connected") {
          console.log("WebRTC连接已建立");
        } else if (
          state === "failed" ||
          state === "disconnected" ||
          state === "closed"
        ) {
          console.log("WebRTC连接失败或已断开");
          setIsConnected(false);
          stopCapture();
        }
      };

      // 添加ICE连接状态监控
      peerConnection.oniceconnectionstatechange = () => {
        console.log(`ICE连接状态: ${peerConnection.iceConnectionState}`);
      };

      // 添加信令状态监控
      peerConnection.onsignalingstatechange = () => {
        console.log(`信令状态: ${peerConnection.signalingState}`);
      };

      // WebSocket事件处理 - 保持与重构后服务的一致性
      socket.on("webrtc-ready", async () => {
        try {
          if (peerConnection) {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            // 移除不必要的大对象日志，避免控制台溢出
            console.log("创建offer成功");
            socket.emit("webrtc-offer", {
              userId: socket.id,
              offer,
            });
          }
        } catch (error: any) {
          // 明确指定error类型为any
          console.error("创建offer失败:", error);
          console.error("错误详情:", error.message || "未知错误");
          setConnectionStatus(`创建连接失败: ${error.message || "未知错误"}`);
        }
      });

      socket.on("connect", () => {
        setConnectionStatus("已连接到服务器");
        setIsConnected(true);
        console.log(socket.id, "socket.id");
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
            console.log("收到WebRTC应答:", JSON.stringify(answer));
            // 直接使用answer对象，不需要额外的RTCSessionDescription构造函数
            await peerConnection.setRemoteDescription(answer);
            setConnectionStatus("已建立WebRTC连接");
          }
        } catch (error: any) {
          // 明确指定error类型为any
          console.error("设置远程描述失败:", error);
          setConnectionStatus(`WebRTC连接失败: ${error.message || "未知错误"}`);

          // 尝试重新建立连接
          setTimeout(() => {
            if (isConnected) {
              console.log("尝试重新建立WebRTC连接...");
              socket.emit("webrtc-join", { userId: socket.id });
            }
          }, 3000);
        }
      });

      socket.on("ice-candidate", async ({ candidate }) => {
        try {
          if (peerConnection && candidate) {
            // 直接使用candidate对象，确保它存在
            await peerConnection.addIceCandidate(candidate);
          }
        } catch (error: any) {
          // 明确指定error类型为any
          console.error("添加ICE候选失败:", error);
          console.error("错误详情:", error.message || "未知错误");
        }
      });

      // 更新: 注意观察重构后的服务返回的分析结果格式
      socket.on("analysis-result", (data) => {
        console.log("收到分析结果:", data);
        
        // 转换数据结构以匹配UI组件预期格式
        const formattedData = {
          result: data.result,
          statistics: data.statistics,
          attention: data.result.attention || {
            heatmap: [],
            time_slot: {},
            current_attention: 0
          }
        };
        
        // 触发事件通知父组件更新UI
        if (onAnalysisResult) {
          onAnalysisResult(formattedData);
        }
      });
    } catch (error: any) {
      // 明确指定error类型为any
      console.error("初始化WebRTC失败:", error);
      // 提供更详细的错误信息
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

    // 将canvas内容转换为base64编码的图像数据
    const imageData = canvas.toDataURL("image/jpeg", 0.8).split(",")[1];

    // 发送图像数据到服务器
    socketRef.current.emit("image-data", {
      userId: socketRef.current.id,
      imageData,
    });
  };

  // 开始定期捕获
  const startCapture = () => {
    if (captureIntervalRef.current) return;

    setIsCapturing(true);
    // 每3秒捕获一次视频帧
    captureIntervalRef.current = setInterval(captureFrame, 3000);
  };

  // 停止捕获
  const stopCapture = () => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
      setIsCapturing(false);
    }
  };

  // 切换捕获状态
  const toggleCapture = () => {
    if (isCapturing) {
      stopCapture();
    } else {
      startCapture();
    }
  };

  // 组件挂载时初始化WebRTC
  useEffect(() => {
    initWebRTC();

    // 组件卸载时清理资源
    return () => {
      stopCapture();
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, []);

  return (
    <div className="camera-container relative w-full h-full overflow-hidden rounded-xl">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />

      {connectionStatus && (
        <div className="status-overlay absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-md text-sm">
          {connectionStatus}
        </div>
      )}

      <div className="controls absolute bottom-4 right-4 z-10">
        <Button
          onClick={toggleCapture}
          disabled={!isConnected}
          variant={isCapturing ? "destructive" : "default"}
        >
          {isCapturing ? "停止捕获" : "开始捕获"}
        </Button>
      </div>
    </div>
  );
}
