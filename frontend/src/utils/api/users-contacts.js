import { instance } from '../../core';

export default {
  addFriend: async (friendUserEmail) => {
    await instance.post(
      '/api/users-contacts',
      {},
      {
        params: { friendUserEmail },
      },
    );
  },
  getMyFriendList: async () => {
    return await instance.get('/api/users-contacts');
  },
};
