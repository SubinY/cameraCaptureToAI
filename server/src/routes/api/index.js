/**
 * API路由 - 处理API请求的路由
 */

const Router = require('koa-router');
const apiController = require('../../controllers/apiController');

const router = new Router({ prefix: '/api' });

// 获取行为统计数据
router.get('/statistics', apiController.getStatistics);

// 获取活跃用户列表
router.get('/users', apiController.getUsers);

module.exports = router;