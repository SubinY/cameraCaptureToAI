/**
 * 交互历史服务 - 记录和管理用户交互事件
 */

// 存储所有用户的交互历史记录
const interactionHistory = new Map();

// 事件类型枚举
const EVENT_TYPES = {
  VOICE: 'voice',
  ALERT: 'alert',
  ACTION: 'action'
};

// 严重程度枚举
const SEVERITY_LEVELS = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3
};

/**
 * 添加新交互事件到历史记录
 * @param {string} userId - 用户ID
 * @param {string} eventType - 事件类型 (voice|alert|action)
 * @param {string} content - 事件内容
 * @param {number} severity - 严重程度 (1-3)
 * @returns {Object} - 添加的事件对象
 */
function addInteractionEvent(userId, eventType, content, severity = SEVERITY_LEVELS.LOW) {
  // 创建事件对象
  const event = {
    timestamp: new Date().toISOString(),
    event_type: Object.values(EVENT_TYPES).includes(eventType) ? eventType : EVENT_TYPES.ACTION,
    content: content,
    severity: Math.min(3, Math.max(1, severity))
  };
  
  // 获取用户历史记录，如果不存在则创建
  if (!interactionHistory.has(userId)) {
    interactionHistory.set(userId, []);
  }
  
  const userHistory = interactionHistory.get(userId);
  
  // 添加新事件
  userHistory.push(event);
  
  // 如果是语音事件且超过20条，删除最旧的语音事件
  if (eventType === EVENT_TYPES.VOICE) {
    const voiceEvents = userHistory.filter(e => e.event_type === EVENT_TYPES.VOICE);
    if (voiceEvents.length > 20) {
      // 找到最旧的语音事件索引
      const oldestVoiceIndex = userHistory.findIndex(e => e.event_type === EVENT_TYPES.VOICE);
      if (oldestVoiceIndex >= 0) {
        userHistory.splice(oldestVoiceIndex, 1);
      }
    }
  }
  
  // 更新用户历史记录
  interactionHistory.set(userId, userHistory);
  
  return event;
}

/**
 * 获取用户的交互历史记录
 * @param {string} userId - 用户ID
 * @param {string} [eventType] - 可选的事件类型过滤器
 * @param {number} [limit] - 可选的结果数量限制
 * @returns {Array} - 交互历史记录数组
 */
function getUserInteractionHistory(userId, eventType, limit) {
  // 获取用户历史记录
  const userHistory = interactionHistory.get(userId) || [];
  
  // 过滤事件类型（如果提供）
  let filteredHistory = userHistory;
  if (eventType && Object.values(EVENT_TYPES).includes(eventType)) {
    filteredHistory = userHistory.filter(event => event.event_type === eventType);
  }
  
  // 按时间逆序排序（最新的在前）
  filteredHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  // 限制结果数量（如果提供）
  if (limit && limit > 0) {
    filteredHistory = filteredHistory.slice(0, limit);
  }
  
  return filteredHistory;
}

/**
 * 生成用户交互日报
 * @param {string} userId - 用户ID
 * @param {Date} date - 日期（默认为今天）
 * @returns {string} - Markdown格式的日报
 */
function generateDailyReport(userId, date = new Date()) {
  // 获取指定日期的开始和结束时间戳
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  // 获取用户历史记录
  const userHistory = interactionHistory.get(userId) || [];
  
  // 过滤出指定日期的事件
  const dayEvents = userHistory.filter(event => {
    const eventDate = new Date(event.timestamp);
    return eventDate >= startOfDay && eventDate <= endOfDay;
  });
  
  // 如果没有事件，返回空报告
  if (dayEvents.length === 0) {
    return `# 交互日报 - ${startOfDay.toLocaleDateString()}\n\n今天没有记录交互活动。`;
  }
  
  // 按类型分组事件
  const voiceEvents = dayEvents.filter(e => e.event_type === EVENT_TYPES.VOICE);
  const alertEvents = dayEvents.filter(e => e.event_type === EVENT_TYPES.ALERT);
  const actionEvents = dayEvents.filter(e => e.event_type === EVENT_TYPES.ACTION);
  
  // 生成日报
  let report = `# 交互日报 - ${startOfDay.toLocaleDateString()}\n\n`;
  
  // 添加警报摘要
  if (alertEvents.length > 0) {
    report += `## 警报摘要 (${alertEvents.length})\n\n`;
    
    // 按严重性分类
    const highSeverity = alertEvents.filter(e => e.severity === SEVERITY_LEVELS.HIGH);
    const mediumSeverity = alertEvents.filter(e => e.severity === SEVERITY_LEVELS.MEDIUM);
    
    if (highSeverity.length > 0) {
      report += `⚠️ **高严重性警报:** ${highSeverity.length}条\n\n`;
    }
    
    if (mediumSeverity.length > 0) {
      report += `⚠️ **中等严重性警报:** ${mediumSeverity.length}条\n\n`;
    }
    
    // 列出前5条警报
    report += `### 最近警报\n\n`;
    alertEvents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    for (let i = 0; i < Math.min(5, alertEvents.length); i++) {
      const alert = alertEvents[i];
      const time = new Date(alert.timestamp).toLocaleTimeString();
      report += `- [${time}] ${alert.content} ${'⚠️'.repeat(alert.severity)}\n`;
    }
    report += '\n';
  }
  
  // 添加语音互动摘要
  if (voiceEvents.length > 0) {
    report += `## 语音互动 (${voiceEvents.length})\n\n`;
    
    // 列出前5条语音互动
    voiceEvents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    for (let i = 0; i < Math.min(5, voiceEvents.length); i++) {
      const voice = voiceEvents[i];
      const time = new Date(voice.timestamp).toLocaleTimeString();
      report += `- [${time}] ${voice.content}\n`;
    }
    report += '\n';
  }
  
  // 添加用户操作摘要
  if (actionEvents.length > 0) {
    report += `## 用户操作 (${actionEvents.length})\n\n`;
    
    // 按小时统计操作数量
    const hourlyActions = {};
    actionEvents.forEach(action => {
      const hour = new Date(action.timestamp).getHours();
      hourlyActions[hour] = (hourlyActions[hour] || 0) + 1;
    });
    
    // 找出活跃时段
    let peakHour = 0;
    let peakCount = 0;
    for (const [hour, count] of Object.entries(hourlyActions)) {
      if (count > peakCount) {
        peakHour = parseInt(hour);
        peakCount = count;
      }
    }
    
    report += `最活跃时段: ${peakHour}:00 - ${peakHour + 1}:00 (${peakCount}次操作)\n\n`;
  }
  
  return report;
}

module.exports = {
  EVENT_TYPES,
  SEVERITY_LEVELS,
  addInteractionEvent,
  getUserInteractionHistory,
  generateDailyReport
}; 