import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Servicios para el Dashboard
export const dashboardService = {
  getStats: () => api.get('/inventory/dashboard-stats'),
  getProducts: () => api.get('/inventory/products'),
};

// Servicios para Inventario
export const inventoryService = {
  getAll: () => api.get('/inventory/products'),
  create: (data) => api.post('/inventory/products', data),
  update: (id, data) => api.put(`/inventory/products/${id}`, data),
  delete: (id) => api.delete(`/inventory/products/${id}`),
};

// Servicios para Bodegas
export const warehouseService = {
  getAll: () => api.get('/warehouses'),
  create: (data) => api.post('/warehouses', data),
};

export default api;