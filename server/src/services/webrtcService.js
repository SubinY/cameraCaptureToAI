const { analyzeImage, BEHAVIOR_TYPES } = require('./imageAnalysisService');
const fs = require('fs');
const path = require('path');

const { promisify } = require('util');

// 确保temp目录存在
const tempDir = path.join(__dirname, '../../temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// 临时文件保留的最大时间（毫秒）
const MAX_TEMP_FILE_AGE = 5 * 60 * 1000; // 5分钟

// 存储活跃的WebRTC连接
const activeConnections = new Map();

// 存储行为统计数据
const behaviorStatistics = new Map();

/**
 * 删除临时文件
 * @param {string} filePath - 文件路径
 */
function deleteTempFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`已删除临时文件: ${filePath}`);
    }
  } catch (error) {
    console.error(`删除临时文件失败: ${filePath}, 错误: ${error.message}`);
  }
}

/**
 * 清理过期的临时文件
 */
async function cleanupTempFiles() {
  try {
    const now = Date.now();
    const readdir = promisify(fs.readdir);
    const stat = promisify(fs.stat);
    
    // 读取temp目录中的所有文件
    const files = await readdir(tempDir);
    
    for (const file of files) {
      const filePath = path.join(tempDir, file);
      const fileStat = await stat(filePath);
      
      // 检查文件是否为普通文件且已超过最大保留时间
      if (fileStat.isFile() && now - fileStat.mtime.getTime() > MAX_TEMP_FILE_AGE) {
        deleteTempFile(filePath);
      }
    }
  } catch (error) {
    console.error(`清理临时文件失败: ${error.message}`);
  }
}

/**
 * 初始化WebRTC服务
 * @param {Object} io - Socket.IO实例
 */
function initWebRTCService(io) {
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
      
      // 通知客户端准备WebRTC连接
      socket.emit('webrtc-ready');
    });
    
    // 处理WebRTC offer
    socket.on('webrtc-offer', async ({ userId, offer }) => {
      try {
        console.log(`收到WebRTC offer: ${userId}`);
        
        // 在纯信令模式下，服务器只需存储连接信息，不需要创建RTCPeerConnection
        activeConnections.set(userId, {
          socket,
          lastAnalysisTime: 0,
          frameCount: 0
        });
        
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
      activeConnections.delete(socket.id);
    });
  });
  
  // 设置定时清理临时文件的任务
  setInterval(cleanupTempFiles, MAX_TEMP_FILE_AGE / 2); // 每2.5分钟清理一次
  console.log('已设置临时文件自动清理任务');

}

/**
 * 处理客户端发送的图像数据
 * @param {string} userId - 用户ID
 * @param {Buffer} imageData - 图像数据
 */
async function handleImageData(userId, imageData) {
  const connection = activeConnections.get(userId);
  if (!connection) return;
  
  try {
    // 确保temp目录存在
    const tempDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // 创建临时文件路径
    const frameFilePath = path.join(tempDir, `${userId}_${Date.now()}.jpg`);
    // 保存图像数据到文件
    fs.writeFileSync(frameFilePath, imageData);
    
    // 分析图像
    const analysisResult = await analyzeImage(imageData);
    
    // 分析完成后删除临时文件
    deleteTempFile(frameFilePath);
    console.log(analysisResult, 'analysisResult')
    // 更新行为统计
    updateBehaviorStatistics(userId, analysisResult.result.type);
    
    // 发送分析结果给客户端
    connection.socket.emit('analysis-result', {
      result: analysisResult.result,
      statistics: getBehaviorStatistics()
    });
    
  } catch (error) {
    console.error(`分析图像数据失败: ${error.message}`);
  }
}

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

// 导出模块
module.exports = {
  initWebRTCService
};