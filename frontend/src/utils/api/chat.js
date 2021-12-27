import { instance } from '../../core';
// todo: use aliases

export default {
  postChatPhoto: async (file, chatUUID) => {
    const formData = new FormData();
    formData.append('image', file);
    return await instance.post('/api/chats/file', formData, {
      params: { chatUUID },
    });
  },
  getAll: async () => {
    return instance.get('/api/chats');
  },
};
