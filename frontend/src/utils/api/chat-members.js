import { instance } from '../../core';

export default {
  getMyChats: async () => {
    const res = await instance.get('/api/chat-members');
    return res.data;
  },
  getChatMembers: async (chatUUID) => {
    const res = await instance.get(`/api/chat-members/${chatUUID}`);
    return res.data;
  },
};
