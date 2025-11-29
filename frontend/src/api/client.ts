// src/api/client.ts
import axios from "axios";
import { getToken, clearToken } from "../auth/token";

export const api = axios.create({
  baseURL: "http://localhost:8080", // 根据你的后端实际地址改
  withCredentials: false,
});

// 请求拦截：自动加 Authorization 头
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截：遇到 401 自动跳登录页
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      clearToken();
      // 简单粗暴跳转
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
