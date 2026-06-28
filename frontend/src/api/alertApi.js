// src/api/alertApi.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: `${API_URL}/alerts`,
  withCredentials: true,
});

export const triggerCheck = () => api.post("/check");
export const getAlerts = () => api.get("/");
export const markAlertRead = (id) => api.patch(`/${id}/read`);
