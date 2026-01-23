import { api } from '@/lib/api'
import type {
  TypePQRSF,
  CreateTypePQRSF,
  UpdateTypePQRSF,
  PQRSStatus,
  CreatePQRSStatus,
  UpdatePQRSStatus,
  TypeDocument,
  CreateTypeDocument,
  UpdateTypeDocument,
} from '@/types/database'

export const catalogService = {
  // Type PQRSF
  getTypePQRSF: async (): Promise<TypePQRSF[]> => {
    return api.get<TypePQRSF[]>('/type-pqrsf')
  },

  getTypePQRSFById: async (id: number): Promise<TypePQRSF> => {
    return api.get<TypePQRSF>(`/type-pqrsf/${id}`)
  },

  createTypePQRSF: async (data: CreateTypePQRSF): Promise<TypePQRSF> => {
    return api.post<TypePQRSF>('/type-pqrsf', data)
  },

  updateTypePQRSF: async (id: number, data: UpdateTypePQRSF): Promise<TypePQRSF> => {
    return api.put<TypePQRSF>(`/type-pqrsf/${id}`, data)
  },

  deleteTypePQRSF: async (id: number): Promise<void> => {
    return api.del<void>(`/type-pqrsf/${id}`)
  },

  // PQRS Status
  getPQRSStatus: async (): Promise<PQRSStatus[]> => {
    return api.get<PQRSStatus[]>('/pqrs-status')
  },

  getPQRSStatusById: async (id: number): Promise<PQRSStatus> => {
    return api.get<PQRSStatus>(`/pqrs-status/${id}`)
  },

  createPQRSStatus: async (data: CreatePQRSStatus): Promise<PQRSStatus> => {
    return api.post<PQRSStatus>('/pqrs-status', data)
  },

  updatePQRSStatus: async (id: number, data: UpdatePQRSStatus): Promise<PQRSStatus> => {
    return api.put<PQRSStatus>(`/pqrs-status/${id}`, data)
  },

  deletePQRSStatus: async (id: number): Promise<void> => {
    return api.del<void>(`/pqrs-status/${id}`)
  },

  // Type Document
  getTypeDocuments: async (): Promise<TypeDocument[]> => {
    return api.get<TypeDocument[]>('/type-document')
  },

  getTypeDocumentById: async (id: number): Promise<TypeDocument> => {
    return api.get<TypeDocument>(`/type-document/${id}`)
  },

  createTypeDocument: async (data: CreateTypeDocument): Promise<TypeDocument> => {
    return api.post<TypeDocument>('/type-document', data)
  },

  updateTypeDocument: async (id: number, data: UpdateTypeDocument): Promise<TypeDocument> => {
    return api.put<TypeDocument>(`/type-document/${id}`, data)
  },

  deleteTypeDocument: async (id: number): Promise<void> => {
    return api.del<void>(`/type-document/${id}`)
  },
}
