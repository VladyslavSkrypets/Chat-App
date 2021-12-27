import { instance } from '../../core';

export default {
  getMyChats: async () => {
    const res = await instance.get('/api/chat-members');
    return res.data;
  },
  getChatMembers: async (room) => {
    const res = await instance.get(`/api/chat-members/${room}`);
    return res.data;
  },
};
