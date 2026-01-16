import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth headers here if needed
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error?.message || error.message || 'An error occurred';
    console.error('API Error:', message);
    return Promise.reject(new Error(message));
  }
);

// Board APIs
export const boardApi = {
  getAll: () => api.get('/boards'),
  getById: (id) => api.get(`/boards/${id}`),
  create: (data) => api.post('/boards', data),
  update: (id, data) => api.put(`/boards/${id}`, data),
  delete: (id) => api.delete(`/boards/${id}`),
  getLabels: (id) => api.get(`/boards/${id}/labels`),
};

// List APIs
export const listApi = {
  create: (data) => api.post('/lists', data),
  update: (id, data) => api.put(`/lists/${id}`, data),
  delete: (id) => api.delete(`/lists/${id}`),
  reorder: (data) => api.put('/lists/reorder', data),
};

// Card APIs
export const cardApi = {
  getById: (id) => api.get(`/cards/${id}`),
  create: (data) => api.post('/cards', data),
  update: (id, data) => api.put(`/cards/${id}`, data),
  delete: (id) => api.delete(`/cards/${id}`),
  archive: (id, archived) => api.put(`/cards/${id}/archive`, { archived }),
  move: (id, data) => api.put(`/cards/${id}/move`, data),
  reorder: (data) => api.put('/cards/reorder', data),
  updateLabels: (id, labelIds) => api.put(`/cards/${id}/labels`, { labelIds }),
  updateMembers: (id, memberIds) => api.put(`/cards/${id}/members`, { memberIds }),
  updateDueDate: (id, dueDate) => api.put(`/cards/${id}/due-date`, { dueDate }),
};

// Label APIs
export const labelApi = {
  create: (data) => api.post('/labels', data),
  update: (id, data) => api.put(`/labels/${id}`, data),
  delete: (id) => api.delete(`/labels/${id}`),
};

// Member APIs
export const memberApi = {
  getAll: () => api.get('/members'),
  getById: (id) => api.get(`/members/${id}`),
};

// Checklist APIs
export const checklistApi = {
  create: (data) => api.post('/checklists', data),
  update: (id, data) => api.put(`/checklists/${id}`, data),
  delete: (id) => api.delete(`/checklists/${id}`),
  addItem: (id, data) => api.post(`/checklists/${id}/items`, data),
  updateItem: (itemId, data) => api.put(`/checklists/items/${itemId}`, data),
  deleteItem: (itemId) => api.delete(`/checklists/items/${itemId}`),
};

// Search APIs
export const searchApi = {
  search: (params) => api.get('/search', { params }),
};

export default api;
