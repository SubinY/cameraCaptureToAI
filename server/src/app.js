const Koa = require('koa');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const koaStatic = require('koa-static');
const koaBodyParser = require('koa-bodyparser');
const dotenv = require('dotenv');
const fs = require('fs');
const { initWebRTCService } = require('./services/webrtcService');

// 加载环境变量
dotenv.config();

// 创建Koa应用
const app = new Koa();

// 创建HTTP服务器
const server = http.createServer(app.callback());

// 创建Socket.IO服务器
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// 初始化WebRTC服务
initWebRTCService(io);

// 中间件
app.use(koaBodyParser());
app.use(koaStatic(path.join(__dirname, '../public')));

// 创建路由
const router = require('./routes');
const apiRouter = require('./routes/api');

// 使用路由
app.use(router.routes());
app.use(router.allowedMethods());
app.use(apiRouter.routes());
app.use(apiRouter.allowedMethods());

// 启动服务器
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`服务器已启动，监听端口: ${PORT}`);
  console.log(`WebRTC服务已就绪`);
});

module.exports = app;