import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor für das Hinzufügen des Auth-Tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor für das Handling von 401 Errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login page or refresh token
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authApi = {
  login: (username: string, password: string) => 
    api.post('/auth/login', { username, password }),
  register: (username: string, password: string, email: string) => 
    api.post('/auth/register', { username, password, email }),
  me: () => api.get('/auth/me'),
};

// Media API
export const mediaApi = {
  getAll: (type?: string) => api.get(`/media${type ? `?type=${type}` : ''}`),
  getById: (id: string) => api.get(`/media/${id}`),
  search: (query: string) => api.get(`/media/search?q=${query}`),
};

// Library API
export const libraryApi = {
  getAll: () => api.get('/libraries'),
  getById: (id: string) => api.get(`/libraries/${id}`),
  create: (data: any) => api.post('/libraries', data),
  update: (id: string, data: any) => api.put(`/libraries/${id}`, data),
  delete: (id: string) => api.delete(`/libraries/${id}`),
  scan: (id: string) => api.post(`/scheduler/libraries/${id}/scan`),
};

// Category API
export const categoryApi = {
  getAll: () => api.get('/categories'),
  getById: (id: string) => api.get(`/categories/${id}`),
  create: (data: any) => api.post('/categories', data),
  update: (id: string, data: any) => api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
}; 