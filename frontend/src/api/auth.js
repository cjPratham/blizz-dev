// auth.js
import api from "./axios";  // import your custom instance

export const signup = (data) => api.post(`/auth/register`, data);
export const login = (data) => api.post(`/auth/login`, data);
