/**
 * WebRTC服务 - 处理WebRTC连接和信令
 */

const { analyzeImage } = require('../ai');
const { saveImageToTemp, deleteTempFile, startCleanupTask } = require('../utils/common');

// 存储活跃的WebRTC连接
const activeConnections = new Map();
// 存储行为统计数据
const behaviorStatistics = new Map();

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

/**
 * 初始化WebRTC服务
 * @param {Object} io - Socket.IO实例
 */
function initWebRTC(io) {
  io.on('connection', (socket) => {
    console.log(`客户端连接: ${socket.id}`);
    
    // 处理客户端发送的图像数据
    socket.on('image-data', async ({ userId, imageData }) => {
      try {
        console.log(`收到图像数据: ${userId}`);
        // 处理图像数据
        await handleImageData(userId, Buffer.from(imageData, 'base64'));
      } catch (error) {
        console.error(`处理图像数据失败: ${error.message}`);
      }
    });
    
    // 客户端加入WebRTC会话
    socket.on('webrtc-join', async ({ userId }) => {
      console.log(`客户端加入WebRTC会话: ${userId}`);
      
      // 添加用户连接
      addUserConnection(userId, socket);
      
      // 通知客户端准备WebRTC连接
      socket.emit('webrtc-ready');
    });
    
    // 处理WebRTC offer
    socket.on('webrtc-offer', async ({ userId, offer }) => {
      try {
        console.log(`收到WebRTC offer: ${userId}`);
        
        // 从offer中提取媒体行信息，确保应答与offer的m-lines顺序一致
        const offerSdp = offer.sdp;
        const mediaLines = offerSdp.match(/m=.*(?:\r\n|\r|\n)(?:.+(?:\r\n|\r|\n))*/g) || [];
        
        // 构建与offer匹配的应答SDP
        let answerSdp = 'v=0\r\n';
        answerSdp += 'o=- ' + Date.now() + ' 2 IN IP4 127.0.0.1\r\n';
        answerSdp += 's=-\r\n';
        answerSdp += 't=0 0\r\n';
        
        // 添加与offer相同的媒体行，但修改为应答格式
        if (mediaLines.length > 0) {
          // 添加BUNDLE组
          const mids = [];
          for (let i = 0; i < mediaLines.length; i++) {
            mids.push(i);
          }
          answerSdp += 'a=group:BUNDLE ' + mids.join(' ') + '\r\n';
          answerSdp += 'a=msid-semantic: WMS\r\n';
          
          // 添加每个媒体行
          for (let i = 0; i < mediaLines.length; i++) {
            const mediaLine = mediaLines[i];
            // 提取媒体类型
            const mediaType = mediaLine.match(/m=(\w+)/)[1];
            
            // 添加媒体行，保持与offer相同的顺序和编解码器配置
            // 从媒体行中提取编解码器配置
            const codecMatch = mediaLine.match(/m=\w+ \d+ [\w\/]+ ([\d ]+)/i);
            const codecs = codecMatch ? codecMatch[1] : '0';
            answerSdp += 'm=' + mediaType + ' 9 UDP/TLS/RTP/SAVPF ' + codecs + '\r\n';
            answerSdp += 'c=IN IP4 0.0.0.0\r\n';
            const iceUfrag = Math.random().toString(36).substring(2, 6);
            // 确保ice-pwd长度至少为22个字符，符合WebRTC标准
            const icePwd = Math.random().toString(36).substring(2, 8) + Math.random().toString(36).substring(2, 8) + 
                           Math.random().toString(36).substring(2, 8) + Math.random().toString(36).substring(2, 8);
            answerSdp += `a=ice-ufrag:${iceUfrag}\r\n`;
            answerSdp += `a=ice-pwd:${icePwd}\r\n`;
            answerSdp += 'a=fingerprint:sha-256 00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00\r\n';
            answerSdp += 'a=setup:active\r\n';
            answerSdp += 'a=mid:' + i + '\r\n';
            answerSdp += 'a=rtcp-mux\r\n';
            
            // 提取rtpmap和fmtp行，确保编解码器信息正确
            const rtpmapLines = mediaLine.match(/a=rtpmap:[\d]+ [\w\/]+(?:[\d]+)?/g) || [];
            for (const rtpmap of rtpmapLines) {
              answerSdp += rtpmap + '\r\n';
            }
            
            // 提取fmtp行
            const fmtpLines = mediaLine.match(/a=fmtp:[\d]+ [^\r\n]+/g) || [];
            for (const fmtp of fmtpLines) {
              answerSdp += fmtp + '\r\n';
            }
            
            answerSdp += 'a=sendrecv\r\n';
            answerSdp += 'a=end-of-candidates\r\n';
          }
        } else {
          // 如果无法解析媒体行，使用默认的应答格式
          answerSdp += 'a=group:BUNDLE 0\r\n';
          answerSdp += 'a=msid-semantic: WMS\r\n';
          // 使用video媒体类型和常用的VP8编解码器
          answerSdp += 'm=video 9 UDP/TLS/RTP/SAVPF 96 97 98 99 100\r\n';
          answerSdp += 'c=IN IP4 0.0.0.0\r\n';
          const iceUfrag = Math.random().toString(36).substring(2, 6);
          // 确保ice-pwd长度至少为22个字符，符合WebRTC标准
          const icePwd = Math.random().toString(36).substring(2, 8) + Math.random().toString(36).substring(2, 8) + 
                         Math.random().toString(36).substring(2, 8) + Math.random().toString(36).substring(2, 8);
          answerSdp += `a=ice-ufrag:${iceUfrag}\r\n`;
          answerSdp += `a=ice-pwd:${icePwd}\r\n`;
          answerSdp += 'a=fingerprint:sha-256 00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00\r\n';
          answerSdp += 'a=setup:active\r\n';
          answerSdp += 'a=mid:0\r\n';
          answerSdp += 'a=rtcp-mux\r\n';
          
          // 添加常用的视频编解码器
          answerSdp += 'a=rtpmap:96 VP8/90000\r\n';
          answerSdp += 'a=rtpmap:97 VP9/90000\r\n';
          answerSdp += 'a=rtpmap:98 H264/90000\r\n';
          answerSdp += 'a=rtcp-fb:96 nack\r\n';
          answerSdp += 'a=rtcp-fb:96 nack pli\r\n';
          answerSdp += 'a=rtcp-fb:96 ccm fir\r\n';
          answerSdp += 'a=rtcp-fb:97 nack\r\n';
          answerSdp += 'a=rtcp-fb:97 nack pli\r\n';
          answerSdp += 'a=rtcp-fb:97 ccm fir\r\n';
          answerSdp += 'a=rtcp-fb:98 nack\r\n';
          answerSdp += 'a=rtcp-fb:98 nack pli\r\n';
          answerSdp += 'a=rtcp-fb:98 ccm fir\r\n';
          
          answerSdp += 'a=sendrecv\r\n';
          answerSdp += 'a=end-of-candidates\r\n';
        }
        
        // 发送应答给客户端
        socket.emit('webrtc-answer', {
          userId,
          answer: { type: 'answer', sdp: answerSdp }
        });
      } catch (error) {
        console.error(`处理WebRTC offer失败: ${error.message}`);
      }
    });
    
    // 处理ICE候选
    socket.on('ice-candidate', async ({ userId, candidate }) => {
      try {
        // 在纯信令模式下，服务器只需确认收到ICE候选
        console.log(`收到ICE候选: ${userId}`);
        // 不需要实际处理ICE候选，因为服务器不再创建RTCPeerConnection
      } catch (error) {
        console.error(`处理ICE候选失败: ${error.message}`);
      }
    });
    
    // 客户端断开连接
    socket.on('disconnect', () => {
      console.log(`客户端断开连接: ${socket.id}`);
      
      // 清理连接资源
      removeUserConnection(socket.id);
    });
  });
  
  // 启动定时清理临时文件的任务
  startCleanupTask();
}

