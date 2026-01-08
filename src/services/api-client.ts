// Re-exportar el cliente API centralizado desde lib/api
// Mantener compatibilidad con servicios existentes
export { api as apiClient, HttpError, API_BASE } from '@/lib/api'
export type { HttpError as ApiError }
