/**
 * 文件管理器 - 处理文件操作和上传
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const OSS = require('ali-oss');

// 临时文件保留的最大时间（毫秒）
const MAX_TEMP_FILE_AGE = 5 * 60 * 1000; // 5分钟

// 确保temp目录存在
const tempDir = path.join(__dirname, '../../temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

/**
 * 保存并上传图像
 * @param {Buffer} imageBuffer - 图像数据
 * @param {string} prefix - 文件名前缀
 * @returns {Promise<Object>} - 保存和上传结果
 */
async function saveAndUploadImage(imageBuffer, prefix = '') {
  try {
    // 保存图像到临时文件
    const timestamp = Date.now();
    const tempFilePath = saveImageToTemp(imageBuffer, prefix || `upload_${timestamp}`);

    // 尝试上传到OSS (如果配置了)
    let ossUrl = "";
    if (process.env.ENABLE_OSS === 'true' && process.env.OSS_ACCESS_KEY_ID) {
      const ossKey = `behavior_images/${timestamp}.jpg`;
      ossUrl = await uploadToOSS(tempFilePath, ossKey);
    }

    return {
      timestamp,
      tempFilePath,
      ossUrl
    };
  } catch (error) {
    console.error("保存和上传图像失败:", error);
    throw error;
  }
}

/**
 * 上传文件到OSS
 * @param {string} filePath - 本地文件路径
 * @param {string} ossKey - OSS存储路径
 * @returns {Promise<string>} - OSS URL
 */
async function uploadToOSS(filePath, ossKey) {
  try {
    const client = new OSS({
      accessKeyId: process.env.OSS_ACCESS_KEY_ID,
      accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
      endpoint: process.env.OSS_ENDPOINT,
      bucket: process.env.OSS_BUCKET
    });
    
    // 上传文件
    const result = await client.put(ossKey, fs.createReadStream(filePath));
    
    return result.url;
  } catch (error) {
    console.error(`上传到OSS失败: ${error.message}`);
    return "";
  }
}

/**
 * 删除临时文件
 * @param {string} filePath - 文件路径
 */
function deleteTempFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`已删除临时文件: ${filePath}`);
    }
  } catch (error) {
    console.error(`删除临时文件失败: ${filePath}, 错误: ${error.message}`);
  }
}

/**
 * 清理过期的临时文件
 */
async function cleanupTempFiles() {
  try {
    const now = Date.now();
    const readdir = promisify(fs.readdir);
    const stat = promisify(fs.stat);
    
    // 读取temp目录中的所有文件
    const files = await readdir(tempDir);
    
    for (const file of files) {
      const filePath = path.join(tempDir, file);
      const fileStat = await stat(filePath);
      
      // 检查文件是否为普通文件且已超过最大保留时间
      if (fileStat.isFile() && now - fileStat.mtime.getTime() > MAX_TEMP_FILE_AGE) {
        deleteTempFile(filePath);
      }
    }
  } catch (error) {
    console.error(`清理临时文件失败: ${error.message}`);
  }
}

/**
 * 保存图像数据到临时文件
 * @param {Buffer} imageData - 图像数据
 * @param {string} prefix - 文件名前缀
 * @returns {string} - 临时文件路径
 */
function saveImageToTemp(imageData, prefix = '') {
  // 确保temp目录存在
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  // 创建临时文件路径
  const timestamp = Date.now();
  const fileName = prefix ? `${prefix}_${timestamp}.jpg` : `image_${timestamp}.jpg`;
  const filePath = path.join(tempDir, fileName);
  
  // 保存图像数据到文件
  fs.writeFileSync(filePath, imageData);
  
  return filePath;
}

/**
 * 启动定时清理任务
 */
function startCleanupTask() {
  // 设置定时清理临时文件的任务
  const interval = setInterval(cleanupTempFiles, MAX_TEMP_FILE_AGE / 2); // 每2.5分钟清理一次
  console.log('已设置临时文件自动清理任务');
  return interval;
}

module.exports = {
  tempDir,
  saveImageToTemp,
  deleteTempFile,
  saveAndUploadImage,
  startCleanupTask
}; 