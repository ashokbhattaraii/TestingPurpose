"use client";
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1",
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Do not redirect on 401 here — the auth context handles unauthenticated state
    // by setting user to null, which the layout then uses to redirect to /login.
    // A hard redirect from axios would cause a reload loop competing with the
    // React router redirect already managed by the auth context and layout.
    return Promise.reject(error);
  },
);

export default axiosInstance;
