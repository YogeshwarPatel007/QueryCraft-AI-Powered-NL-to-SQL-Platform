import axiosInstance from "./axiosInstance";

export const runQuery = (data) => axiosInstance.post("/api/query", data);
export const runRawQuery = (data) => axiosInstance.post("/api/query/raw", data);
export const runExplainQuery = (data) => axiosInstance.post("/api/query/explain", data);
export const getHistory = () => axiosInstance.get("/api/history");
export const deleteHistoryItem = (id) => axiosInstance.delete(`/api/history/${id}`);