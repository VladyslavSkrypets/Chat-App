import { instance } from '../../core';
// todo: use aliases

export default {
  postChatPhoto: async (file, room) => {
    const formData = new FormData();
    formData.append('image', file);
    return await instance.post('/api/chats/file', formData, {
      params: { room },
    });
  },
  getAll: async () => {
    return await instance.get('/chats');
  },
};
