/**
 * 服务端API集成
 * 用于在Next.js项目中集成server服务的功能
 */

import axios from 'axios';
import { io, Socket } from 'socket.io-client';

// 服务器基础URL
const SERVER_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';

// Socket.IO连接实例
let socket: Socket | null = null;

// 行为类型映射
export const BEHAVIOR_TYPES = {
  1: { code: 'work', description: '认真专注工作' },
  2: { code: 'eating', description: '吃东西' },
  3: { code: 'drinking_water', description: '用杯子喝水' },
  4: { code: 'drinking_beverage', description: '喝饮料' },
  5: { code: 'phone', description: '玩手机' },
  6: { code: 'sleeping', description: '睡觉' },
  7: { code: 'other', description: '其他' }
};

// 行为统计数据类型
export interface BehaviorStatistics {
  behaviorCounts: Record<string, number>;
  recentBehaviors: Array<{
    timestamp: number;
    behaviorType: number;
    confidence: number;
  }>;
  timeDistribution: Record<string, number>;
}

// 初始化Socket.IO连接
export function initSocketConnection(): Socket {
  if (!socket) {
    socket = io(SERVER_BASE_URL, {
      transports: ['websocket'],
      reconnection: true,
    });

    socket.on('connect', () => {
      console.log('已连接到WebRTC服务器');
    });

    socket.on('disconnect', () => {
      console.log('与WebRTC服务器断开连接');
    });
  }

  return socket;
}

// 获取行为统计数据
export function subscribeToBehaviorStatistics(callback: (data: BehaviorStatistics) => void): () => void {
  const socket = initSocketConnection();

  // 订阅行为统计数据更新
  socket.on('behavior_statistics', (data: BehaviorStatistics) => {
    callback(data);
  });

  // 返回取消订阅函数
  return () => {
    socket.off('behavior_statistics');
  };
}

// 发送图像数据进行分析
export async function sendImageForAnalysis(imageData: Blob): Promise<any> {
  try {
    const formData = new FormData();
    formData.append('image', imageData);

    const response = await axios.post(`${SERVER_BASE_URL}/api/analyze-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('发送图像分析失败:', error);
    throw error;
  }
}

// 获取健康状态
export async function getServerHealth(): Promise<{ status: string }> {
  try {
    const response = await axios.get(`${SERVER_BASE_URL}/health`);
    return response.data;
  } catch (error) {
    console.error('获取服务器健康状态失败:', error);
    throw error;
  }
}