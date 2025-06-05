import axios from 'axios';

// 创建axios实例
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证信息等
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // 统一处理错误
    console.error('API请求错误:', error);
    return Promise.reject(error);
  }
);

// API方法
export const api = {
  // 获取服务器状态
  getStatus: async () => {
    return apiClient.get('/api/status');
  },
  
  // 获取分析结果历史
  getAnalysisHistory: async () => {
    return apiClient.get('/api/analysis/history');
  },
};

export default api; 