/**
 * 文件服务 - 处理文件操作和临时文件管理
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { tempDir, saveImageToTemp, deleteTempFile } = require('../utils/fileUtils');
const { uploadToOSS } = require("../utils/ossClient");
const ossConfig = require("../config/oss.config");

/**
 * 保存图像到临时文件（不上传）
 * @param {Buffer} imageBuffer - 图像数据
 * @param {string} prefix - 文件名前缀
 * @returns {Promise<Object>} - 保存结果
 */
async function saveImage(imageBuffer, prefix = '') {
  try {
    // 保存图像到临时文件
    const timestamp = Date.now();
    const tempFilePath = saveImageToTemp(imageBuffer, prefix || `image_${timestamp}`);

    return {
      timestamp,
      tempFilePath
    };
  } catch (error) {
    console.error("保存图像失败:", error);
    throw error;
  }
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

    // 上传到OSS
    const ossKey = ossConfig.enabled ? `behavior_images/${timestamp}.jpg` : "";
    const ossUrl = ossConfig.enabled
      ? await uploadToOSS(tempFilePath, ossKey)
      : "";

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
 * 清理图像文件
 * @param {string} filePath - 文件路径
 */
function cleanupImageFile(filePath) {
  try {
    deleteTempFile(filePath);
  } catch (error) {
    console.error(`清理图像文件失败: ${error.message}`);
  }
}

module.exports = {
  saveImage,
  saveAndUploadImage,
  cleanupImageFile
};