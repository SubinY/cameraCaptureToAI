/**
 * AI检测控制器 - 处理AI检测相关的API请求
 */

const aiDetectionService = require('../services/aiDetectionService');

/**
 * 处理图像分析请求
 * @param {Object} ctx - Koa上下文
 */
async function processImageAnalysis(ctx) {
  try {
    const { userId } = ctx.params;
    const { image } = ctx.request.body;
    
    if (!userId) {
      ctx.status = 400;
      ctx.body = { error: '缺少用户ID' };
      return;
    }
    
    if (!image) {
      ctx.status = 400;
      ctx.body = { error: '缺少图像数据' };
      return;
    }
    
    // 解码Base64图像
    const imageBuffer = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    
    // 处理图像分析
    const result = await aiDetectionService.processImage(userId, imageBuffer);
    
    // 返回分析结果
    ctx.status = 200;
    ctx.body = result;
  } catch (error) {
    console.error('处理图像分析错误:', error);
    ctx.status = 500;
    ctx.body = { error: '处理图像分析失败', message: error.message };
  }
}

/**
 * 获取用户状态报告
 * @param {Object} ctx - Koa上下文
 */
async function getUserReport(ctx) {
  try {
    const { userId } = ctx.params;
    
    if (!userId) {
      ctx.status = 400;
      ctx.body = { error: '缺少用户ID' };
      return;
    }
    
    // 获取用户报告
    const report = await aiDetectionService.generateUserReport(userId);
    
    // 返回报告
    ctx.status = 200;
    ctx.body = report;
  } catch (error) {
    console.error('获取用户报告错误:', error);
    ctx.status = 500;
    ctx.body = { error: '获取用户报告失败', message: error.message };
  }
}

/**
 * 获取AI检测阈值配置
 * @param {Object} ctx - Koa上下文
 */
function getThresholds(ctx) {
  try {
    // 返回阈值配置
    ctx.status = 200;
    ctx.body = aiDetectionService.THRESHOLDS;
  } catch (error) {
    console.error('获取阈值配置错误:', error);
    ctx.status = 500;
    ctx.body = { error: '获取阈值配置失败', message: error.message };
  }
}

module.exports = {
  processImageAnalysis,
  getUserReport,
  getThresholds
}; 