/**
 * AI检测路由 - 定义AI检测相关的API路由
 */

const Router = require('koa-router');
const aiDetectionController = require('../controllers/aiDetectionController');

// 创建路由
const router = new Router({
  prefix: '/api/detection'
});

// 定义路由
router.post('/analyze/:userId', aiDetectionController.processImageAnalysis);
router.get('/report/:userId', aiDetectionController.getUserReport);
router.get('/thresholds', aiDetectionController.getThresholds);

module.exports = router; 