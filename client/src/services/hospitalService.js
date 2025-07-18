import api from './api';

export const hospitalService = {
  getAll: async () => {
    const response = await api.get('/hospitals');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/hospitals/${id}`);
    return response.data;
  },

  create: async (hospitalData) => {
    const response = await api.post('/hospitals', hospitalData);
    return response.data;
  },

  update: async (id, hospitalData) => {
    const response = await api.put(`/hospitals/${id}`, hospitalData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/hospitals/${id}`);
    return response.data;
  },

  getDoctors: async (hospitalId) => {
    const response = await api.get(`/hospitals/${hospitalId}/doctors`);
    return response.data;
  },

  getDepartments: async (hospitalId) => {
    const response = await api.get(`/hospitals/${hospitalId}/departments`);
    return response.data;
  },
}; 