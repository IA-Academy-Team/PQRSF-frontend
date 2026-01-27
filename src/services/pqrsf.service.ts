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
  Document,
  CreateDocument,
  Response,
  CreateResponse,
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

export interface PQRSFDetailItem {
  id: number
  ticketNumber: string
  description: string
  isAutoResolved: boolean
  dueDate: string | null
  createdAt: string | null
  updatedAt: string | null
  statusId: number
  statusName: string
  typeId: number
  typeName: string
  areaId: number
  areaName: string
  clientId: number
  clientName: string | null
  clientEmail: string | null
  clientDocument: string | null
  clientPhone: string | null
  typePersonId: number | null
  typePersonName: string | null
  stakeholderId: number | null
  stakeholderName: string | null
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

export interface SeguimientoItem {
  id: number
  ticketNumber: string
  createdAt: string | null
  statusId: number
  statusName: string
  typeName: string
  areaName: string
  clientName: string | null
  responseContent: string | null
  responseSentAt: string | null
  q1Clarity: number | null
  q2Timeliness: number | null
  q3Quality: number | null
  q4Attention: number | null
  q5Overall: number | null
  surveyComment: string | null
}

export interface ApelacionItem {
  id: number
  ticketNumber: string
  createdAt: string | null
  statusId: number
  statusName: string
  typeName: string
  areaName: string
  clientName: string | null
  responseContent: string | null
  responseSentAt: string | null
  surveyComment: string | null
}

export interface CerradaItem {
  id: number
  ticketNumber: string
  createdAt: string | null
  updatedAt: string | null
  statusId: number
  statusName: string
  typeName: string
  areaName: string
  clientName: string | null
  responseContent: string | null
  responseSentAt: string | null
  q1Clarity: number | null
  q2Timeliness: number | null
  q3Quality: number | null
  q4Attention: number | null
  q5Overall: number | null
  surveyComment: string | null
}

export interface BotResponsePayload {
  respuesta_pqrs: {
    ticket_number: string
    fecha_respuesta: string | null
    tipo_pqrs: string
    area: string
    estado: string
    solicitante: {
      nombre: string
      es_anonimo: boolean
    }
    descripcion_original: string
    respuesta: string
    acciones: string[]
    responsable: {
      nombre: string
      cargo: string
      email: string
    }
    canal_respuesta: {
      chat_id: string
    }
  }
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

  getDetail: async (id: number): Promise<PQRSFDetailItem> => {
    return api.get<PQRSFDetailItem>(`/pqrsf/${id}/detail`)
  },

  getSeguimiento: async (): Promise<SeguimientoItem[]> => {
    return api.get<SeguimientoItem[]>('/pqrsf/seguimiento')
  },

  getApelaciones: async (): Promise<ApelacionItem[]> => {
    return api.get<ApelacionItem[]>('/pqrsf/apelaciones')
  },

  getCerradas: async (): Promise<CerradaItem[]> => {
    return api.get<CerradaItem[]>('/pqrsf/cerradas')
  },

  finalize: async (id: number): Promise<void> => {
    return api.post<void>(`/pqrsf/${id}/finalize`)
  },

  appeal: async (id: number): Promise<void> => {
    return api.post<void>(`/pqrsf/${id}/appeal`)
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

  // PQRSF Documents
  getDocuments: async (pqrsfId: number): Promise<Document[]> => {
    return api.get<Document[]>(`/pqrsf/${pqrsfId}/documents`)
  },

  createDocument: async (pqrsfId: number, data: CreateDocument): Promise<Document> => {
    return api.post<Document>(`/pqrsf/${pqrsfId}/documents`, data)
  },

  deleteDocument: async (id: number): Promise<void> => {
    return api.del<void>(`/pqrsf/documents/${id}`)
  },

  downloadDocument: async (id: number): Promise<{ url: string }> => {
    return api.get<{ url: string }>(`/pqrsf/documents/${id}/download`)
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

  // PQRSF Responses
  getResponses: async (pqrsfId: number): Promise<Response[]> => {
    return api.get<Response[]>(`/pqrsf/${pqrsfId}/responses`)
  },

  createResponse: async (pqrsfId: number, data: CreateResponse): Promise<Response> => {
    return api.post<Response>(`/pqrsf/${pqrsfId}/responses`, data)
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

  getBotResponse: async (pqrsId: number): Promise<BotResponsePayload> => {
    return api.post<BotResponsePayload>('/pqrsf/bot-response', { pqrsId })
  },
}
