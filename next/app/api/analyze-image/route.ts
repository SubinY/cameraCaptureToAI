import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// 服务器基础URL
const SERVER_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';

/**
 * 处理图像分析请求
 */
export async function POST(request: NextRequest) {
  try {
    // 获取请求中的图像数据
    const formData = await request.formData();
    const image = formData.get('image') as File;
    
    if (!image) {
      return NextResponse.json({ error: '未提供图像' }, { status: 400 });
    }
    
    // 创建新的FormData对象，用于转发到服务器
    const serverFormData = new FormData();
    serverFormData.append('image', image);
    
    // 转发请求到服务器
    const response = await axios.post(`${SERVER_BASE_URL}/api/analyze-image`, serverFormData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // 返回服务器的响应
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('图像分析请求处理失败:', error);
    return NextResponse.json({ error: '图像分析失败' }, { status: 500 });
  }
}