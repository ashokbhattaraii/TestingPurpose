"use client";
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1",
  withCredentials: true,
});
// Attach the access_token cookie as a Bearer token manually.
// This bypasses the Vercel cross-domain cookie bug entirely.
axiosInstance.interceptors.request.use(
  (config) => {
    // Only run in the browser
    if (typeof window !== "undefined") {
      const match = document.cookie.match(new RegExp('(^| )access_token=([^;]+)'));
      if (match && match[2]) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${match[2]}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  },
);

export default axiosInstance;
