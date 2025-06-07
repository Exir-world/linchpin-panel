import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { getCookie } from "cookies-next";

// Base configuration for the Axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

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
  (error: AxiosError) => {
    // Handle specific status codes
    if (error.response) {
      switch (error.response.status) {
        case 401:
          window.location.href = "/login";
          console.error("Unauthorized - Redirecting to login...");
          break;
        case 403:
          console.error("Forbidden - Insufficient permissions");
          break;
        case 500:
          console.error("Server Error - Please try again later");
          break;
        default:
          console.error(`Error ${error.response.status}: ${error.message}`);
      }
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error setting up request:", error.message);
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
