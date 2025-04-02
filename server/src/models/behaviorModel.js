/**
 * 行为模型 - 定义行为类型和相关操作
 */

// 行为类型映射
const BEHAVIOR_TYPES = {
  1: { code: "work", description: "认真专注工作" },
  2: { code: "eating", description: "吃东西" },
  3: { code: "drinking_water", description: "用杯子喝水" },
  4: { code: "drinking_beverage", description: "喝饮料" },
  5: { code: "phone", description: "玩手机" },
  6: { code: "sleeping", description: "睡觉" },
  7: { code: "other", description: "其他" },
};

// 存储行为统计数据
const behaviorStatistics = new Map();

// 存储用户当前行为信息
const userBehaviors = new Map();

/**
 * 更新行为统计
 * @param {string} userId - 用户ID
 * @param {number} behaviorType - 行为类型
 */
function updateBehaviorStatistics(userId, behaviorType) {
  const now = Date.now();
  
  // 获取用户当前行为信息
  const userBehavior = userBehaviors.get(userId) || {
    currentBehaviorType: null,
    currentBehaviorStartTime: null
  };
  
  // 如果行为类型改变，记录上一个行为的持续时间
  if (userBehavior.currentBehaviorType !== null && userBehavior.currentBehaviorType !== behaviorType) {
    const duration = now - userBehavior.currentBehaviorStartTime;
    
    // 获取或创建统计数据
    let stats = behaviorStatistics.get(userBehavior.currentBehaviorType) || { count: 0, duration: 0 };
    
    // 更新统计数据
    stats.duration += duration;
    behaviorStatistics.set(userBehavior.currentBehaviorType, stats);
  }
  
  // 如果是新的行为类型，增加计数
  if (userBehavior.currentBehaviorType !== behaviorType) {
    // 获取或创建统计数据
    let stats = behaviorStatistics.get(behaviorType) || { count: 0, duration: 0 };
    
    // 更新计数
    stats.count += 1;
    behaviorStatistics.set(behaviorType, stats);
    
    // 更新当前行为
    userBehavior.currentBehaviorType = behaviorType;
    userBehavior.currentBehaviorStartTime = now;
    
    // 保存用户行为信息
    userBehaviors.set(userId, userBehavior);
  }
}

/**
 * 获取行为统计数据
 * @returns {Object} - 行为统计数据
 */
function getBehaviorStatistics() {
  const statistics = {};
  
  // 转换统计数据格式
  for (const [behaviorType, data] of behaviorStatistics.entries()) {
    const behaviorCode = BEHAVIOR_TYPES[behaviorType]?.code || 'unknown';
    statistics[behaviorCode] = {
      count: data.count,
      duration: data.duration
    };
  }
  
  return statistics;
}

/**
 * 从分析文本中提取行为类型和描述
 * @param {string} analysisText - 分析结果文本
 * @returns {Object} - 包含行为类型和描述的对象
 */
function extractBehaviorType(analysisText) {
  // 尝试匹配行为类型数字和描述（1-7）
  const pattern =
    /(\d+)\s*[.、:]?\s*(认真专注工作|吃东西|用杯子喝水|喝饮料|玩手机|睡觉|其他)/;
  const match = analysisText.match(pattern);

  if (match) {
    const behaviorType = match[1];
    const behaviorDesc = match[2];
    return { behaviorType, behaviorDesc };
  }

  // 如果第一种模式匹配失败，尝试替代模式
  const patterns = [
    { pattern: /认真专注工作/, type: "1" },
    { pattern: /吃东西/, type: "2" },
    { pattern: /用杯子喝水/, type: "3" },
    { pattern: /喝饮料/, type: "4" },
    { pattern: /玩手机/, type: "5" },
    { pattern: /睡觉/, type: "6" },
    { pattern: /其他/, type: "7" },
  ];

  for (const { pattern, type } of patterns) {
    if (pattern.test(analysisText)) {
      return {
        behaviorType: type,
        behaviorDesc: pattern.toString().replace(/\\/g, "").replace(/\//g, ""),
      };
    }
  }

  // 默认返回未识别
  return { behaviorType: "0", behaviorDesc: "未识别" };
}

module.exports = {
  BEHAVIOR_TYPES,
  updateBehaviorStatistics,
  getBehaviorStatistics,
  extractBehaviorType
};