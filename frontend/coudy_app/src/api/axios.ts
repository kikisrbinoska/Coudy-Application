import axios from "axios";

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN ?? "http://localhost:9096";
export const API_BASE_URL = `${API_ORIGIN}/api`;
export { API_ORIGIN };

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    const url = config.url ?? "";
    const isAuthEndpoint = url.includes("/user/login") || url.includes("/user/register");
    if (token && !isAuthEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint = error.config?.url?.includes("/user/login") || error.config?.url?.includes("/user/register");
    if (!isAuthEndpoint && (error.response?.status === 401 || error.response?.status === 403)) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
