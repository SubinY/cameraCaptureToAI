/**
 * AI检测服务 - 协调所有AI检测功能
 */

const fileService = require('./fileService');
const emotionDetection = require('./ai/emotionDetectionService');
const postureDetection = require('./ai/postureDetectionService');
const attentionDetection = require('./ai/attentionDetectionService');
const interactionHistory = require('./ai/interactionHistoryService');

// 缓存用户状态数据
const userStates = new Map();

// 阈值常量
const THRESHOLDS = {
  EMOTION: {
    LOW_CONFIDENCE: 60, // 低于此置信度触发提醒
    LOW_CONFIDENCE_DURATION: 5, // 秒
    NEGATIVE_DURATION: 30 // 负面情绪持续秒数触发关怀
  },
  POSTURE: {
    NECK_ANGLE: { MIN: 15, MAX: 35 }, // 颈部角度正常范围
    SCREEN_DISTANCE: { MIN: 50, MAX: 80 }, // 屏幕距离正常范围（厘米）
    SIT_DURATION: 45 // 久坐提醒阈值（分钟）
  },
  ATTENTION: {
    HIGH: 80, // 高度集中
    NORMAL: 60, // 正常
    DISTRACTED: 40, // 分散
    LOW: 0 // 走神
  }
};

/**
 * 初始化用户状态
 * @param {string} userId - 用户ID
 */
function initUserState(userId) {
  if (!userStates.has(userId)) {
    userStates.set(userId, {
      emotion: {
        current: 'neutral',
        confidence: 0,
        duration: 0,
        lastUpdate: Date.now(),
        lowConfidenceStart: null,
        negativeEmotionStart: null,
        alerts: []
      },
      posture: {
        neckAngle: 25,
        screenDistance: 60,
        sitDuration: 0,
        lastUpdate: Date.now(),
        alerts: []
      },
      attention: {
        current: 60,
        timeSlot: {},
        heatmap: [],
        lastUpdate: Date.now(),
        alerts: []
      }
    });
  }
  return userStates.get(userId);
}

/**
 * 处理图像并进行多维度AI检测
 * @param {string} userId - 用户ID
 * @param {Buffer} imageBuffer - 图像数据
 * @returns {Promise<Object>} - 检测结果和警报
 */
async function processImage(userId, imageBuffer) {
  try {
    // 初始化或获取用户状态
    const userState = initUserState(userId);
    const now = Date.now();
    
    // 保存图像到临时文件
    const { tempFilePath } = await fileService.saveImage(imageBuffer, 'analysis');
    
    // 并行执行所有检测任务
    const [emotionResult, postureResult, attentionResult] = await Promise.all([
      detectEmotion(userId, tempFilePath, userState),
      detectPosture(userId, tempFilePath, userState),
      detectAttention(userId, tempFilePath, userState)
    ]);
    
    // 清理临时文件
    fileService.cleanupImageFile(tempFilePath);
    
    // 合并所有警报
    const allAlerts = [
      ...emotionResult.alerts || [],
      ...postureResult.alerts || [],
      ...attentionResult.alerts || []
    ];
    
    // 更新时间戳
    userState.emotion.lastUpdate = now;
    userState.posture.lastUpdate = now;
    userState.attention.lastUpdate = now;
    
    // 返回综合结果
    return {
      timestamp: new Date().toISOString(),
      emotion: emotionResult.data,
      posture: postureResult.data,
      attention: attentionResult.data,
      alerts: allAlerts
    };
  } catch (error) {
    console.error('AI检测处理失败:', error);
    throw error;
  }
}

/**
 * 检测情绪并更新用户状态
 * @param {string} userId - 用户ID
 * @param {string} imagePath - 图像路径
 * @param {Object} userState - 用户状态对象
 * @returns {Promise<Object>} - 情绪数据和警报
 */
