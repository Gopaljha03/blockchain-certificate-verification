import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized on protected routes, remove token
      if (!error.config.url.includes('/auth/login') && !error.config.url.includes('/verify')) {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_info');
        if (window.location.pathname.startsWith('/admin')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
};

export const studentApi = {
  getAll: () => api.get('/students'),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
};

export const resultApi = {
  getAll: () => api.get('/results'),
  getByStudent: (studentId) => api.get(`/results/student/${studentId}`),
  create: (data) => api.post('/results', data),
};

export const certificateApi = {
  getAll: () => api.get('/certificates'),
  getById: (id) => api.get(`/certificates/${id}`),
  issue: (data) => api.post('/certificates/issue', data),
  tamperDemo: (id, newCgpa) => api.post(`/certificates/tamper-demo/${id}`, { newCgpa }),
};

export const verifyApi = {
  verify: (verificationId) => api.get(`/verify/${verificationId}`),
};

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
};

export default api;
