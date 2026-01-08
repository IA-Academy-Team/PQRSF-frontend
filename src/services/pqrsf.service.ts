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
