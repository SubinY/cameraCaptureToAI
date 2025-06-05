/**
 * OSS适配器
 * 用于在禁用OSS服务时提供本地存储功能
 * 通过服务器API获取OSS配置
 */

import fs from 'fs';
import path from 'path';
import axios from 'axios';

// 服务器基础URL
const SERVER_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';

/**
 * 获取OSS配置
 * @returns {Promise<{enabled: boolean}>} - OSS配置
 */
async function getOssConfig() {
  try {
    const response = await axios.get(`${SERVER_BASE_URL}/api/oss-config`);
    return response.data;
  } catch (error) {
    console.error('获取OSS配置失败:', error);
    // 默认禁用OSS
    return { enabled: false };
  }
}

/**
 * 上传文件
 * @param {Buffer} fileBuffer - 文件数据
 * @param {string} fileName - 文件名
 * @returns {Promise<string>} - 文件URL
 */
export async function uploadFile(fileBuffer: Buffer, fileName: string): Promise<string> {
  // 从服务器获取OSS配置
  const ossConfig = await getOssConfig();
  
  // 如果OSS服务已启用，则使用服务器端的OSS服务
  if (ossConfig.enabled) {
    // 这里我们通过API调用服务器端的上传功能
    // 实际实现时可能需要调整
    const formData = new FormData();
    const blob = new Blob([fileBuffer]);
    formData.append('file', blob, fileName);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('上传到OSS失败');
    }
    
    const data = await response.json();
    return data.url;
  } else {
    // OSS服务禁用时，使用本地存储
    const localStoragePath = path.resolve(process.cwd(), ossConfig.localStoragePath);
    
    // 确保目录存在
    if (!fs.existsSync(localStoragePath)) {
      fs.mkdirSync(localStoragePath, { recursive: true });
    }
    
    // 生成文件路径
    const filePath = path.join(localStoragePath, fileName);
    
    // 写入文件
    await fs.promises.writeFile(filePath, fileBuffer);
    
    // 返回本地URL
    return `/uploads/${fileName}`;
  }
}

/**
 * 获取文件URL
 * @param {string} fileName - 文件名
 * @returns {Promise<string>} - 文件URL
 */
export async function getFileUrl(fileName: string): Promise<string> {
  // 从服务器获取OSS配置
  const ossConfig = await getOssConfig();
  
  if (ossConfig.enabled) {
    // 通过API获取文件URL
    try {
      const response = await axios.get(`${SERVER_BASE_URL}/api/file-url?fileName=${fileName}`);
      return response.data.url;
    } catch (error) {
      console.error('获取文件URL失败:', error);
      // 失败时返回本地URL
      return `/uploads/${fileName}`;
    }
  } else {
    // 返回本地URL
    return `/uploads/${fileName}`;
  }
}