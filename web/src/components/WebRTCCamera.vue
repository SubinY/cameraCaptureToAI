<template>
  <div class="camera-container">
    <video ref="videoRef" autoplay playsinline></video>
    <canvas ref="canvasRef" style="display: none;"></canvas>
    <div class="status-overlay" v-if="connectionStatus">
      {{ connectionStatus }}
    </div>
    <div class="controls">
      <a-button type="primary" @click="toggleCapture" :disabled="!isConnected">
        {{ isCapturing ? '停止捕获' : '开始捕获' }}
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, defineEmits } from 'vue'
import { io, Socket } from 'socket.io-client'
import { message } from 'ant-design-vue'

const emit = defineEmits(['analysis-result'])

const videoRef = ref<HTMLVideoElement>()
const canvasRef = ref<HTMLCanvasElement>()
const connectionStatus = ref<string>('')
const isConnected = ref(false)
const isCapturing = ref(false)
let socket: Socket
let peerConnection: RTCPeerConnection | null = null
let captureInterval: number | null = null

const initWebRTC = async () => {
  try {
    // 获取本地媒体流
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    })

    if (videoRef.value) {
      videoRef.value.srcObject = stream
    }

    // 初始化WebSocket连接
    socket = io('http://localhost:3000')

    // 创建RTCPeerConnection
    peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    })

    // 添加本地流
    stream.getTracks().forEach(track => {
      if (peerConnection) {
        peerConnection.addTrack(track, stream)
      }
    })

    // 处理ICE候选
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          userId: socket.id,
          candidate: event.candidate
        })
      }
    }

    // 连接状态变化
    peerConnection.onconnectionstatechange = () => {
      const newStatus = `连接状态: ${peerConnection?.connectionState}`
      if (newStatus !== connectionStatus.value) {
        connectionStatus.value = newStatus
      }
    }

    // WebSocket事件处理
    socket.on('webrtc-ready', async () => {
      try {
        if (peerConnection) {
          const offer = await peerConnection.createOffer()
          await peerConnection.setLocalDescription(offer)
          socket.emit('webrtc-offer', {
            userId: socket.id,
            offer
          })
        }
      } catch (error) {
        console.error('创建offer失败:', error)
        message.error('视频连接失败')
      }
    })
    
    socket.on('connect', () => {
      if (connectionStatus.value !== '已连接到服务器') {
        connectionStatus.value = '已连接到服务器'
      }
      if (!isConnected.value) {
        isConnected.value = true
      }
    })
    
    socket.on('disconnect', () => {
      if (connectionStatus.value !== '已断开连接') {
        connectionStatus.value = '已断开连接'
      }
      if (isConnected.value) {
        isConnected.value = false
      }
      stopCapture()
    })

    socket.on('webrtc-answer', async ({ answer }) => {
      try {
        if (peerConnection) {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
          if (connectionStatus.value !== '已建立WebRTC连接') {
            connectionStatus.value = '已建立WebRTC连接'
          }
        }
      } catch (error) {
        console.error('设置远程描述失败:', error)
        message.error('视频连接失败')
      }
    })

    socket.on('ice-candidate', async ({ candidate }) => {
      try {
        if (peerConnection) {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
        }
      } catch (error) {
        console.error('添加ICE候选失败:', error)
      }
    })

    socket.on('analysis-result', (data) => {
      // 防止不必要的更新，只在数据真正变化时才触发事件
      if (data && (data.result?.description || data.statistics)) {
        emit('analysis-result', data)
      }
    })

    // 加入WebRTC会话
    socket.emit('webrtc-join', { userId: socket.id })

  } catch (error) {
    console.error('初始化WebRTC失败:', error)
    message.error('摄像头启动失败')
  }
}

// 捕获视频帧并发送到服务器
const captureFrame = () => {
  if (!videoRef.value || !canvasRef.value || !socket) return
  
  const video = videoRef.value
  const canvas = canvasRef.value
  const context = canvas.getContext('2d')
  
  if (!context) return
  
  // 只在第一次设置canvas尺寸
  if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
  }
  
  // 在canvas上绘制当前视频帧
  context.drawImage(video, 0, 0, canvas.width, canvas.height)
  
  // 将canvas内容转换为base64编码的图像数据
  const imageData = canvas.toDataURL('image/jpeg', 0.8).split(',')[1]
  
  // 发送图像数据到服务器
  socket.emit('image-data', {
    userId: socket.id,
    imageData
  })
}

// 开始定期捕获
const startCapture = () => {
  if (captureInterval) return
  
  isCapturing.value = true
  // 每3秒捕获一次视频帧
  captureInterval = window.setInterval(captureFrame, 3000)
  message.success('已开始捕获视频')
}

// 停止捕获
const stopCapture = () => {
  if (captureInterval) {
    clearInterval(captureInterval)
    captureInterval = null
    isCapturing.value = false
    message.info('已停止捕获视频')
  }
}

// 切换捕获状态
const toggleCapture = () => {
  if (isCapturing.value) {
    stopCapture()
  } else {
    startCapture()
  }
}

onMounted(() => {
  initWebRTC()
})

onUnmounted(() => {
  // 清理资源
  stopCapture()
  if (peerConnection) {
    peerConnection.close()
    peerConnection = null
  }
  if (socket) {
    socket.removeAllListeners()
    socket.disconnect()
    socket = null
  }
  if (videoRef.value?.srcObject) {
    const stream = videoRef.value.srcObject as MediaStream
    stream.getTracks().forEach(track => track.stop())
    videoRef.value.srcObject = null
  }
})
</script>

<style scoped>
.camera-container {
  position: relative;
  width: 640px;
  height: 480px;
  background: #000;
  margin: 0 auto;
}

video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-overlay {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
}

.controls {
  position: absolute;
  bottom: 10px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  padding: 10px;
}
</style>