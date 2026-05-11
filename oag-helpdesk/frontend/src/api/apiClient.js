import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5050/api',
  withCredentials: false
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('oag_access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const normalized = error.response?.data || { message: error.message };
    normalized.status = error.response?.status;
    return Promise.reject(normalized);
  }
);

export default apiClient;
