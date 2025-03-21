# DeepSeek Camera Server

这是一个基于Node.js和WebRTC的行为监控服务器，用于接收客户端的视频流，分析用户行为，并提供实时统计数据。

## 功能特点

- 使用WebRTC接收客户端视频流
- 使用Qwen-VL API分析用户行为
- 将图像上传到阿里云OSS存储
- 提供实时行为统计数据
- 支持WebSocket实时通信

## 目录结构

```
server/
├── src/
│   ├── app.js            # 主应用入口
│   ├── routes/           # 路由定义
│   ├── services/         # 业务服务
│   │   ├── imageAnalysisService.js  # 图像分析服务
│   │   └── webrtcService.js         # WebRTC服务
│   └── utils/            # 工具函数
│       └── ossClient.js  # OSS客户端
├── temp/                 # 临时文件目录
├── public/               # 静态资源
├── .env                  # 环境变量
└── package.json          # 项目依赖
```

## 安装依赖

```bash
npm install
```

## 启动服务

开发模式（热更新）：

```bash
npm run dev
```

生产模式：

```bash
npm start
```

## 环境变量

在`.env`文件中配置以下环境变量：

- `OSS_ACCESS_KEY_ID`: 阿里云OSS访问密钥ID
- `OSS_ACCESS_KEY_SECRET`: 阿里云OSS访问密钥密码
- `OSS_ENDPOINT`: 阿里云OSS端点
- `OSS_BUCKET`: 阿里云OSS存储桶名称
- `QWEN_API_KEY`: 通义千问API密钥
- `QWEN_BASE_URL`: 通义千问API基础URL
- `PORT`: 服务器端口号

## 客户端集成

前端使用Vue.js和WebRTC实现，请参考`web`目录下的代码。