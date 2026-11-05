import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for consistent error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error?.response?.data?.message || error.message);
    return Promise.reject(error);
  }
);

export default API;

