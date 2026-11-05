import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 20000,
});

// Attach token if present
API.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("alka_admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {}
  return config;
});

export default API;

