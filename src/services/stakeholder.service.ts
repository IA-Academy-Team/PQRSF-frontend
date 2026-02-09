import type {  StakeHolder, CreateStateHolder } from '@/types/database'
import { api } from '@/lib/api'

export const stakeholderService = {
  // Stake Holder
  getStateHolders: async (): Promise<StakeHolder[]> => {
    return api.get<StakeHolder[]>('/stake-holder')
  },

  getStateHolderById: async (id: number): Promise<StakeHolder> => {
    return api.get<StakeHolder>(`/stake-holder/${id}`)
  },

  createStateHolder: async (data: CreateStateHolder): Promise<StakeHolder> => {
    return api.post<StakeHolder>('/stake-holder', data)
  },

  updateStateHolder: async (id: number, data: Partial<CreateStateHolder>): Promise<StakeHolder> => {
    return api.put<StakeHolder>(`/stake-holder/${id}`, data)
  },

  deleteStateHolder: async (id: number): Promise<void> => {
    return api.del<void>(`/stake-holder/${id}`)
  }
}