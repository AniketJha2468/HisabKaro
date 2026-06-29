const API_BASE = import.meta.env.VITE_API_URL || '/api';

const getToken = () => localStorage.getItem('token');

const api = {
  async request(endpoint, options = {}) {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/signup')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Session expired');
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }
      return data;
    }

    if (!response.ok) {
      throw new Error('Request failed');
    }

    return response;
  },

  auth: {
    signup: (body) => api.request('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
    login: (body) => api.request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    logout: () => api.request('/auth/logout', { method: 'POST' }),
    getProfile: () => api.request('/auth/profile'),
  },

  transactions: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return api.request(`/transactions${query ? `?${query}` : ''}`);
    },
    create: (body) => api.request('/transactions', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) => api.request(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id) => api.request(`/transactions/${id}`, { method: 'DELETE' }),
    getCategories: () => api.request('/transactions/categories'),
  },

  reports: {
    getMonthly: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return api.request(`/reports/monthly${query ? `?${query}` : ''}`);
    },
    getCategory: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return api.request(`/reports/category${query ? `?${query}` : ''}`);
    },
    getTrends: (months = 6) => api.request(`/reports/trends?months=${months}`),
    getSuggestions: () => api.request('/reports/suggestions'),
    exportPDF: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      const token = getToken();
      const response = await fetch(`${API_BASE}/reports/export/pdf${query ? `?${query}` : ''}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to export PDF');
      return response.blob();
    },
    exportCSV: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      const token = getToken();
      const response = await fetch(`${API_BASE}/reports/export/csv${query ? `?${query}` : ''}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to export CSV');
      return response.blob();
    },
  },

  budget: {
    getAll: () => api.request('/budget'),
    create: (body) => api.request('/budget', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) => api.request(`/budget/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id) => api.request(`/budget/${id}`, { method: 'DELETE' }),
  },
};

export default api;
