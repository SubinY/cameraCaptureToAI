/**
 * 通义千问VL模型适配器 - 处理与通义千问VL模型的交互
 */

const fs = require('fs');
const BaseAdapter = require('./base');

/**
 * 通义千问VL模型适配器类
 * @extends BaseAdapter
 */
class QwenAdapter extends BaseAdapter {
  /**
   * 构造函数
   */
  constructor() {
    super({
      baseUrl: process.env.QWEN_BASE_URL,
      apiKey: process.env.QWEN_API_KEY
    });
    this.model = 'qwen-vl-plus';
  }

  /**
   * 使用通义千问VL模型分析图像
   * @param {string} imagePath - 图像路径
   * @returns {Promise<string>} - 分析结果文本
   */
  async analyzeImage(imagePath) {
    try {
      // 读取图像为base64
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');

      // 准备请求数据
      const requestData = {
        model: this.model,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: '请分析这张图片中的人物行为，并从以下7种行为中选择一种最匹配的：1.认真专注工作 2.吃东西 3.用杯子喝水 4.喝饮料 5.玩手机 6.睡觉 7.其他。请给出你的选择（只需回复数字和行为描述即可）。',
              },
              {
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${base64Image}` },
              },
            ],
          },
        ],
        max_tokens: 1000,
      };

      // 发送请求到API
      const responseData = await this.sendRequest('/chat/completions', requestData);

      // 提取分析结果
      if (
        responseData &&
        responseData.choices &&
        responseData.choices.length > 0 &&
        responseData.choices[0].message &&
        responseData.choices[0].message.content
      ) {
        // 获取文本内容
        return responseData.choices[0].message.content;
      } else if (
        responseData.output &&
        responseData.output.choices &&
        responseData.output.choices.length > 0
      ) {
        return responseData.output.choices[0].message.content;
      } else {
        throw new Error('无法从API响应中提取分析结果');
      }
    } catch (error) {
      console.error('通义千问VL模型分析失败:', error);
      throw error;
    }
  }

  /**
   * 发送自定义请求到通义千问VL模型
   * @param {Object} requestData - 完整的请求数据
   * @returns {Promise<string>} - 模型返回的原始文本
   */
  async sendCustomRequest(requestData) {
    try {
      // 确保请求数据使用正确的模型
      requestData.model = requestData.model || this.model;
      
      // 发送请求到API
      const responseData = await this.sendRequest('/chat/completions', requestData);

      // 提取分析结果
      if (
        responseData &&
        responseData.choices &&
        responseData.choices.length > 0 &&
        responseData.choices[0].message &&
        responseData.choices[0].message.content
      ) {
        // 获取文本内容
        return responseData.choices[0].message.content;
      } else if (
        responseData.output &&
        responseData.output.choices &&
        responseData.output.choices.length > 0
      ) {
        return responseData.output.choices[0].message.content;
      } else {
        throw new Error('无法从API响应中提取结果');
      }
    } catch (error) {
      console.error('通义千问VL自定义请求失败:', error);
      throw error;
    }
  }
}

// 创建单例实例
const qwenAdapter = new QwenAdapter();

module.exports = qwenAdapter; 