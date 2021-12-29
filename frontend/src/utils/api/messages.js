import { instance } from '../../core';

export default {
  getMessages: (chatID) =>
    instance.get(`/rooms/${chatID}/messages`),
};
