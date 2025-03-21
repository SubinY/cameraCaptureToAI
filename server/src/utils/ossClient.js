const OSS = require('ali-oss');
const fs = require('fs');
const path = require('path');

/**
 * 创建OSS客户端
 * @returns {OSS} - OSS客户端实例
 */
function createOSSClient() {
  return new OSS({
    accessKeyId: process.env.OSS_ACCESS_KEY_ID,
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
    endpoint: process.env.OSS_ENDPOINT,
    bucket: process.env.OSS_BUCKET
  });
}

/**
 * 上传文件到OSS
 * @param {string} filePath - 本地文件路径
 * @param {string} ossKey - OSS存储路径
 * @returns {Promise<string>} - OSS URL
 */
async function uploadToOSS(filePath, ossKey) {
  try {
    const client = createOSSClient();
    
    // 上传文件
    const result = await client.put(ossKey, fs.createReadStream(filePath));
    
    return result.url;
  } catch (error) {
    console.error(`上传到OSS失败: ${error.message}`);
    throw error;
  }
}

module.exports = {
  createOSSClient,
  uploadToOSS
};