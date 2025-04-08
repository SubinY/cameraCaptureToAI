/**
 * 体态监测服务 - 使用通义千问VL模型检测用户坐姿
 */

const fs = require('fs');
const qwenAdapter = require('./qwenAdapter');

/**
 * 检测图像中的用户坐姿和姿态
 * @param {string} imagePath - 图像路径
 * @param {number} sitDuration - 当前久坐时间（分钟）
 * @returns {Promise<Object>} - 体态分析结果
 */
async function detectPosture(imagePath, sitDuration = 0) {
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
              text: '请分析这张图片中人物的坐姿。估计他们的颈部角度（0-90度之间，0度表示头部垂直向下，90度表示直视前方），估计人物与屏幕的距离（厘米）。请以JSON格式回复：{"neck_angle": 角度数值, "screen_distance": 距离数值}',
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

    // 尝试提取JSON格式的体态数据
    let postureData;
    try {
      // 尝试直接解析可能的JSON响应
      postureData = JSON.parse(responseText);
    } catch (e) {
      // 如果直接解析失败，尝试从文本中提取JSON部分
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          postureData = JSON.parse(jsonMatch[0]);
        } catch (e2) {
          // 如果仍然无法解析，使用正则提取关键信息
          const neckAngleMatch = responseText.match(/neck_angle[^\d]*(\d+)/i);
          const distanceMatch = responseText.match(/screen_distance[^\d]*(\d+)/i);
          
          postureData = {
            neck_angle: neckAngleMatch ? parseInt(neckAngleMatch[1]) : 25,
            screen_distance: distanceMatch ? parseInt(distanceMatch[1]) : 60
          };
        }
      } else {
        // 正则提取关键信息
        const neckAngleMatch = responseText.match(/neck_angle[^\d]*(\d+)/i);
        const distanceMatch = responseText.match(/screen_distance[^\d]*(\d+)/i);
        
        postureData = {
          neck_angle: neckAngleMatch ? parseInt(neckAngleMatch[1]) : 25,
          screen_distance: distanceMatch ? parseInt(distanceMatch[1]) : 60
        };
      }
    }

    // 确保返回格式正确，保持传入的久坐时间
    return {
      neck_angle: Math.min(90, Math.max(0, postureData.neck_angle || 25)),
      screen_distance: Math.min(150, Math.max(30, postureData.screen_distance || 60)),
      sit_duration: sitDuration // 保持传入的久坐时间
    };
  } catch (error) {
    console.error('体态检测失败:', error);
    return {
      neck_angle: 25, // 默认值
      screen_distance: 60, // 默认值
      sit_duration: sitDuration
    };
  }
}

module.exports = {
  detectPosture
}; 