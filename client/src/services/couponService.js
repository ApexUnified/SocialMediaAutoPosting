import api from './api';

export const couponService = {
  getAll: async () => {
    const response = await api.get('/coupons');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/coupons/${id}`);
    return response.data;
  },

  create: async (couponData) => {
    const response = await api.post('/coupons', couponData);
    return response.data;
  },

  update: async (id, couponData) => {
    const response = await api.put(`/coupons/${id}`, couponData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/coupons/${id}`);
    return response.data;
  },

  validate: async (code) => {
    const response = await api.post('/coupons/validate', { code });
    return response.data;
  },

  apply: async (code, reservationId) => {
    const response = await api.post('/coupons/apply', { code, reservationId });
    return response.data;
  },
}; 