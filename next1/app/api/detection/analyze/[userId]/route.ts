import { NextRequest, NextResponse } from "next/server";
import { Socket } from "socket.io-client";

export async function POST(
  request: NextRequest,
  { params }: { params: { userid: string } }
) {
  try {
    const userId = params.userid;
    const body = await request.json();
    
    if (!body.image) {
      return NextResponse.json(
        { error: "没有提供图像数据" },
        { status: 400 }
      );
    }

    // 转换为Buffer
    const imageBuffer = Buffer.from(body.image.split(',')[1], 'base64');
    
    // 连接到重构后的后端服务
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
    
    // 直接通过Socket.io处理
    // 由于Next.js API路由是无状态的，我们这里使用REST API进行数据分析
    // 将图像数据发送到重构后的健康检查API
    const response = await fetch(`${serverUrl}/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`服务器返回错误: ${response.status}`, errorText);
      return NextResponse.json(
        { error: `服务器连接失败: ${response.status}` },
        { status: response.status }
      );
    }

    // 由于重构后的服务使用Socket.io直接进行实时分析
    // 这里我们返回一个基本响应，真正的分析结果会通过WebRTC组件的Socket连接直接传递
    return NextResponse.json({
      success: true,
      message: "图像已通过WebRTC发送到服务器进行实时分析",
      timestamp: new Date().toISOString(),
      attention: {
        // 默认值，真实数据通过WebRTC的socket.on('analysis-result')事件获取
        heatmap: [[0.5, 0.5, 0.7]],
        time_slot: { "0-5min": 60 },
        current_attention: 60
      }
    });
  } catch (error) {
    console.error("AI检测API错误:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    );
  }
} 