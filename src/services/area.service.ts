import { api } from '@/lib/api'
import type {
  Area,
  CreateArea,
  UpdateArea,
  Responsible,
  CreateResponsible,
  UpdateResponsible,
} from '@/types/database'

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
