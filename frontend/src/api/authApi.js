import axiosInstance from "./axiosInstance";

export const signup = (data) => axiosInstance.post("/api/auth/signup", data);
export const login = (data) => axiosInstance.post("/api/auth/login", data);
export const logout = () => axiosInstance.post("/api/auth/logout");
export const getMe = () => axiosInstance.get("/api/auth/me");
export const updateProfile = (data) => axiosInstance.put("/api/auth/me", data);
export const updatePassword = (data) => axiosInstance.put("/api/auth/me/password", data);