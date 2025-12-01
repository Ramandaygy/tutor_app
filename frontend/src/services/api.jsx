// src/api.js
import axios from "axios";

// Gunakan environment variable (REACT_APP_API_URL) jika ada
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// ====== Instance utama untuk semua request ======
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ====== Interceptors ======
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // console.log("Making API request to:", config.url);
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API error:", error.response?.data || error.message);
    if (error.response?.status === 401) {
      // Token invalid atau expired → logout otomatis
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ===================================================
// 🔐 AUTH API
// ===================================================
export const register = (data) => api.post("/auth/register", data);
export const login = (data) => api.post("/auth/login", data);
export const logout = () => api.post("/auth/logout");
export const getProfile = () => api.get("/auth/profile");
export const updateProfile = (data) => api.put("/auth/profile", data);
export const verifyToken = () => api.get("/auth/verify-token");

// ===================================================
// 🤖 CHATBOT API
// ===================================================

// kirim pertanyaan bebas ke chatbot
export const askQuestion = (message) => api.post("/chatbot/chat", { message });

// ambil soal sesuai tema (literasi/numerasi/sains)
export const getQuestion = (theme) =>
  api.get(`/chatbot/get_question?theme=${theme}`);

// kirim jawaban user ke backend
export const sendAnswer = (payload) => api.post("/chatbot/answer", payload);

// ===================================================
// 📊 PROGRESS API
// ===================================================
export const getProgress = () => api.get("/progress/me");

// ===================================================
// 🩺 HEALTH CHECK (opsional)
// ===================================================
export const healthCheck = () => api.get("/api/health");



// ===================================================
// 📰 ARTICLE API (Public untuk frontend landingpage)
// ===================================================

// Ambil semua artikel
export const getArticles = () => api.get("/articles");

// Ambil artikel by ID
export const getArticleById = (id) => api.get(`/articles/${id}`);

// Export default instance
export default api;
