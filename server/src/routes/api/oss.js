/**
 * OSS配置API路由
 */

const Router = require('koa-router');
const ossConfig = require('../../config/oss.config');

const router = new Router({ prefix: '/api' });

// 获取OSS配置状态
router.get('/oss-config', async (ctx) => {
  ctx.body = {
    enabled: ossConfig.enabled
  };
});

// 获取文件URL
router.get('/file-url', async (ctx) => {
  const { fileName } = ctx.query;
  
  if (!fileName) {
    ctx.status = 400;
    ctx.body = { error: '文件名不能为空' };
    return;
  }
  
  if (ossConfig.enabled) {
    // 构建OSS URL
    const { bucket, endpoint } = ossConfig.config;
    ctx.body = {
      url: `https://${bucket}.${endpoint}/${fileName}`
    };
  } else {
    // 返回本地URL
    ctx.body = {
      url: `/uploads/${fileName}`
    };
  }
});

// 文件上传API
router.post('/upload', async (ctx) => {
  // 这里需要实现文件上传逻辑
  // 如果启用了OSS，则上传到OSS
  // 否则保存到本地
  
  // 示例响应
  ctx.body = {
    url: '/uploads/example.jpg'
  };
});

module.exports = router;