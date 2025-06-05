/**
 * 注意力分析器
 */

const fs = require('fs');
const qwenAdapter = require('../adapters/qwen');

// 屏幕区域划分（9个区域，用于热力图）
const SCREEN_REGIONS = [
  {x: 0.17, y: 0.17}, {x: 0.5, y: 0.17}, {x: 0.83, y: 0.17},
  {x: 0.17, y: 0.5}, {x: 0.5, y: 0.5}, {x: 0.83, y: 0.5},
  {x: 0.17, y: 0.83}, {x: 0.5, y: 0.83}, {x: 0.83, y: 0.83}
];

/**
 * 分析用户注意力状态
 * @param {string} imagePath - 图像路径
 * @param {Object} previousData - 之前的注意力数据
 * @returns {Promise<Object>} - 注意力分析结果
 */
async function analyzeAttention(imagePath, previousData = {}) {
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
              text: '请分析这张图片中人物的注意力状态。评估他们的注意力集中程度（0-100分），并判断他们可能注视的屏幕区域（上/中/下，左/中/右）。请以JSON格式回复：{"attention_score": 分数, "gaze_region": "区域描述"}',
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

    // 尝试提取JSON格式的注意力数据
    let attentionData;
    try {
      // 尝试直接解析可能的JSON响应
      attentionData = JSON.parse(responseText);
    } catch (e) {
      // 如果直接解析失败，尝试从文本中提取JSON部分
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          attentionData = JSON.parse(jsonMatch[0]);
        } catch (e2) {
          // 如果仍然无法解析，使用正则提取关键信息
          const attentionMatch = responseText.match(/attention_score[^\d]*(\d+)/i);
          const gazeMatch = responseText.match(/gaze_region[^"]*"([^"]*)"/i);
          
          attentionData = {
            attention_score: attentionMatch ? parseInt(attentionMatch[1]) : 60,
            gaze_region: gazeMatch ? gazeMatch[1] : "中央"
          };
        }
      } else {
        // 正则提取关键信息
        const attentionMatch = responseText.match(/attention_score[^\d]*(\d+)/i);
        const gazeMatch = responseText.match(/gaze_region[^"]*"([^"]*)"/i);
        
        attentionData = {
          attention_score: attentionMatch ? parseInt(attentionMatch[1]) : 60,
          gaze_region: gazeMatch ? gazeMatch[1] : "中央"
        };
      }
    }

    // 根据注视区域生成热力图
    const heatmapPoints = generateHeatmap(attentionData.gaze_region || "中央", attentionData.attention_score || 60);
    
    // 处理时间槽数据
    const timeSlot = processTimeSlot(previousData.time_slot || {}, attentionData.attention_score || 60);

    return {
      heatmap: heatmapPoints,
      time_slot: timeSlot,
      current_attention: attentionData.attention_score || 60
    };
  } catch (error) {
    console.error('注意力分析失败:', error);
    return {
      heatmap: generateHeatmap("中央", 60),
      time_slot: previousData.time_slot || { "0-5min": 60 },
      current_attention: 60
    };
  }
}

/**
 * 根据注视区域和注意力分数生成热力图点
 * @param {string} gazeRegion - 注视区域描述
 * @param {number} attentionScore - 注意力分数
 * @returns {Array} - 热力图点数组
 */
function generateHeatmap(gazeRegion, attentionScore) {
  const heatmapPoints = [];
  
  // 根据注视区域确定中心点索引
  let centerIndex = 4; // 默认中央
  
  if (gazeRegion.includes("上")) {
    if (gazeRegion.includes("左")) centerIndex = 0;
    else if (gazeRegion.includes("右")) centerIndex = 2;
    else centerIndex = 1;
  } else if (gazeRegion.includes("下")) {
    if (gazeRegion.includes("左")) centerIndex = 6;
    else if (gazeRegion.includes("右")) centerIndex = 8;
    else centerIndex = 7;
  } else {
    if (gazeRegion.includes("左")) centerIndex = 3;
    else if (gazeRegion.includes("右")) centerIndex = 5;
    else centerIndex = 4;
  }
  
  // 生成热力图点
  const centerPoint = SCREEN_REGIONS[centerIndex];
  const intensity = attentionScore / 100;
  
  // 添加中心点（高强度）
  heatmapPoints.push([centerPoint.x, centerPoint.y, intensity]);
  
  // 添加周围点（随机分布，强度递减）
  for (let i = 0; i < 30; i++) {
    const distance = Math.random() * 0.3;
    const angle = Math.random() * Math.PI * 2;
    const x = Math.max(0, Math.min(1, centerPoint.x + Math.cos(angle) * distance));
    const y = Math.max(0, Math.min(1, centerPoint.y + Math.sin(angle) * distance));
    const pointIntensity = intensity * (1 - distance/0.3);
    
    heatmapPoints.push([x, y, pointIntensity]);
  }
  
  return heatmapPoints;
}

/**
 * 处理注意力时间槽数据
 * @param {Object} previousTimeSlot - 之前的时间槽数据
 * @param {number} currentAttention - 当前注意力分数
 * @returns {Object} - 更新后的时间槽数据
 */
function processTimeSlot(previousTimeSlot, currentAttention) {
  const now = new Date();
  const minutes = now.getMinutes() % 60;
  const slotIndex = Math.floor(minutes / 5);
  const slotKey = `${slotIndex*5}-${slotIndex*5+5}min`;
  
  // 复制之前的时间槽数据
  const newTimeSlot = {...previousTimeSlot};
  
  // 如果当前时间槽不存在，初始化它
  if (!newTimeSlot[slotKey]) {
    newTimeSlot[slotKey] = currentAttention;
  } else {
    // 否则，更新为平均值
    newTimeSlot[slotKey] = (newTimeSlot[slotKey] + currentAttention) / 2;
  }
  
  return newTimeSlot;
}

module.exports = {
  analyzeAttention
}; 