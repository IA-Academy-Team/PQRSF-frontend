import { api } from '@/lib/api'

export interface AuthSessionUser {
  id: string | number
  email?: string | null
  name?: string | null
  roleId?: number | null
  role_id?: number | null
}

export interface AuthSessionResponse {
  user?: AuthSessionUser | null
  session?: Record<string, unknown> | null
  token?: string | null
}

export const authService = {
  register: async (
    name: string,
    email: string,
    password: string,
    phoneNumber?: string | null
  ): Promise<void> => {
    return api.post<void>('/auth/register', {
      name,
      email,
      password,
      phoneNumber: phoneNumber?.trim() ? phoneNumber.trim() : undefined,
    })
  },
  login: async (email: string, password: string): Promise<AuthSessionResponse> => {
    return api.post<AuthSessionResponse>('/auth/login', { email, password })
  },

  logout: async (): Promise<void> => {
    return api.post<void>('/auth/logout')
  },

  forgotPassword: async (email: string, redirectTo?: string): Promise<void> => {
    return api.post<void>('/auth/forgot-password', { email, redirectTo })
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    return api.post<void>('/auth/reset-password', { token, newPassword })
  },

  me: async (): Promise<AuthSessionResponse> => {
    return api.get<AuthSessionResponse>('/auth/me')
  },
}
