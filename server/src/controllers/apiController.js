/**
 * API控制器 - 处理API请求
 */

const { getBehaviorStatistics } = require('../models/behaviorModel');
const { getActiveUsers } = require('../models/userModel');

/**
 * 获取健康状态
 * @param {Object} ctx - Koa上下文
 */
async function getHealth(ctx) {
  ctx.body = { status: 'ok' };
}

/**
 * 获取行为统计数据
 * @param {Object} ctx - Koa上下文
 */
async function getStatistics(ctx) {
  try {
    const statistics = getBehaviorStatistics();
    ctx.body = {
      success: true,
      data: statistics
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '获取统计数据失败',
      error: error.message
    };
  }
}

/**
 * 获取活跃用户列表
 * @param {Object} ctx - Koa上下文
 */
async function getUsers(ctx) {
  try {
    const users = getActiveUsers();
    ctx.body = {
      success: true,
      data: users
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '获取用户列表失败',
      error: error.message
    };
  }
}

module.exports = {
  getHealth,
  getStatistics,
  getUsers
};