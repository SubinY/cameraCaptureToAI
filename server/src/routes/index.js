const Router = require('koa-router');
const router = new Router();

// 健康检查路由
router.get('/health', (ctx) => {
  ctx.body = { status: 'ok' };
});

// 获取行为统计数据路由
router.get('/api/statistics', (ctx) => {
  // 这个路由将由Socket.IO处理，这里只是提供一个HTTP接口
  ctx.body = { message: '请使用WebSocket连接获取实时统计数据' };
});

module.exports = router;