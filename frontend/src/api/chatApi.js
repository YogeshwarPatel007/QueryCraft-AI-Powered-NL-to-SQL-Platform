import axiosInstance from "./axiosInstance";

export const sendChatMessage = (data) => axiosInstance.post("/api/chat", data);
export const listConversations = () => axiosInstance.get("/api/chat/conversations");
export const getConversationMessages = (conversationId) =>
  axiosInstance.get(`/api/chat/${conversationId}/messages`);
