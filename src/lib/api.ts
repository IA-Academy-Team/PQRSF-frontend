// Cliente HTTP Centralizado para Consumo de API
// Adaptado según estándares de la empresa

/**
 * Clase de Error Personalizada para Errores HTTP
 */
export class HttpError extends Error {
  constructor(
    message: string, 
    public status: number,
    public data?: any
  ) {
    super(message)
    this.name = 'HttpError'
    Object.setPrototypeOf(this, HttpError.prototype)
  }
}

/**
 * Detectar si estamos en localhost
 */
const isLocalhost = (): boolean => {
  if (typeof window === 'undefined') return false
  const hostname = window.location.hostname
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]'
}

/**
 * Obtener la URL base de la API según el entorno
 */
const getApiBaseUrl = (): string => {
  // Detectar automáticamente si está en localhost
  const isDev = isLocalhost()

  // Variables de entorno con fallback
  const devUrl = import.meta.env.VITE_API_DEV || 'http://localhost:3000/api'
  const prodUrl = import.meta.env.VITE_API_PROD || 'https://api.tudominio.com/api'

  // Seleccionar URL según entorno
  return isDev ? devUrl : prodUrl
}

/**
 * URL base de la API
 */
export const API_BASE = getApiBaseUrl()
export const IS_LOCALHOST = isLocalhost()

/**
 * Rutas públicas que NO requieren token de autenticación
 */
const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/auth/password/request',
  '/auth/password/reset',
  '/public/',
  '/survey/',
  '/surver/',
  '/health',
]

/**
 * Verificar si una ruta es pública
 */
const isPublicRoute = (path: string): boolean => {
  return PUBLIC_ROUTES.some((route) => path.includes(route))
}

/**
 * Normalizar path (asegurar que tenga / al inicio)
 */
const normalizePath = (path: string): string => {
  return path.startsWith('/') ? path : `/${path}`
}

/**
 * Obtener el token de autenticación
 */
const getToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

/**
 * Redirigir a login (solo en cliente)
 */
const redirectToLogin = (): void => {
  if (typeof window === 'undefined') return
  const currentPath = window.location.pathname
  // No redirigir si ya estamos en una ruta pública
  if (isPublicRoute(currentPath)) return
  // Redirigir a login
  window.location.href = '/'
}

/**
 * Función Request Centralizada
 */
async function request<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  // Normalizar path
  const normalizedPath = normalizePath(path)
  const fullUrl = `${API_BASE}${normalizedPath}`

  // Verificar si es ruta pública
  const isPublic = isPublicRoute(normalizedPath)

  // Obtener token
  const token = getToken()

  // Configurar headers
  const headers = new Headers(init.headers || {})
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  // Agregar token si existe y NO es ruta pública
  if (token && !isPublic) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  try {
    // Hacer la petición
    const response = await fetch(fullUrl, {
      ...init,
      credentials: 'include',
      headers,
    })

    // Procesar respuesta según Content-Type
    const contentType = response.headers.get('content-type')
    const isJson = contentType?.includes('application/json')
    const isText = contentType?.includes('text/')

    // Manejar errores HTTP
    if (!response.ok) {
      let errorMessage = response.statusText
      let errorData: any = null

      // Intentar extraer mensaje de error del body
      try {
        if (isJson) {
          errorData = await response.json()
          errorMessage =
            errorData.error || errorData.message || errorData.errors || errorMessage
        } else if (isText) {
          errorMessage = await response.text()
        }
      } catch (parseError) {
        // Si no se puede parsear, usar statusText
        errorMessage = response.statusText
      }

      // Manejar errores de autenticación/autorización
      if (response.status === 401 || response.status === 403) {
        // Eliminar token
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token')
          localStorage.removeItem('auth_user')
        }

        // Redirigir a login solo si NO es ruta pública
        if (!isPublic) {
          redirectToLogin()
        }
      }

      const normalizedMessage =
        typeof errorMessage === 'string'
          ? errorMessage
          : errorData?.error?.message ||
            errorData?.message ||
            'Error en la petición'

      throw new HttpError(
        normalizedMessage,
        response.status,
        errorData
      )
    }

    // Si la respuesta está vacía (204 No Content)
    if (response.status === 204) {
      return {} as T
    }

    // Parsear respuesta según Content-Type
    if (isJson) {
      return await response.json()
    } else if (isText) {
      return (await response.text()) as T
    } else {
      // Si no hay contenido, retornar objeto vacío
      return {} as T
    }
  } catch (error) {
    // Si ya es HttpError, re-lanzarlo
    if (error instanceof HttpError) {
      throw error
    }

    // Si es Error de red u otro tipo, convertirlo a HttpError
    if (error instanceof Error) {
      throw new HttpError(error.message, 0, { originalError: error })
    }

    // Error desconocido
    throw new HttpError('Error de conexión', 0, { error })
  }
}

/**
 * Métodos HTTP Convenientes
 */

export async function get<T>(path: string, init?: RequestInit): Promise<T> {
  return request<T>(path, {
    ...init,
    method: 'GET',
  })
}

export async function post<T>(
  path: string,
  data?: any,
  init?: RequestInit
): Promise<T> {
  return request<T>(path, {
    ...init,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  })
}

export async function put<T>(
  path: string,
  data?: any,
  init?: RequestInit
): Promise<T> {
  return request<T>(path, {
    ...init,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  })
}

export async function patch<T>(
  path: string,
  data?: any,
  init?: RequestInit
): Promise<T> {
  return request<T>(path, {
    ...init,
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  })
}

export async function del<T>(path: string, init?: RequestInit): Promise<T> {
  return request<T>(path, {
    ...init,
    method: 'DELETE',
  })
}

/**
 * Objeto API con todos los métodos
 */
export const api = {
  request,
  get,
  post,
  put,
  patch,
  del,
  delete: del, // Alias para delete (palabra reservada)
}

// Exportar por defecto
export default api
