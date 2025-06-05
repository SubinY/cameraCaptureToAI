/**
 * AI模型基础适配器 - 所有AI模型适配器的基类
 */

const axios = require('axios');

/**
 * 基础AI模型适配器
 */
class BaseAdapter {
  /**
   * 构造函数
   * @param {Object} config - 配置参数
   */
  constructor(config = {}) {
    this.config = {
      baseUrl: process.env.AI_BASE_URL || '',
      apiKey: process.env.AI_API_KEY || '',
      ...config
    };
  }

  /**
   * 发送请求到AI模型API
   * @param {string} endpoint - API端点
   * @param {Object} data - 请求数据
   * @param {Object} options - 请求选项
   * @returns {Promise<Object>} - API响应
   */
  async sendRequest(endpoint, data, options = {}) {
    try {
      const url = this.config.baseUrl + endpoint;
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
        ...options.headers
      };

      const response = await axios.post(url, data, { headers, ...options });
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * 处理错误
   * @param {Error} error - 错误对象
   */
  handleError(error) {
    console.error(`AI模型API调用失败: ${error.message}`);
    if (error.response) {
      // 服务器响应了错误状态码
      console.error('错误状态码:', error.response.status);
      console.error('错误响应头:', JSON.stringify(error.response.headers));
      console.error('错误响应数据:', JSON.stringify(error.response.data));
    } else if (error.request) {
      // 请求已发送但没有收到响应
      console.error('未收到响应:', error.request);
    }
  }

  /**
   * 分析图像（由子类实现）
   * @param {string} imagePath - 图像路径
   * @returns {Promise<string>} - 分析结果
   */
  async analyzeImage(imagePath) {
    throw new Error('子类必须实现analyzeImage方法');
  }
}

module.exports = BaseAdapter; 