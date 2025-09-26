import axios from "axios";

const api = axios.create({
  baseURL: __API_URL__||"http://localhost:5000/api",
});

// Attach token automatically for every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
