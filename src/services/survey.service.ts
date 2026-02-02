import { api } from '@/lib/api'
import type { CreatePublicSurvey, PQRSFSurvey, PQRSFSurveyDetailed, SurveyPublicInfo } from '@/types/database'

/** Promedio general de todas las respuestas (q1–q5) de las encuestas. Mismo valor que muestra el botón en Encuestas. */
export function getSurveyOverallAverage(surveys: PQRSFSurveyDetailed[]): number | null {
  const values = surveys.flatMap((s) => [
    s.q1Clarity,
    s.q2Timeliness,
    s.q3Quality,
    s.q4Attention,
    s.q5Overall,
  ]).filter((v): v is number => typeof v === 'number')
  if (values.length === 0) return null
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

export const surveyService = {
  getPublic: async (ticketNumber: string): Promise<SurveyPublicInfo> => {
    return api.get<SurveyPublicInfo>(`/survey/${ticketNumber}`)
  },

  submitPublic: async (ticketNumber: string, data: CreatePublicSurvey): Promise<PQRSFSurvey> => {
    return api.post<PQRSFSurvey>(`/survey/${ticketNumber}`, data)
  },

  listAdmin: async (): Promise<PQRSFSurveyDetailed[]> => {
    return api.get<PQRSFSurveyDetailed[]>('/encuestas/admin')
  },
}
