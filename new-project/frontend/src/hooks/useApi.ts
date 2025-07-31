import { useState } from 'react';
import axios, { AxiosResponse } from 'axios';

// 配置axios默认设置
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证token等
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 统一错误处理
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const useApi = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (url: string): Promise<any> => {
    setLoading(true);
    setError(null);
    
    try {
      const response: AxiosResponse = await apiClient.get(url);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || '请求失败';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const postData = async (url: string, data: any): Promise<any> => {
    setLoading(true);
    setError(null);
    
    try {
      const response: AxiosResponse = await apiClient.post(url, data);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || '请求失败';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const putData = async (url: string, data: any): Promise<any> => {
    setLoading(true);
    setError(null);
    
    try {
      const response: AxiosResponse = await apiClient.put(url, data);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || '请求失败';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteData = async (url: string): Promise<any> => {
    setLoading(true);
    setError(null);
    
    try {
      const response: AxiosResponse = await apiClient.delete(url);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || '请求失败';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    fetchData,
    postData,
    putData,
    deleteData,
  };
};

export default apiClient;