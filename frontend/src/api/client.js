import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';
const directURL = import.meta.env.VITE_DIRECT_API_URL || '';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

export const directApi = directURL
  ? axios.create({
      baseURL: directURL,
      headers: { 'Content-Type': 'application/json' },
    })
  : api;

const addAuth = (instance) => {
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
};

addAuth(api);
if (directURL) addAuth(directApi);

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

export default api;
