// 情绪分析模拟数据
export const mockEmotionData = {
  emotion: "happy",
  confidence: 78,
  duration_sec: 149.5
};

// 体态监测模拟数据
export const mockPostureData = {
  neck_angle: 25,
  screen_distance: 65,
  sit_duration: 24.5
};

// 注意力热力图点生成
const generateHeatmapPoints = (count: number, focus: number) => {
  const points = [];
  for (let i = 0; i < count; i++) {
    const x = Math.random();
    const y = Math.random();
    // 使更多点集中在中心区域
    const distFromCenter = Math.sqrt(Math.pow(x - 0.5, 2) + Math.pow(y - 0.5, 2));
    const intensity = Math.max(0, focus/100 * (1 - distFromCenter * 1.5));
    points.push([x, y, intensity]);
  }
  return points;
};

// 注意力时间槽生成
const generateTimeSlots = () => {
  const slots: Record<string, number> = {};
  for (let i = 0; i < 12; i++) {
    const startMin = i * 5;
    const endMin = startMin + 5;
    const slotKey = `${startMin}-${endMin}min`;
    // 生成波动的注意力值
    slots[slotKey] = Math.floor(35 + Math.random() * 50);
  }
  return slots;
};

// 注意力分析模拟数据
export const mockAttentionData = {
  heatmap: generateHeatmapPoints(50, 38),
  time_slot: generateTimeSlots(),
  current_attention: 38
};

// 警报模拟数据
export const mockAlerts = [
  {
    type: "attention_low",
    message: "您的注意力有些分散，需要帮助集中精神吗？",
    severity: 1
  },
  {
    type: "posture_screen_distance",
    message: "您离屏幕太近了，请保持至少50厘米的距离",
    severity: 2
  }
];

// 完整的AI检测结果模拟数据
export const mockDetectionResult = {
  timestamp: new Date().toISOString(),
  emotion: mockEmotionData,
  posture: mockPostureData,
  attention: mockAttentionData,
  alerts: mockAlerts
};

// 动态生成模拟数据（带随机变化）
export function generateDynamicMockData() {
  // 随机情绪
  const emotions = ["happy", "neutral", "sad", "angry"];
  const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
  const randomConfidence = 50 + Math.floor(Math.random() * 50);
  
  // 随机体态
  const randomNeckAngle = 10 + Math.floor(Math.random() * 40);
  const randomDistance = 40 + Math.floor(Math.random() * 60);
  
  // 随机注意力
  const randomAttention = 20 + Math.floor(Math.random() * 70);
  
  return {
    timestamp: new Date().toISOString(),
    emotion: {
      emotion: randomEmotion,
      confidence: randomConfidence,
      duration_sec: mockEmotionData.duration_sec + Math.random() * 5
    },
    posture: {
      neck_angle: randomNeckAngle,
      screen_distance: randomDistance,
      sit_duration: mockPostureData.sit_duration + Math.random() * 0.5
    },
    attention: {
      heatmap: generateHeatmapPoints(50, randomAttention),
      time_slot: generateTimeSlots(),
      current_attention: randomAttention
    },
    alerts: randomAttention < 40 ? [...mockAlerts] : 
            randomNeckAngle < 15 ? [mockAlerts[1]] : 
            []
  };
} 