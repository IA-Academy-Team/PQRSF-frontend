import { api } from '@/lib/api'
import type {
  TypePQRSF,
  CreateTypePQRSF,
  UpdateTypePQRSF,
  PQRSStatus,
  CreatePQRSStatus,
  UpdatePQRSStatus,
} from '@/types/database'

export const catalogService = {
  // Type PQRSF
  getTypePQRSF: async (): Promise<TypePQRSF[]> => {
    return api.get<TypePQRSF[]>('/catalog/type-pqrsf')
  },

  getTypePQRSFById: async (id: number): Promise<TypePQRSF> => {
    return api.get<TypePQRSF>(`/catalog/type-pqrsf/${id}`)
  },

  createTypePQRSF: async (data: CreateTypePQRSF): Promise<TypePQRSF> => {
    return api.post<TypePQRSF>('/catalog/type-pqrsf', data)
  },

  updateTypePQRSF: async (id: number, data: UpdateTypePQRSF): Promise<TypePQRSF> => {
    return api.put<TypePQRSF>(`/catalog/type-pqrsf/${id}`, data)
  },

  deleteTypePQRSF: async (id: number): Promise<void> => {
    return api.del<void>(`/catalog/type-pqrsf/${id}`)
  },

  // PQRS Status
  getPQRSStatus: async (): Promise<PQRSStatus[]> => {
    return api.get<PQRSStatus[]>('/catalog/pqrs-status')
  },

  getPQRSStatusById: async (id: number): Promise<PQRSStatus> => {
    return api.get<PQRSStatus>(`/catalog/pqrs-status/${id}`)
  },

  createPQRSStatus: async (data: CreatePQRSStatus): Promise<PQRSStatus> => {
    return api.post<PQRSStatus>('/catalog/pqrs-status', data)
  },

  updatePQRSStatus: async (id: number, data: UpdatePQRSStatus): Promise<PQRSStatus> => {
    return api.put<PQRSStatus>(`/catalog/pqrs-status/${id}`, data)
  },

  deletePQRSStatus: async (id: number): Promise<void> => {
    return api.del<void>(`/catalog/pqrs-status/${id}`)
  },
}
