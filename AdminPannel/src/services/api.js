import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 20000,
  withCredentials: true, // Enables browser to automatically transmit and receive HTTP-only cookies
});

// Attach token if present as header fallback
API.interceptors.request.use((config) => {
  try {
    const token =
      localStorage.getItem("alka_admin_token") ||
      localStorage.getItem("alka_user_token");
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {}
  return config;
});

// Response interceptor with silent automatic token refresh
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/admin-users/login") &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(
          "http://localhost:5000/api/auth/refresh",
          {},
          { withCredentials: true }
        );
        const newToken = res.data?.accessToken;
        if (newToken) {
          try {
            localStorage.setItem("alka_admin_token", newToken);
          } catch {}
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return API(originalRequest);
      } catch (refreshErr) {
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default API;


