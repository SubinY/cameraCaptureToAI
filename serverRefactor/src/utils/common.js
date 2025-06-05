/**
 * 通用工具函数模块
 * 主要是重定向到文件管理器，保持与原代码的兼容性
 */

const fileManager = require('../core/file-manager');

// 导出文件管理器的函数，保持原有API兼容性
module.exports = {
  tempDir: fileManager.tempDir,
  saveImageToTemp: fileManager.saveImageToTemp,
  deleteTempFile: fileManager.deleteTempFile,
  startCleanupTask: fileManager.startCleanupTask
}; 