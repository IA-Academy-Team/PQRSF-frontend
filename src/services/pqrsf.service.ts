import { api } from '@/lib/api'
import type {
  DBPQRSF,
  CreateDBPQRSF,
  UpdateDBPQRSF,
  PQRSFAnalysis,
  CreatePQRSFAnalysis,
  UpdatePQRSFAnalysis,
  PQRSFReanalysis,
  CreatePQRSFReanalysis,
  PQRSFSurvey,
  CreatePQRSFSurvey,
} from '@/types/database'

export interface PQRSFListItem {
  id: number
  ticketNumber: string
  description: string | null
  createdAt: string | null
  statusId: number
  statusName: string
  typeId: number
  typeName: string
  areaId: number
  areaName: string
  clientId: number
  clientName: string | null
  clientEmail: string | null
}

export interface PQRSFListQuery {
  q?: string
  pqrsStatusId?: number
  typePqrsId?: number
  areaId?: number
  fromDate?: string
  toDate?: string
  sort?: 'recent' | 'oldest' | 'ticket'
}

export const pqrsfService = {
  // PQRSF CRUD
  getAll: async (): Promise<DBPQRSF[]> => {
    return api.get<DBPQRSF[]>('/pqrsf')
  },

  getById: async (id: number): Promise<DBPQRSF> => {
    return api.get<DBPQRSF>(`/pqrsf/${id}`)
  },

  getByRadicado: async (radicado: string): Promise<DBPQRSF> => {
    return api.get<DBPQRSF>(`/pqrsf/radicado/${radicado}`)
  },

  create: async (data: CreateDBPQRSF): Promise<DBPQRSF> => {
    return api.post<DBPQRSF>('/pqrsf', data)
  },

  update: async (id: number, data: UpdateDBPQRSF): Promise<DBPQRSF> => {
    return api.put<DBPQRSF>(`/pqrsf/${id}`, data)
  },

  delete: async (id: number): Promise<void> => {
    return api.del<void>(`/pqrsf/${id}`)
  },

  // Filtros y búsquedas
  getAdminList: async (query: PQRSFListQuery = {}): Promise<PQRSFListItem[]> => {
    const params = new URLSearchParams()
    if (query.q) params.set('q', query.q)
    if (query.pqrsStatusId) params.set('pqrsStatusId', String(query.pqrsStatusId))
    if (query.typePqrsId) params.set('typePqrsId', String(query.typePqrsId))
    if (query.areaId) params.set('areaId', String(query.areaId))
    if (query.fromDate) params.set('fromDate', query.fromDate)
    if (query.toDate) params.set('toDate', query.toDate)
    if (query.sort) params.set('sort', query.sort)
    const qs = params.toString()
    const path = qs ? `/pqrsf?${qs}` : '/pqrsf'
    return api.get<PQRSFListItem[]>(path)
  },

  getByStatus: async (statusId: number): Promise<DBPQRSF[]> => {
    return api.get<DBPQRSF[]>(`/pqrsf/status/${statusId}`)
  },

  getByType: async (typeId: number): Promise<DBPQRSF[]> => {
    return api.get<DBPQRSF[]>(`/pqrsf/type/${typeId}`)
  },

  getByUser: async (userId: number): Promise<DBPQRSF[]> => {
    return api.get<DBPQRSF[]>(`/pqrsf/user/${userId}`)
  },

  getByArea: async (areaId: number): Promise<DBPQRSF[]> => {
    return api.get<DBPQRSF[]>(`/pqrsf/area/${areaId}`)
  },

  // PQRSF Analysis
  getAnalysis: async (pqrsfId: number): Promise<PQRSFAnalysis[]> => {
    return api.get<PQRSFAnalysis[]>(`/pqrsf/${pqrsfId}/analysis`)
  },

  createAnalysis: async (data: CreatePQRSFAnalysis): Promise<PQRSFAnalysis> => {
    return api.post<PQRSFAnalysis>('/pqrsf/analysis', data)
  },

  updateAnalysis: async (id: number, data: UpdatePQRSFAnalysis): Promise<PQRSFAnalysis> => {
    return api.put<PQRSFAnalysis>(`/pqrsf/analysis/${id}`, data)
  },

  // PQRSF Reanalysis
  getReanalysis: async (id: number): Promise<PQRSFReanalysis> => {
    return api.get<PQRSFReanalysis>(`/pqrsf/reanalysis/${id}`)
  },

  createReanalysis: async (data: CreatePQRSFReanalysis): Promise<PQRSFReanalysis> => {
    return api.post<PQRSFReanalysis>('/pqrsf/reanalysis', data)
  },

  updateReanalysis: async (id: number, data: Partial<CreatePQRSFReanalysis>): Promise<PQRSFReanalysis> => {
    return api.put<PQRSFReanalysis>(`/pqrsf/reanalysis/${id}`, data)
  },

  // PQRSF Survey
  getSurvey: async (pqrsfId: number): Promise<PQRSFSurvey | null> => {
    return api.get<PQRSFSurvey | null>(`/pqrsf/${pqrsfId}/survey`)
  },

  createSurvey: async (data: CreatePQRSFSurvey): Promise<PQRSFSurvey> => {
    return api.post<PQRSFSurvey>('/pqrsf/survey', data)
  },

  updateSurvey: async (id: number, data: Partial<CreatePQRSFSurvey>): Promise<PQRSFSurvey> => {
    return api.put<PQRSFSurvey>(`/pqrsf/survey/${id}`, data)
  },
}
