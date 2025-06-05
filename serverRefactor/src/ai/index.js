/**
 * AI模块 - 集中管理所有AI分析功能
 */

const qwenAdapter = require('./adapters/qwen');
const { analyzeAttention } = require('./analyzers/attention');
const fs = require('fs');

/**
 * 从分析文本中提取行为类型和描述
 * @param {string} analysisText - 分析结果文本
 * @returns {Object} - 包含行为类型和描述的对象
 */
function extractBehaviorType(analysisText) {
  // 尝试匹配行为类型数字和描述（1-7）
  const pattern =
    /(\d+)\s*[.、:]?\s*(认真专注工作|吃东西|用杯子喝水|喝饮料|玩手机|睡觉|其他)/;
  const match = analysisText.match(pattern);

  if (match) {
    const behaviorType = match[1];
    const behaviorDesc = match[2];
    return { behaviorType, behaviorDesc };
  }

  // 如果第一种模式匹配失败，尝试替代模式
  const patterns = [
    { pattern: /认真专注工作/, type: "1" },
    { pattern: /吃东西/, type: "2" },
    { pattern: /用杯子喝水/, type: "3" },
    { pattern: /喝饮料/, type: "4" },
    { pattern: /玩手机/, type: "5" },
    { pattern: /睡觉/, type: "6" },
    { pattern: /其他/, type: "7" },
  ];

  for (const { pattern, type } of patterns) {
    if (pattern.test(analysisText)) {
      return {
        behaviorType: type,
        behaviorDesc: pattern.toString().replace(/\\/g, "").replace(/\//g, ""),
      };
    }
  }

  // 默认返回未识别
  return { behaviorType: "0", behaviorDesc: "未识别" };
}

/**
 * 分析图像
 * @param {string} imagePath - 图像路径
 * @returns {Promise<Object>} - 分析结果
 */
async function analyzeImage(imagePath) {
  try {
    // 使用通义千问适配器分析图像
    const analysisText = await qwenAdapter.analyzeImage(imagePath);
    
    // 提取行为类型
    const { behaviorType, behaviorDesc } = extractBehaviorType(analysisText);
    
    // 进行注意力分析
    const attentionResult = await analyzeAttention(imagePath);
    
    return {
      behaviorType,
      behaviorDesc,
      attentionData: attentionResult
    };
  } catch (error) {
    console.error('分析图像失败:', error);
    return {
      behaviorType: "7",
      behaviorDesc: "未能正确分析行为",
      attentionData: {
        current_attention: 50,
        heatmap: []
      }
    };
  }
}

module.exports = {
  analyzeImage,
  qwenAdapter
}; 