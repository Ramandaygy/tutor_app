import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// 🔹 Request Interceptor (kirim token otomatis)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 🔹 Response Interceptor (refresh token otomatis jika expired)
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      isRefreshing = true;
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const rs = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
          headers: { Authorization: `Bearer ${refreshToken}` },
        });
        const newToken = rs.data.admin_token;
        localStorage.setItem("admin_token", newToken);
        api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// ------------------- AUTH -------------------
export const adminLogin = async (email, password) => {
  const res = await api.post(`/admin/login`, { email, password });
  localStorage.setItem("admin_token", res.data.admin_token);
  localStorage.setItem("refresh_token", res.data.refresh_token);
  return res.data;
};

// ------------------- USERS -------------------
export const getAllUsers = async () => {
  const res = await api.get(`/admin/users`);
  return res.data.users || [];
};

export const getUserDetail = async (userId) => {
  const res = await api.get(`/admin/users/${userId}`);
  return res.data.user || null;
};

export const toggleUserStatus = async (userId) => {
  const res = await api.post(`/admin/users/${userId}/toggle-status`);
  return res.data;
};

export const deleteUser = async (userId) => {
  const res = await api.delete(`/admin/users/${userId}?confirm=true`);
  return res.data;
};

// ------------------- PROGRESS -------------------
export const getAllProgress = async () => {
  const res = await api.get(`/admin/progress/all`);
  return res.data.progress || [];
};

export const getUserProgress = async (userId) => {
  const res = await api.get(`/admin/progress/${userId}`);
  return res.data.progress || null;
};

// ------------------- STATS -------------------
export const getStats = async () => {
  const res = await api.get(`/admin/stats`);
  return res.data.stats || {};
};

// ------------------- ACTIVITY -------------------
export const getAllActivity = async (limit = 100) => {
  const res = await api.get(`/admin/activity?limit=${limit}`);
  return res.data || [];
};

export const getUserActivity = async (userId, limit = 50) => {
  const res = await api.get(`/admin/activity/${userId}?limit=${limit}`);
  return res.data || [];
};

// ------------------- ARTICLES -------------------

// Ambil semua artikel
export const getAllArticles = async () => {
  const res = await api.get(`/admin/articles`);
  return res.data.articles || [];
};

// Tambah artikel
export const addArticle = async (formData) => {
  const res = await api.post(`/admin/articles/add`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return res.data;
};

// Ambil detail artikel
export const getArticleDetail = async (articleId) => {
  const res = await api.get(`/admin/articles/${articleId}`);
  return res.data.article || null;
};

// Update artikel
export const updateArticle = async (articleId, formData) => {
  const res = await api.put(`/admin/articles/update/${articleId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return res.data;
};

// Hapus artikel
export const deleteArticle = async (articleId) => {
  const res = await api.delete(`/admin/articles/delete/${articleId}`);
  return res.data;
};


export default api;
