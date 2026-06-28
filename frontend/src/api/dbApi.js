import axiosInstance from "./axiosInstance";

export const addConnection = (data) => axiosInstance.post("/api/databases", data);
export const listConnections = () => axiosInstance.get("/api/databases");
export const testConnection = (data) => axiosInstance.post("/api/databases/test", data);
export const deleteConnection = (id) => axiosInstance.delete(`/api/databases/${id}`);
export const updateConnectionInterval = (id, alert_check_interval_minutes) =>
  axiosInstance.patch(`/api/databases/${id}/interval`, { alert_check_interval_minutes });

// Schema browser
export const getTables = (connectionId) => axiosInstance.get(`/api/databases/${connectionId}/tables`);
export const getTableDetail = (connectionId, table, limit = 10) =>
  axiosInstance.get(`/api/databases/${connectionId}/tables/${table}`, { params: { limit } });