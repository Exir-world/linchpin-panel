import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { getCookie } from "cookies-next";

// Base configuration for the Axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config) => {
    // Example: Add auth token from localStorage or cookies
    const token = getCookie("linchpin-admin"); // Adjust based on your auth method
    if (token) {
      console.log(token);
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    // Handle request errors (e.g., network issues)
    console.error("Request Error:", error.message);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    // Return successful response data directly
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest: any = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      try {
        // Attempt to refresh the token
        const refreshToken = getCookie('userAuth');
        if (!refreshToken) {
          window.location.href = "/login";
          return Promise.reject(error);
        }
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh`,
          {},
          {
            headers: { 'Authorization': `Bearer ${refreshToken}` }
          }
        );
        const newAccessToken = data?.accessToken;
        if (newAccessToken) {
          // Save new access token in cookie
          // You may want to use setCookie from 'cookies-next' if available
          document.cookie = `linchpin-admin=${newAccessToken}; path=/`;
          api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);
          return api(originalRequest);
        } else {
          processQueue(error, null);
          window.location.href = "/login";
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

const Get = async (url: string, config?: AxiosRequestConfig) => {
  try {
    const response = await api.get(url, config);
    return response;
  } catch (error) {
    throw error;
  }
};
const Post = async (url: string, data: any, config?: AxiosRequestConfig) => {
  try {
    const response = await api.post(url, data, config);
    return response;
  } catch (error) {
    throw error;
  }
};

const Put = async (url: string, data: any, config?: AxiosRequestConfig) => {
  try {
    const response = await api.put(url, data, config);
    return response;
  } catch (error) {
    throw error;
  }
};

const Del = async (url: string, config?: AxiosRequestConfig) => {
  try {
    const response = await api.delete(url, config);
    return response;
  } catch (error) {
    throw error;
  }
};
const Patch = async (url: string, data: any, config?: AxiosRequestConfig) => {
  try {
    const response = await api.patch(url, data, config);
    return response;
  } catch (error) {
    throw error;
  }
};

export { Get, Post, Put, Del, Patch };

export default api;
