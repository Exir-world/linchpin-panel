import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { getCookie } from "cookies-next";

// Base configuration for the Axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.example.com", // Set your API base URL in .env
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    // Example: Add auth token from localStorage or cookies
    const token = getCookie("token"); // Adjust based on your auth method
    if (token) {
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
    return response.data;
  },
  (error: AxiosError) => {
    // Handle specific status codes
    if (error.response) {
      switch (error.response.status) {
        case 401:
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

const get = async (url: string, config?: AxiosRequestConfig) => {
  try {
    const response = await api.get(url, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};
const post = async (url: string, data: any, config?: AxiosRequestConfig) => {
  try {
    const response = await api.post(url, data, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const put = async (url: string, data: any, config?: AxiosRequestConfig) => {
  try {
    const response = await api.put(url, data, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const del = async (url: string, config?: AxiosRequestConfig) => {
  try {
    const response = await api.delete(url, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export { get, post, put, del };

export default api;
