/**
 * 图像分析服务 - 处理图像分析相关功能
 */

const { uploadToOSS } = require("../utils/ossClient");
const ossConfig = require("../config/oss.config");
const { BEHAVIOR_TYPES, extractBehaviorType } = require("../models/behaviorModel");
const qwenAdapter = require('./ai/qwenAdapter');
const fileService = require('./fileService');

// 导出模块
module.exports = {
  analyzeImage,
  BEHAVIOR_TYPES,
};

/**
 * 分析图像内容
 * @param {Buffer} imageBuffer - 图像数据
 * @returns {Promise<Object>} - 分析结果
 */
async function analyzeImage(imageBuffer) {
  try {
    // 使用文件服务保存和上传图像
    const { timestamp, tempFilePath, ossUrl } = await fileService.saveAndUploadImage(imageBuffer, 'analysis');

    // 调用Qwen-VL API进行图像分析
    const analysisResult = await qwenAdapter.analyzeImage(tempFilePath);

    // 提取行为类型
    const { behaviorType, behaviorDesc } = extractBehaviorType(analysisResult);

    // 清理临时文件
    fileService.cleanupImageFile(tempFilePath);

    return {
      timestamp,
      imageUrl: ossUrl,
      analysis: analysisResult,
      result: {
        type: behaviorType,
        code: BEHAVIOR_TYPES[behaviorType]?.code || "unknown",
        description:
          behaviorDesc ||
          BEHAVIOR_TYPES[behaviorType]?.description ||
          "未知行为",
      },
    };
  } catch (error) {
    console.error("分析图像失败:", error);
    throw error;
  }
}