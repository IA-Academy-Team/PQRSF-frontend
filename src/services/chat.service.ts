import { api } from '@/lib/api'
import type {
  Chat,
  CreateChat,
  UpdateChat,
  Message,
  CreateMessage,
  UpdateMessage,
  MessageStorage,
  CreateMessageStorage,
  Summary,
  CreateSummary,
} from '@/types/database'

export interface ChatSummary {
  id: number
  mode: number | null
  clientId: number | null
  clientName: string | null
  clientPhone: string | null
  lastMessage: string | null
  lastMessageAt: string | null
}

export interface ChatPqrsSummary extends ChatSummary {
  pqrsId: number
  ticketNumber: string
  statusId: number
  pqrsCreatedAt: string
}

export const chatService = {
  // Chat CRUD
  getAll: async (): Promise<Chat[]> => {
    return api.get<Chat[]>('/chats')
  },

  getSummaries: async (): Promise<ChatSummary[]> => {
    return api.get<ChatSummary[]>('/chats/summary')
  },

  getSummariesByPqrs: async (): Promise<ChatPqrsSummary[]> => {
    return api.get<ChatPqrsSummary[]>('/chats/summary/pqrs')
  },

  getById: async (id: number): Promise<Chat> => {
    return api.get<Chat>(`/chats/${id}`)
  },

  getByUser: async (userId: number): Promise<Chat[]> => {
    return api.get<Chat[]>(`/chats/user/${userId}`)
  },

  getByArea: async (areaId: number): Promise<Chat[]> => {
    return api.get<Chat[]>(`/chats/area/${areaId}`)
  },

  create: async (data: CreateChat): Promise<Chat> => {
    return api.post<Chat>('/chats', data)
  },

  update: async (id: number, data: UpdateChat): Promise<Chat> => {
    return api.put<Chat>(`/chats/${id}`, data)
  },

  delete: async (id: number): Promise<void> => {
    return api.del<void>(`/chats/${id}`)
  },

  // Messages
  getMessages: async (chatId: number): Promise<Message[]> => {
    return api.get<Message[]>(`/chats/${chatId}/messages`)
  },

  createMessage: async (data: CreateMessage): Promise<Message> => {
    return api.post<Message>('/chats/messages', data)
  },

  sendMessage: async (data: { chatId: number; content: string; channel?: 'whatsapp' | 'telegram' }): Promise<Message> => {
    return api.post<Message>('/chats/messages/send', data)
  },

  updateMessage: async (id: number, data: UpdateMessage): Promise<Message> => {
    return api.put<Message>(`/chats/messages/${id}`, data)
  },

  deleteMessage: async (id: number): Promise<void> => {
    return api.del<void>(`/chats/messages/${id}`)
  },

  // Message Storage
  getMessageStorage: async (id: number): Promise<MessageStorage> => {
    return api.get<MessageStorage>(`/chats/message-storage/${id}`)
  },

  createMessageStorage: async (data: CreateMessageStorage): Promise<MessageStorage> => {
    return api.post<MessageStorage>('/chats/message-storage', data)
  },

  updateMessageStorage: async (id: number, data: Partial<CreateMessageStorage>): Promise<MessageStorage> => {
    return api.put<MessageStorage>(`/chats/message-storage/${id}`, data)
  },

  // Summary
  getSummary: async (chatId: number): Promise<Summary | null> => {
    return api.get<Summary | null>(`/chats/${chatId}/summary`)
  },

  createSummary: async (data: CreateSummary): Promise<Summary> => {
    return api.post<Summary>('/chats/summary', data)
  },

  updateSummary: async (id: number, data: Partial<CreateSummary>): Promise<Summary> => {
    return api.put<Summary>(`/chats/summary/${id}`, data)
  },

  deleteSummary: async (id: number): Promise<void> => {
    return api.del<void>(`/chats/summary/${id}`)
  },
}
