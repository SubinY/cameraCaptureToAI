/**
 * 主路由文件 - 集中管理所有路由
 */

const Router = require('koa-router');
const apiRoutes = require('./api');
const apiController = require('../controllers/apiController');

const router = new Router();

// 健康检查路由
router.get('/health', apiController.getHealth);

// 使用API路由
router.use(apiRoutes.routes());
router.use(apiRoutes.allowedMethods());

module.exports = router;