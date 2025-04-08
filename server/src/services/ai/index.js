/**
 * AI服务索引 - 导出所有AI服务
 */

const qwenAdapter = require('./qwenAdapter');
const emotionDetectionService = require('./emotionDetectionService');
const postureDetectionService = require('./postureDetectionService');
const attentionDetectionService = require('./attentionDetectionService');
const interactionHistoryService = require('./interactionHistoryService');

module.exports = {
  qwen: qwenAdapter,
  emotionDetection: emotionDetectionService,
  postureDetection: postureDetectionService,
  attentionDetection: attentionDetectionService,
  interactionHistory: interactionHistoryService
};