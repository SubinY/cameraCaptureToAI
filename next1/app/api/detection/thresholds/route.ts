import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // 转发请求到服务器
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
    const response = await fetch(`${serverUrl}/api/detection/thresholds`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`服务器返回错误: ${response.status}`, errorText);
      return NextResponse.json(
        { error: `服务器返回错误: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("获取阈值配置API错误:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    );
  }
} 