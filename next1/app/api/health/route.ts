import { NextResponse } from 'next/server';
import axios from 'axios';

// 服务器基础URL
const SERVER_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';

/**
 * 处理健康检查请求
 */
export async function GET() {
  try {
    // 转发请求到服务器
    const response = await axios.get(`${SERVER_BASE_URL}/health`);
    
    // 返回服务器的响应
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('健康检查请求处理失败:', error);
    return NextResponse.json({ status: 'error', message: '服务器连接失败' }, { status: 500 });
  }
}