/**
 * 处理客户端发送的图像数据
 * @param {string} userId - 用户ID
 * @param {Buffer} imageData - 图像数据
 */
async function handleImageData(userId, imageData) {
  const connection = getUserConnection(userId);
  if (!connection) return;
  
  try {
    // 保存图像到临时文件
    const frameFilePath = saveImageToTemp(imageData, userId);
    
    // 分析图像
    const analysisResult = await analyzeImage(frameFilePath);
    
    // 分析完成后删除临时文件
    deleteTempFile(frameFilePath);
    console.log(analysisResult, 'analysisResult');
    
    // 更新行为统计
    updateBehaviorStatistics(userId, analysisResult.behaviorType);
    
    // 更新用户连接信息
    updateUserConnection(userId, {
      frameCount: connection.frameCount + 1,
      lastAnalysisTime: Date.now()
    });
    
    // 发送分析结果给客户端
    connection.socket.emit('analysis-result', {
      result: {
        type: analysisResult.behaviorType,
        code: BEHAVIOR_TYPES[analysisResult.behaviorType]?.code || "unknown",
        description: analysisResult.behaviorDesc || BEHAVIOR_TYPES[analysisResult.behaviorType]?.description || "未知行为",
      },
      statistics: getBehaviorStatistics()
    });
    
  } catch (error) {
    console.error(`分析图像数据失败: ${error.message}`);
  }
}

// 用户连接管理函数
function addUserConnection(userId, socket) {
  console.log(`添加用户连接: ${userId}`);
  activeConnections.set(userId, {
    socket,
    lastAnalysisTime: 0,
    frameCount: 0,
    connected: true,
    connectedAt: Date.now()
  });
  console.log(`用户连接已添加: ${userId}`);
  return getUserConnection(userId);
}

function getUserConnection(userId) {
  return activeConnections.get(userId) || null;
}

function updateUserConnection(userId, data) {
  const connection = getUserConnection(userId);
  if (connection) {
    Object.assign(connection, data);
    activeConnections.set(userId, connection);
    return true;
  }
  return false;
}

function removeUserConnection(userId) {
  if (activeConnections.has(userId)) {
    activeConnections.delete(userId);
    console.log(`用户连接已移除: ${userId}`);
    return true;
  }
  return false;
}

// 行为统计函数
function updateBehaviorStatistics(userId, behaviorType) {
  const now = Date.now();
  
  // 获取用户当前行为信息
  const userBehavior = {
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
  }
}

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

// 导出模块
module.exports = {
  initWebRTC,
  BEHAVIOR_TYPES
}; 