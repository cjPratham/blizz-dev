import axios from "axios";

const API = __API_URL__;

export const signup = (data) => axios.post(`${API}/auth/register`, data);
export const login = (data) => axios.post(`${API}/auth/login`, data);