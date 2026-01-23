// Tipos alineados a los modelos reales del backend

export interface MessageStorage {
  id: number
  client_phone?: string | null
  last_activity?: string | null
  created_at?: string | null
  updated_at?: string | null
  created_by?: number | null
  updated_by?: number | null
}

export interface Message {
  id: number
  content: string | null
  type: number | null
  createdAt: string | null
  chatId: number
}

export interface Summary {
  id: number
  id_chat: number
  summary_text?: string | null
  created_at?: string | null
  updated_at?: string | null
  created_by?: number | null
  updated_by?: number | null
}

export interface Chat {
  id: number
  mode?: number | null
  clientId?: number | null
}

export interface Area {
  id: number
  name: string
  code?: string | null
}

export interface Responsible {
  id: number
  userId: number
  areaId?: number | null
}

export interface PQRSFAnalysis {
  id: number
  answer?: string | null
  actionTaken?: string | null
  createdAt?: string | null
  pqrsId: number
  responsibleId: number
}

export interface PQRSFReanalysis {
  id: number
  answer?: string | null
  actionTaken?: string | null
  createdAt?: string | null
  analysisId: number
  responsibleId: number
}

export interface DBUser {
  id: number
  email: string
  name?: string | null
  image?: string | null
  phoneNumber?: string | null
  isActive?: boolean
  emailVerified?: boolean
  twoFactorEnabled?: boolean
  lastLogin?: string | null
  createdAt?: string | null
  updatedAt?: string | null
  roleId: number
}

export interface TypePerson {
  id: number
  name: string
}

export interface StateHolder {
  id: number
  name: string
}

export interface DBPQRSF {
  id: number
  ticketNumber: string
  isAutoResolved: boolean
  dueDate?: string | null
  createdAt?: string | null
  updatedAt?: string | null
  pqrsStatusId: number
  clientId: number
  typePqrsId: number
  areaId: number
}

export interface PQRSFSurvey {
  id: number
  q1Clarity?: number | null
  q2Timeliness?: number | null
  q3Quality?: number | null
  q4Attention?: number | null
  q5Overall?: number | null
  comment?: string | null
  pqrsId: number
  createdAt?: string | null
}

export interface TypePQRSF {
  id: number
  name: string
}

export interface PQRSStatus {
  id: number
  name: string
}

// auth
export interface Role {
  id: number
  name: string
  description?: string | null
  createdAt?: string | null
}

export interface User {
  id: number
  email: string
  name?: string | null
  image?: string | null
  phoneNumber?: string | null
  isActive?: boolean
  emailVerified?: boolean
  twoFactorEnabled?: boolean
  lastLogin?: string | null
  createdAt?: string | null
  updatedAt?: string | null
  roleId: number
}

export interface Session {
  id: number
  token: string
  expiresAt: string
  ipAddress?: string | null
  userAgent?: string | null
  createdAt?: string | null
  updatedAt?: string | null
  userId: number
}

export interface Account {
  id: number
  provider: string
  providerAccountId: string
  refreshToken?: string | null
  accessToken?: string | null
  expiresAt?: number | null
  tokenType?: string | null
  scope?: string | null
  idToken?: string | null
  sessionState?: string | null
  userId: number
}

// Tipos para crear/actualizar (sin campos auto-generados)
export type CreateMessageStorage = Omit<MessageStorage, "id" | "created_at" | "updated_at">
export type UpdateMessageStorage = Partial<Omit<MessageStorage, "id" | "created_at" | "updated_at">>

export type CreateMessage = Omit<Message, "id" | "createdAt">
export type UpdateMessage = Partial<Omit<Message, "id" | "createdAt">>

export type CreateSummary = Omit<Summary, "id" | "created_at" | "updated_at">
export type UpdateSummary = Partial<Omit<Summary, "id" | "created_at" | "updated_at">>

export type CreateChat = Omit<Chat, "id">
export type UpdateChat = Partial<Omit<Chat, "id">>

export type CreateArea = Omit<Area, "id">
export type UpdateArea = Partial<Omit<Area, "id">>

export type CreateResponsible = Omit<Responsible, "id">
export type UpdateResponsible = Partial<Omit<Responsible, "id">>

export type CreatePQRSFAnalysis = Omit<PQRSFAnalysis, "id" | "createdAt">
export type UpdatePQRSFAnalysis = Partial<Omit<PQRSFAnalysis, "id" | "createdAt">>

export type CreatePQRSFReanalysis = Omit<PQRSFReanalysis, "id" | "createdAt">
export type UpdatePQRSFReanalysis = Partial<Omit<PQRSFReanalysis, "id" | "createdAt">>

export type CreateDBUser = Omit<DBUser, "id" | "createdAt" | "updatedAt">
export type UpdateDBUser = Partial<Omit<DBUser, "id" | "createdAt" | "updatedAt">>

export type CreateTypePerson = Omit<TypePerson, "id">
export type UpdateTypePerson = Partial<Omit<TypePerson, "id">>

export type CreateStateHolder = Omit<StateHolder, "id">
export type UpdateStateHolder = Partial<Omit<StateHolder, "id">>

export type CreateDBPQRSF = Omit<DBPQRSF, "id" | "createdAt" | "updatedAt">
export type UpdateDBPQRSF = Partial<Omit<DBPQRSF, "id" | "createdAt" | "updatedAt">>

export type CreatePQRSFSurvey = Omit<PQRSFSurvey, "id" | "createdAt">
export type UpdatePQRSFSurvey = Partial<Omit<PQRSFSurvey, "id" | "createdAt">>

export type CreateTypePQRSF = Omit<TypePQRSF, "id">
export type UpdateTypePQRSF = Partial<Omit<TypePQRSF, "id">>

export type CreatePQRSStatus = Omit<PQRSStatus, "id">
export type UpdatePQRSStatus = Partial<Omit<PQRSStatus, "id">>
export interface MessageLegacy {
  id: number
  id_storage: number
  id_chat: number
  sender_type: "cliente" | "sistema" | "responsable"
  content?: string | null
  media_url?: string | null
  message_type?: "text" | "image" | "file" | "audio" | null
  sent_at?: string | null
  created_at?: string | null
  updated_at?: string | null
  created_by?: number | null
  updated_by?: number | null
}
