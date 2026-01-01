import axios from "axios";

/**
 * Base API URL
 * Must be defined in Vercel as VITE_API_BASE_URL
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// HARD FAIL if env var is missing
if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not defined");
}

/**
 * Axios instance
 */
export const apiclient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

/**
 * Attach access token if present
 */
apiclient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Handle token refresh (SAFE, NO LOOPS)
 */
apiclient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 🚫 NEVER retry auth endpoints
    if (
      originalRequest?.url?.includes("/api/auth/register/") ||
      originalRequest?.url?.includes("/api/auth/login/")
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        return Promise.reject(error);
      }

      try {
        const res = await apiclient.post("/api/auth/token/refresh/", {
          refresh: refreshToken,
        });

        const { access } = res.data;
        localStorage.setItem("access_token", access);
        originalRequest.headers.Authorization = `Bearer ${access}`;

        return apiclient(originalRequest);
      } catch {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);
