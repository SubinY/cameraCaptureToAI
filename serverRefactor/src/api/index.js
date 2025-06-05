/**
 * API路由 - 提供基本的健康检查API
 */

const Router = require('koa-router');

const router = new Router();

// 健康检查路由
router.get('/health', async (ctx) => {
  ctx.body = { status: 'ok' };
});

module.exports = router; 