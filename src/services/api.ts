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

export default api