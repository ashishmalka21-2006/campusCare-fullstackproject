import axiosClient from './axiosClient';

export const chatbotApi = {
  sendMessage: (messageData) => axiosClient.post('/chatbot/messages', messageData),
  getSessionMessages: (sessionId) => axiosClient.get(`/chatbot/sessions/${sessionId}/messages`),
};