async function detectEmotion(userId, imagePath, userState) {
  const prevState = userState.emotion;
  const now = Date.now();
  const alerts = [];
  
  try {
    // 调用情绪检测服务
    const rawResult = await emotionDetection.detectEmotion(imagePath);
    
    // 计算持续时间
    const timeDiff = (now - prevState.lastUpdate) / 1000; // 转换为秒
    rawResult.duration_sec = prevState.duration || 0;
    
    // 如果情绪类型相同，累加持续时间
    if (rawResult.emotion === prevState.current) {
      rawResult.duration_sec += timeDiff;
    } else {
      // 重置持续时间
      rawResult.duration_sec = timeDiff;
    }
    
    // 更新用户状态
    prevState.current = rawResult.emotion;
    prevState.confidence = rawResult.confidence;
    prevState.duration = rawResult.duration_sec;
    
    // 检查低置信度警报
    if (rawResult.confidence < THRESHOLDS.EMOTION.LOW_CONFIDENCE) {
      if (!prevState.lowConfidenceStart) {
        prevState.lowConfidenceStart = now;
      } else if ((now - prevState.lowConfidenceStart) / 1000 >= THRESHOLDS.EMOTION.LOW_CONFIDENCE_DURATION) {
        alerts.push({
          type: 'emotion_low_confidence',
          message: '情绪识别置信度低，请调整摄像头或光线',
          severity: interactionHistory.SEVERITY_LEVELS.LOW
        });
      }
    } else {
      prevState.lowConfidenceStart = null;
    }
    
    // 检查负面情绪警报
    const isNegative = ['sad', 'angry'].includes(rawResult.emotion);
    if (isNegative) {
      if (!prevState.negativeEmotionStart) {
        prevState.negativeEmotionStart = now;
      } else if ((now - prevState.negativeEmotionStart) / 1000 >= THRESHOLDS.EMOTION.NEGATIVE_DURATION) {
        // 添加高优先级警报
        const alertMsg = rawResult.emotion === 'sad' 
          ? '您看起来有些伤心，需要休息一下吗？'
          : '您看起来有些生气，深呼吸，放松一下如何？';
        
        alerts.push({
          type: 'emotion_negative',
          message: alertMsg,
          severity: interactionHistory.SEVERITY_LEVELS.MEDIUM
        });
        
        // 记录到交互历史
        interactionHistory.addInteractionEvent(
          userId,
          interactionHistory.EVENT_TYPES.ALERT,
          alertMsg,
          interactionHistory.SEVERITY_LEVELS.MEDIUM
        );
        
        // 重置负面情绪计时器，避免频繁告警
        prevState.negativeEmotionStart = now;
      }
    } else {
      prevState.negativeEmotionStart = null;
    }
    
    return {
      data: rawResult,
      alerts
    };
  } catch (error) {
    console.error('情绪检测失败:', error);
    return {
      data: {
        emotion: prevState.current,
        confidence: prevState.confidence,
        duration_sec: prevState.duration
      },
      alerts: []
    };
  }
}

/**
 * 检测体态并更新用户状态
 * @param {string} userId - 用户ID
 * @param {string} imagePath - 图像路径
 * @param {Object} userState - 用户状态对象
 * @returns {Promise<Object>} - 体态数据和警报
 */
async function detectPosture(userId, imagePath, userState) {
  const prevState = userState.posture;
  const now = Date.now();
  const alerts = [];
  
  try {
    // 计算久坐时间（分钟）
    const timeDiffMin = (now - prevState.lastUpdate) / (1000 * 60);
    const sitDuration = prevState.sitDuration + timeDiffMin;
    
    // 调用体态检测服务
    const rawResult = await postureDetection.detectPosture(imagePath, sitDuration);
    
    // 更新用户状态
    prevState.neckAngle = rawResult.neck_angle;
    prevState.screenDistance = rawResult.screen_distance;
    prevState.sitDuration = rawResult.sit_duration;
    
    // 检查颈部角度警报
    const neckAngleAbnormal = 
      rawResult.neck_angle < THRESHOLDS.POSTURE.NECK_ANGLE.MIN || 
      rawResult.neck_angle > THRESHOLDS.POSTURE.NECK_ANGLE.MAX;
      
    if (neckAngleAbnormal) {
      const alertMsg = rawResult.neck_angle < THRESHOLDS.POSTURE.NECK_ANGLE.MIN
        ? '您的头部低垂过度，请抬头挺胸'
        : '您的颈部角度不佳，请调整坐姿';
        
      alerts.push({
        type: 'posture_neck_angle',
        message: alertMsg,
        severity: interactionHistory.SEVERITY_LEVELS.MEDIUM
      });
    }
    
    // 检查屏幕距离警报
    if (rawResult.screen_distance < THRESHOLDS.POSTURE.SCREEN_DISTANCE.MIN) {
      alerts.push({
        type: 'posture_screen_distance',
        message: '您离屏幕太近了，请保持至少50厘米的距离',
        severity: interactionHistory.SEVERITY_LEVELS.MEDIUM
      });
    }
    
    // 检查久坐警报
    if (rawResult.sit_duration >= THRESHOLDS.POSTURE.SIT_DURATION) {
      const alertMsg = `您已久坐${Math.floor(rawResult.sit_duration)}分钟，建议站起来活动一下`;
      
      alerts.push({
        type: 'posture_sit_duration',
        message: alertMsg,
        severity: interactionHistory.SEVERITY_LEVELS.HIGH
      });
      
      // 记录到交互历史
      interactionHistory.addInteractionEvent(
        userId,
        interactionHistory.EVENT_TYPES.ALERT,
        alertMsg,
        interactionHistory.SEVERITY_LEVELS.HIGH
      );
      
      // 如果发出过警报且继续久坐超过10分钟，重置计时器促使用户起身
      if (rawResult.sit_duration >= THRESHOLDS.POSTURE.SIT_DURATION + 10) {
        prevState.sitDuration = 0;
      }
    }
    
    return {
      data: rawResult,
      alerts
    };
  } catch (error) {
    console.error('体态检测失败:', error);
    return {
      data: {
        neck_angle: prevState.neckAngle,
        screen_distance: prevState.screenDistance,
        sit_duration: prevState.sitDuration
      },
      alerts: []
    };
  }
}

