/**
 * 情绪检测服务 - 使用通义千问VL模型检测人脸情绪
 */

const fs = require('fs');
const qwenAdapter = require('./qwenAdapter');

/**
 * 检测图像中的情绪状态
 * @param {string} imagePath - 图像路径
 * @returns {Promise<Object>} - 情绪分析结果
 */
async function detectEmotion(imagePath) {
  try {
    // 读取图像为base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');

    // 准备请求数据
    const requestData = {
      model: 'qwen-vl-plus',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: '请分析这张图片中人物的表情和情绪。从以下四种情绪中选择一种最匹配的：happy（开心）, neutral（平静）, sad（悲伤）, angry（愤怒）。请以JSON格式回复，包含情绪类型（emotion）和置信度（confidence，0-100的数字）。例如：{"emotion": "happy", "confidence": 85}',
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

    // 发送自定义请求到API
    const responseText = await qwenAdapter.sendCustomRequest(requestData);

    // 尝试提取JSON格式的情绪数据
    let emotionData;
    try {
      // 尝试直接解析可能的JSON响应
      emotionData = JSON.parse(responseText);
    } catch (e) {
      // 如果直接解析失败，尝试从文本中提取JSON部分
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          emotionData = JSON.parse(jsonMatch[0]);
        } catch (e2) {
          // 如果仍然无法解析，使用正则提取关键信息
          const emotionMatch = responseText.match(/(happy|neutral|sad|angry)/i);
          const confidenceMatch = responseText.match(/confidence[^\d]*(\d+)/i);
          
          emotionData = {
            emotion: emotionMatch ? emotionMatch[1].toLowerCase() : 'neutral',
            confidence: confidenceMatch ? parseInt(confidenceMatch[1]) : 50
          };
        }
      } else {
        // 正则提取关键信息
        const emotionMatch = responseText.match(/(happy|neutral|sad|angry)/i);
        const confidenceMatch = responseText.match(/confidence[^\d]*(\d+)/i);
        
        emotionData = {
          emotion: emotionMatch ? emotionMatch[1].toLowerCase() : 'neutral',
          confidence: confidenceMatch ? parseInt(confidenceMatch[1]) : 50
        };
      }
    }

    // 确保返回格式正确
    return {
      emotion: emotionData.emotion || 'neutral',
      confidence: emotionData.confidence || 50,
      duration_sec: 0 // 初始持续时间，需要外部累计
    };
  } catch (error) {
    console.error('情绪检测失败:', error);
    return {
      emotion: 'neutral',
      confidence: 50,
      duration_sec: 0
    };
  }
}

module.exports = {
  detectEmotion
}; 