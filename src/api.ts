import axios from "axios";

const API_BASE = "http://localhost:8000"; // change if backend runs on different port

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const signup = (email: string, password: string) =>
  axios.post(`${API_BASE}/signup`, { email, password });

export const login = (email: string, password: string) =>
  axios.post(`${API_BASE}/login`, { email, password });

export const askQuestion = (question: string) =>
  axios.post(`${API_BASE}/ask`, { question }, { headers: getAuthHeaders() });

export const getMyChats = () =>
  axios.get(`${API_BASE}/my-chats`, { headers: getAuthHeaders() });
