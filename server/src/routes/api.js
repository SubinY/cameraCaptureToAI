/**
 * API路由
 * 提供OSS配置、文件上传和图像分析等功能
 */

const Router = require('koa-router');
const multer = require('@koa/multer');
const path = require('path');
const fs = require('fs');
const { analyzeImage } = require('../services/imageAnalysisService');
const { uploadToOSS } = require('../utils/ossClient');

// 创建路由
const router = new Router({ prefix: '/api' });

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

/**
 * 获取OSS配置
 */
router.get('/oss-config', (ctx) => {
  // 检查环境变量是否设置了禁用OSS
  const disableOSS = process.env.DISABLE_OSS === 'true';
  
  ctx.body = {
    enabled: !disableOSS && !!process.env.OSS_ACCESS_KEY_ID,
    localStoragePath: './public/uploads'
  };
});

/**
 * 上传文件到OSS
 */
router.post('/upload', upload.single('file'), async (ctx) => {
  try {
    const file = ctx.request.file;
    if (!file) {
      ctx.status = 400;
      ctx.body = { error: '未提供文件' };
      return;
    }
    
    // 检查是否禁用OSS
    const disableOSS = process.env.DISABLE_OSS === 'true';
    
    let fileUrl;
    if (!disableOSS && process.env.OSS_ACCESS_KEY_ID) {
      // 上传到OSS
      const ossKey = `uploads/${path.basename(file.path)}`;
      fileUrl = await uploadToOSS(file.path, ossKey);
    } else {
      // 使用本地存储
      const publicDir = path.join(__dirname, '../../public');
      const uploadsDir = path.join(publicDir, 'uploads');
      
      // 确保目录存在
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      // 复制文件到public/uploads目录
      const destPath = path.join(uploadsDir, path.basename(file.path));
      fs.copyFileSync(file.path, destPath);
      
      // 生成本地URL
      fileUrl = `/uploads/${path.basename(file.path)}`;
    }
    
    ctx.body = { url: fileUrl };
  } catch (error) {
    console.error('文件上传失败:', error);
    ctx.status = 500;
    ctx.body = { error: '文件上传失败' };
  }
});

/**
 * 获取文件URL
 */
router.get('/file-url', (ctx) => {
  const { fileName } = ctx.query;
  if (!fileName) {
    ctx.status = 400;
    ctx.body = { error: '未提供文件名' };
    return;
  }
  
  // 检查是否禁用OSS
  const disableOSS = process.env.DISABLE_OSS === 'true';
  
  let fileUrl;
  if (!disableOSS && process.env.OSS_ACCESS_KEY_ID) {
    // 生成OSS URL
    const ossEndpoint = process.env.OSS_ENDPOINT;
    const ossBucket = process.env.OSS_BUCKET;
    fileUrl = `https://${ossBucket}.${ossEndpoint}/${fileName}`;
  } else {
    // 生成本地URL
    fileUrl = `/uploads/${fileName}`;
  }
  
  ctx.body = { url: fileUrl };
});

/**
 * 分析图像
 */
router.post('/analyze-image', upload.single('image'), async (ctx) => {
  try {
    const file = ctx.request.file;
    if (!file) {
      ctx.status = 400;
      ctx.body = { error: '未提供图像' };
      return;
    }
    
    // 读取图像数据
    const imageBuffer = fs.readFileSync(file.path);
    
    // 分析图像
    const analysisResult = await analyzeImage(imageBuffer);
    
    // 删除临时文件
    fs.unlinkSync(file.path);
    
    ctx.body = analysisResult;
  } catch (error) {
    console.error('图像分析失败:', error);
    ctx.status = 500;
    ctx.body = { error: '图像分析失败' };
  }
});

module.exports = router;