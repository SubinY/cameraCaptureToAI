/**
 * OSS服务配置文件
 * 用于控制是否启用OSS服务
 */

require('dotenv').config();

const ossConfig = {
  // 是否启用OSS服务，由服务器环境变量控制
  enabled: process.env.ENABLE_OSS === 'true',
  
  // OSS配置，仅在enabled为true时使用
  config: {
    accessKeyId: process.env.OSS_ACCESS_KEY_ID,
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
    endpoint: process.env.OSS_ENDPOINT,
    bucket: process.env.OSS_BUCKET
  },
  
  // 本地存储路径，当OSS服务禁用时使用
  localStoragePath: './public/uploads'
};

module.exports = ossConfig;