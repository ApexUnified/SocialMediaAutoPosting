import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL;



const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem("token");
      // Instead of using window.location, we'll let the component handle navigation
      return Promise.reject(new Error("Unauthorized access"));
    }
    return Promise.reject(error);
  }
);

// export const authService = {
//   login: (credentials) => api.post('/auth/login', credentials),
//   register: (userData) => api.post('/auth/register', userData),
//   logout: () => {
//     localStorage.removeItem('token');
//   },
// };

// export const reservationService = {
//   getAll: () => api.get('/reservations'),
//   getById: (id) => api.get(`/reservations/${id}`),
//   create: (data) => api.post('/reservations', data),
//   update: (id, data) => api.put(`/reservations/${id}`, data),
//   delete: (id) => api.delete(`/reservations/${id}`),
// };

// export const couponService = {
//   getAll: () => api.get('/coupons'),
//   getById: (id) => api.get(`/coupons/${id}`),
//   create: (data) => api.post('/coupons', data),
//   update: (id, data) => api.put(`/coupons/${id}`, data),
//   delete: (id) => api.delete(`/coupons/${id}`),
// };

// export const blogService = {
//   getAll: () => api.get('/blogs'),
//   getById: (id) => api.get(`/blogs/${id}`),
//   create: (data) => api.post('/blogs', data),
//   update: (id, data) => api.put(`/blogs/${id}`, data),
//   delete: (id) => api.delete(`/blogs/${id}`),
// };

// export const subscriptionService = {
//   getAll: () => api.get('/subscriptions'),
//   getById: (id) => api.get(`/subscriptions/${id}`),
//   create: (data) => api.post('/subscriptions', data),
//   update: (id, data) => api.put(`/subscriptions/${id}`, data),
//   delete: (id) => api.delete(`/subscriptions/${id}`),
// };

// export const hospitalService = {
//   getAll: () => api.get('/hospitals'),
//   getById: (id) => api.get(`/hospitals/${id}`),
//   create: (data) => api.post('/hospitals', data),
//   update: (id, data) => api.put(`/hospitals/${id}`, data),
//   delete: (id) => api.delete(`/hospitals/${id}`),
// };

export default api;
