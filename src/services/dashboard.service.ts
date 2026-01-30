import { api } from "@/lib/api"

export interface AdminStatusMetric {
  statusId: number
  statusName?: string
  count: number
}

export interface AdminTypeMetric {
  typeId: number
  typeName: string
  count: number
}

export interface AdminAvgResponseMetric {
  areaId: number
  areaName: string
  avgDays: number
}

export interface AdminMetrics {
  totalPqrs: number
  totalChats: number
  totalClients: number
  byStatus: AdminStatusMetric[]
  byType: AdminTypeMetric[]
  avgResponseByArea: AdminAvgResponseMetric[]
  surveyAverage?: number
}

export interface AdminChat {
  chatId: number
  clientId?: number | null
  clientName?: string | null
  lastMessage?: string | null
  lastMessageAt?: string | null
  ticketNumber?: string | null
}

export interface AreaStatusMetric {
  statusId: number
  count: number
}

export interface AreaMetrics {
  totalPqrs: number
  byStatus: AreaStatusMetric[]
}

export interface AreaPendingItem {
  id: number
  ticketNumber: string
  description: string
  createdAt?: string | null
  updatedAt?: string | null
  dueDate?: string | null
  pqrsStatusId: number
  clientId: number
  clientName?: string | null
  typePqrsId: number
  typeName: string
  areaId: number
  areaName: string
  analysisAnswer?: string | null
  responseContent?: string | null
  responseSentAt?: string | null
}

export interface AreaAppealItem extends AreaPendingItem {}

export const dashboardService = {
  getAdminMetrics: async (): Promise<AdminMetrics> => {
    return api.get<AdminMetrics>("/dashboard/admin/metrics")
  },
  getAdminChats: async (): Promise<AdminChat[]> => {
    return api.get<AdminChat[]>("/dashboard/admin/chats")
  },
  getAreaMetrics: async (areaId: number): Promise<AreaMetrics> => {
    return api.get<AreaMetrics>(`/dashboard/area/${areaId}/metrics`)
  },
  getAreaPending: async (areaId: number): Promise<AreaPendingItem[]> => {
    return api.get<AreaPendingItem[]>(`/dashboard/area/${areaId}/pending`)
  },
  getAreaAppeals: async (areaId: number): Promise<AreaAppealItem[]> => {
    return api.get<AreaAppealItem[]>(`/dashboard/area/${areaId}/appeals`)
  },
}