/**
 * 检测注意力并更新用户状态
 * @param {string} userId - 用户ID
 * @param {string} imagePath - 图像路径
 * @param {Object} userState - 用户状态对象
 * @returns {Promise<Object>} - 注意力数据和警报
 */
async function detectAttention(userId, imagePath, userState) {
  const prevState = userState.attention;
  const alerts = [];
  
  try {
    // 调用注意力检测服务，传入之前的数据以累计时间槽
    const rawResult = await attentionDetection.calculateAttention(imagePath, {
      time_slot: prevState.timeSlot
    });
    
    // 更新用户状态
    prevState.current = rawResult.current_attention;
    prevState.timeSlot = rawResult.time_slot;
    prevState.heatmap = rawResult.heatmap;
    
    // 检查注意力低下警报
    if (rawResult.current_attention < THRESHOLDS.ATTENTION.DISTRACTED) {
      const isVeryLow = rawResult.current_attention < THRESHOLDS.ATTENTION.LOW + 10;
      
      const alertMsg = isVeryLow
        ? '您似乎已经走神了，需要休息一下吗？'
        : '您的注意力有些分散，需要帮助集中精神吗？';
        
      alerts.push({
        type: 'attention_low',
        message: alertMsg,
        severity: isVeryLow 
          ? interactionHistory.SEVERITY_LEVELS.MEDIUM
          : interactionHistory.SEVERITY_LEVELS.LOW
      });
      
      // 对于很低的注意力，记录到交互历史
      if (isVeryLow) {
        interactionHistory.addInteractionEvent(
          userId,
          interactionHistory.EVENT_TYPES.ALERT,
          alertMsg,
          interactionHistory.SEVERITY_LEVELS.MEDIUM
        );
      }
    }
    
    return {
      data: rawResult,
      alerts
    };
  } catch (error) {
    console.error('注意力检测失败:', error);
    return {
      data: {
        heatmap: prevState.heatmap || [],
        time_slot: prevState.timeSlot || {},
        current_attention: prevState.current || 60
      },
      alerts: []
    };
  }
}

/**
 * 生成用户状态报告
 * @param {string} userId - 用户ID
 * @returns {Promise<Object>} - 用户状态报告
 */
async function generateUserReport(userId) {
  const userState = userStates.get(userId);
  if (!userState) {
    return {
      timestamp: new Date().toISOString(),
      userId,
      message: '没有找到用户状态数据'
    };
  }
  
  // 生成日报
  const dailyReport = interactionHistory.generateDailyReport(userId);
  
  // 获取最近的交互历史
  const recentHistory = interactionHistory.getUserInteractionHistory(userId, null, 20);
  
  return {
    timestamp: new Date().toISOString(),
    userId,
    emotion: {
      current: userState.emotion.current,
      confidence: userState.emotion.confidence,
      duration: userState.emotion.duration
    },
    posture: {
      neckAngle: userState.posture.neckAngle,
      screenDistance: userState.posture.screenDistance,
      sitDuration: userState.posture.sitDuration
    },
    attention: {
      current: userState.attention.current,
      heatmap: userState.attention.heatmap,
      timeSlot: userState.attention.timeSlot
    },
    interactionHistory: recentHistory,
    dailyReport
  };
}

module.exports = {
  processImage,
  generateUserReport,
  THRESHOLDS
}; 