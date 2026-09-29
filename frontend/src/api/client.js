import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';
// Misma base que usa el resto de la app (VITE_API_URL):
//  - desarrollo: '/api' -> proxy de Vite -> backend local (localhost:3001)
//  - producción (Vercel): rewrite de vercel.json -> backend de Render
const RENDER_URL = 'https://toyotachira-sistemas-de-gestion-rrhh.onrender.com/api';

// Fallback explícito para uploads cuando no se definió VITE_API_URL
const resolveBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim()) return envUrl;
  if (import.meta.env.PROD) return RENDER_URL;
  return '/api';
};

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

// directApi for file uploads — no forced Content-Type so axios sets multipart boundary
export const directApi = axios.create({ baseURL: resolveBaseURL() });

const addAuth = (instance) => {
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  instance.interceptors.response.use(
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
};

addAuth(api);
addAuth(directApi);

export default api;
