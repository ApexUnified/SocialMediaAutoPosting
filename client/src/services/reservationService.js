import api from './api';

export const reservationService = {
  getAll: async () => {
    const response = await api.get('/reservations');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/reservations/${id}`);
    return response.data;
  },

  create: async (reservationData) => {
    const response = await api.post('/reservations', reservationData);
    return response.data;
  },

  update: async (id, reservationData) => {
    const response = await api.put(`/reservations/${id}`, reservationData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/reservations/${id}`);
    return response.data;
  },

  cancel: async (id) => {
    const response = await api.put(`/reservations/${id}/cancel`);
    return response.data;
  },

  getUserReservations: async () => {
    const response = await api.get('/reservations/user');
    return response.data;
  },

  getHospitalReservations: async (hospitalId) => {
    const response = await api.get(`/reservations/hospital/${hospitalId}`);
    return response.data;
  },
}; 