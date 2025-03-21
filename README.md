# Camera Capture To AI（Developing）

一个基于 Vue.js + Node.js 的摄像头行为分析系统，用于实时捕获摄像头画面并通过 AI 进行行为识别分析。

## 项目架构

### 前端 (web/)
- Vue 3.4
- Vite 5.0
- TypeScript
- Ant Design Vue 4.1
- Socket.IO Client
- ECharts 5.4
- Pinia 状态管理

### 后端 (server/)
- Node.js
- Koa 2.16
- Socket.IO 4.7
- WebRTC
- 阿里云 OSS
- 通义千问 API (Qwen-VL)

## 项目结构

```plaintext
.
├── server/                # 后端服务
│   ├── src/
│   │   ├── app.js        # 主应用入口
│   │   ├── routes/       # API 路由
│   │   ├── services/     # 业务服务
│   │   └── utils/        # 工具函数
│   ├── temp/             # 临时文件存储
│   └── public/           # 静态资源
│
├── web/                   # 前端应用
│   ├── src/
│   │   ├── components/   # Vue 组件
│   │   ├── stores/       # Pinia 状态
│   │   └── views/        # 页面视图
│   └── public/           # 静态资源