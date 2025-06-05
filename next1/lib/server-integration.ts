/**
 * 服务器集成
 * 用于在Next.js项目中启动和管理server服务
 */

import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';
import ossConfig from '../config/oss.config';

let serverProcess: ChildProcess | null = null;

/**
 * 启动服务器
 * @returns {Promise<void>}
 */
export async function startServer(): Promise<void> {
  if (serverProcess) {
    console.log('服务器已经在运行中');
    return;
  }

  return new Promise((resolve, reject) => {
    try {
      // 检查是否使用重构后的服务器
      const useRefactoredServer = process.env.NEXT_PUBLIC_USE_REFACTORED_SERVER === 'true';
      
      // 获取服务器路径
      const serverPath = path.resolve(
        process.cwd(), 
        useRefactoredServer ? '../serverRefactor' : '../server'
      );
      
      // 检查服务器目录是否存在
      if (!fs.existsSync(serverPath)) {
        throw new Error(`服务器目录不存在: ${serverPath}`);
      }

      console.log(`使用服务器路径: ${serverPath}`);

      // 创建环境变量配置
      const env = { ...process.env };
      
      // 根据OSS配置决定是否启用OSS服务
      if (!ossConfig.enabled) {
        // 禁用OSS服务的环境变量设置
        env.DISABLE_OSS = 'true';
        
        // 确保本地存储目录存在
        const localStoragePath = path.resolve(process.cwd(), ossConfig.localStoragePath);
        if (!fs.existsSync(localStoragePath)) {
          fs.mkdirSync(localStoragePath, { recursive: true });
        }
      }

      // 启动服务器进程
      serverProcess = spawn('node', ['src/app.js'], {
        cwd: serverPath,
        env,
        stdio: 'pipe', // 捕获输出
      });

      // 处理服务器输出
      serverProcess.stdout?.on('data', (data) => {
        console.log(`服务器输出: ${data}`);
        // 当看到服务器启动成功的消息时解析Promise
        if (data.toString().includes('服务器已启动')) {
          resolve();
        }
      });

      serverProcess.stderr?.on('data', (data) => {
        console.error(`服务器错误: ${data}`);
      });

      // 处理服务器退出
      serverProcess.on('close', (code) => {
        console.log(`服务器进程已退出，退出码: ${code}`);
        serverProcess = null;
      });

      // 设置超时
      setTimeout(() => {
        if (serverProcess) {
          resolve(); // 即使没有看到启动成功消息，也在超时后解析
        }
      }, 5000);

    } catch (error) {
      console.error('启动服务器失败:', error);
      reject(error);
    }
  });
}

/**
 * 停止服务器
 */
export function stopServer(): void {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
    console.log('服务器已停止');
  }
}

/**
 * 检查服务器是否正在运行
 * @returns {boolean}
 */
export function isServerRunning(): boolean {
  return serverProcess !== null;
}