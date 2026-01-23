import { api } from '@/lib/api'
import type { CreatePublicSurvey, PQRSFSurvey, PQRSFSurveyDetailed, SurveyPublicInfo } from '@/types/database'

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
