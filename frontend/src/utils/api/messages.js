import { instance } from '../../core';

export default {
  get50FromBothSidesOf: (chatID, date) =>
    instance(true).get('/messages', { params: { date, chatID } }),
};
