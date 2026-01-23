import axios from 'axios'

const API_BASE = process.env.VITE_API_DEV || process.env.VITE_API_PROD || 3000

const api = axios.create({
  baseURL: API_BASE as string,
  // las credenciales sirve para autenticar las peticiones
  withCredentials: true,
  // pasar siempre un json en el header
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest.url.includes('/auth/login')) {
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api