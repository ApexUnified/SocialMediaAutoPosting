import api from './api';

export const subscriptionService = {
  getAll: async () => {
    const response = await api.get('/subscriptions');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/subscriptions/${id}`);
    return response.data;
  },

  create: async (subscriptionData) => {
    const response = await api.post('/subscriptions', subscriptionData);
    return response.data;
  },

  update: async (id, subscriptionData) => {
    const response = await api.put(`/subscriptions/${id}`, subscriptionData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/subscriptions/${id}`);
    return response.data;
  },

  cancel: async (id) => {
    const response = await api.put(`/subscriptions/${id}/cancel`);
    return response.data;
  },

  getUserSubscriptions: async () => {
    const response = await api.get('/subscriptions/user');
    return response.data;
  },

  getPlans: async () => {
    const response = await api.get('/subscriptions/plans');
    return response.data;
  },
}; 