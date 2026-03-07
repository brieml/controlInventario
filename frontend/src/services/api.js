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

// Servicios para Proveedores
export const supplierService = {
  getAll: () => api.get('/suppliers'),
  create: (data) => api.post('/suppliers', data),
  getById: (id) => api.get(`/suppliers/${id}`),
};

// Servicios para Kardex
export const kardexService = {
  getAll: (params) => api.get('/kardex', { params }),
  getById: (id) => api.get(`/kardex/${id}`),
  createEntry: (data) => api.post('/kardex/entrada', data),
  createExit: (data) => api.post('/kardex/salida', data),
  getProductHistory: (productId) => api.get(`/kardex/producto/${productId}/historial`),
};

export default api;