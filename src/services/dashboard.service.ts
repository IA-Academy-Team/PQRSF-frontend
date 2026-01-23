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
}

export interface AdminChat {
  chatId: number
  clientId?: number | null
  clientName?: string | null
  lastMessage?: string | null
  lastMessageAt?: string | null
  ticketNumber?: string | null
}

export const dashboardService = {
  getAdminMetrics: async (): Promise<AdminMetrics> => {
    return api.get<AdminMetrics>("/dashboard/admin/metrics")
  },
  getAdminChats: async (): Promise<AdminChat[]> => {
    return api.get<AdminChat[]>("/dashboard/admin/chats")
  },
}
