import { api } from '@/lib/api'
import type {
  DBUser,
  CreateDBUser,
  UpdateDBUser,
  TypePerson,
  CreateTypePerson,
  StateHolder,
  CreateStateHolder,
} from '@/types/database'

export const userService = {
  // Users CRUD
  getAll: async (): Promise<DBUser[]> => {
    return api.get<DBUser[]>('/users')
  },

  getById: async (id: number): Promise<DBUser> => {
    return api.get<DBUser>(`/users/${id}`)
  },

  getByEmail: async (email: string): Promise<DBUser | null> => {
    return api.get<DBUser | null>(`/users/email/${email}`)
  },

  create: async (data: CreateDBUser): Promise<DBUser> => {
    return api.post<DBUser>('/users', data)
  },

  update: async (id: number, data: UpdateDBUser): Promise<DBUser> => {
    return api.put<DBUser>(`/users/${id}`, data)
  },

  updateStatus: async (id: number, isActive?: boolean): Promise<DBUser> => {
    return api.patch<DBUser>(`/users/${id}/status`, { isActive })
  },

  delete: async (id: number): Promise<void> => {
    return api.del<void>(`/users/${id}`)
  },

  // Type Person
  getTypePersons: async (): Promise<TypePerson[]> => {
    return api.get<TypePerson[]>('/users/type-person')
  },

  getTypePersonById: async (id: number): Promise<TypePerson> => {
    return api.get<TypePerson>(`/users/type-person/${id}`)
  },

  createTypePerson: async (data: CreateTypePerson): Promise<TypePerson> => {
    return api.post<TypePerson>('/users/type-person', data)
  },

  updateTypePerson: async (id: number, data: Partial<CreateTypePerson>): Promise<TypePerson> => {
    return api.put<TypePerson>(`/users/type-person/${id}`, data)
  },

  deleteTypePerson: async (id: number): Promise<void> => {
    return api.del<void>(`/users/type-person/${id}`)
  },

  // State Holder
  getStateHolders: async (): Promise<StateHolder[]> => {
    return api.get<StateHolder[]>('/users/state-holder')
  },

  getStateHolderById: async (id: number): Promise<StateHolder> => {
    return api.get<StateHolder>(`/users/state-holder/${id}`)
  },

  createStateHolder: async (data: CreateStateHolder): Promise<StateHolder> => {
    return api.post<StateHolder>('/users/state-holder', data)
  },

  updateStateHolder: async (id: number, data: Partial<CreateStateHolder>): Promise<StateHolder> => {
    return api.put<StateHolder>(`/users/state-holder/${id}`, data)
  },

  deleteStateHolder: async (id: number): Promise<void> => {
    return api.del<void>(`/users/state-holder/${id}`)
  },
}
