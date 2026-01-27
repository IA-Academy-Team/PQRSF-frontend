import { api } from '@/lib/api'
import type {
  Area,
  CreateArea,
  UpdateArea,
  Responsible,
  CreateResponsible,
  UpdateResponsible,
} from '@/types/database'

export interface ResponsibleSummary {
  id: number
  userId: number
  areaId: number | null
  userName: string | null
  userEmail: string | null
  userIsActive: boolean
  roleId: number
  areaName: string | null
  areaCode: string | null
  phoneNumber: string | null
}

export const areaService = {
  // Area CRUD
  getAll: async (): Promise<Area[]> => {
    return api.get<Area[]>('/area')
  },

  getById: async (id: number): Promise<Area> => {
    return api.get<Area>(`/area/${id}`)
  },

  create: async (data: CreateArea): Promise<Area> => {
    return api.post<Area>('/area', data)
  },

  update: async (id: number, data: UpdateArea): Promise<Area> => {
    return api.put<Area>(`/area/${id}`, data)
  },

  delete: async (id: number): Promise<void> => {
    return api.del<void>(`/area/${id}`)
  },

  // Responsible CRUD
  getAllResponsibles: async (): Promise<Responsible[]> => {
    return api.get<Responsible[]>('/area/responsible')
  },

  getResponsibleByUser: async (userId: number): Promise<Responsible> => {
    return api.get<Responsible>(`/responsables/user/${userId}`)
  },

  getResponsiblesSummary: async (): Promise<ResponsibleSummary[]> => {
    return api.get<ResponsibleSummary[]>('/area/responsible/summary')
  },

  getResponsibleById: async (id: number): Promise<Responsible> => {
    return api.get<Responsible>(`/area/responsible/${id}`)
  },

  getResponsiblesByArea: async (areaId: number): Promise<Responsible[]> => {
    return api.get<Responsible[]>(`/area/${areaId}/responsible`)
  },

  createResponsible: async (data: CreateResponsible): Promise<Responsible> => {
    return api.post<Responsible>('/area/responsible', data)
  },

  updateResponsible: async (id: number, data: UpdateResponsible): Promise<Responsible> => {
    return api.put<Responsible>(`/area/responsible/${id}`, data)
  },

  deleteResponsible: async (id: number): Promise<void> => {
    return api.del<void>(`/area/responsible/${id}`)
  },
}
