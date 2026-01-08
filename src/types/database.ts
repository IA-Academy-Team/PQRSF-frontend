// Tipos basados en el ERD de la base de datos

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
  id_storage: number
  id_chat: number
  sender_type: 'cliente' | 'sistema' | 'responsable'
  content?: string | null
  media_url?: string | null
  message_type?: 'text' | 'image' | 'file' | 'audio' | null
  sent_at?: string | null
  created_at?: string | null
  updated_at?: string | null
  created_by?: number | null
  updated_by?: number | null
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
  id_user?: number | null
  id_area?: number | null
  status?: 'activo' | 'cerrado' | 'en_espera' | null
  created_at?: string | null
  updated_at?: string | null
  created_by?: number | null
  updated_by?: number | null
}

export interface Area {
  id: number
  name: string
  code?: string | null
}

export interface Responsible {
  id: number
  name?: string | null
  email?: string | null
  phoneNumber?: string | null
  id_area?: number | null
  created_at?: string | null
  updated_at?: string | null
  created_by?: number | null
  updated_by?: number | null
}

export interface PQRSFAnalysis {
  id: number
  id_pqrsf: number
  id_responsible: number
  id_reanalysis?: number | null
  answer?: string | null
  action_taken?: string | null
  created_at?: string | null
  updated_at?: string | null
  created_by?: number | null
  updated_by?: number | null
}

export interface PQRSFReanalysis {
  id: number
  analysis_notes?: string | null
  action_taken?: string | null
  created_at?: string | null
  updated_at?: string | null
  created_by?: number | null
  updated_by?: number | null
}

export interface DBUser {
  id: number
  name?: string | null
  email?: string | null
  phone?: string | null
  id_type_person?: number | null
  id_state_holder?: number | null
  created_at?: string | null
  updated_at?: string | null
  created_by?: number | null
  updated_by?: number | null
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
  radicado_code: string
  id_user: number
  id_type_pqrsf: number
  id_chat: number
  id_status?: number | null
  description?: string | null
  due_date?: string | null
  created_at?: string | null
  updated_at?: string | null
  created_by?: number | null
  updated_by?: number | null
}

export interface PQRSFSurvey {
  id: number
  id_pqrsf: number
  Q1?: number | null
  Q2?: number | null
  Q3?: number | null
  Q4?: number | null
  Q5?: number | null
  comments?: string | null
  created_at?: string | null
  updated_at?: string | null
  created_by?: number | null
  updated_by?: number | null
}

export interface TypePQRSF {
  id: number
  name: string
}

export interface PQRSStatus {
  id: number
  name: string
}

// Tipos para crear/actualizar (sin campos auto-generados)
export type CreateMessageStorage = Omit<MessageStorage, 'id' | 'created_at' | 'updated_at'>
export type UpdateMessageStorage = Partial<Omit<MessageStorage, 'id' | 'created_at' | 'updated_at'>>

export type CreateMessage = Omit<Message, 'id' | 'created_at' | 'updated_at'>
export type UpdateMessage = Partial<Omit<Message, 'id' | 'created_at' | 'updated_at'>>

export type CreateSummary = Omit<Summary, 'id' | 'created_at' | 'updated_at'>
export type UpdateSummary = Partial<Omit<Summary, 'id' | 'created_at' | 'updated_at'>>

export type CreateChat = Omit<Chat, 'id' | 'created_at' | 'updated_at'>
export type UpdateChat = Partial<Omit<Chat, 'id' | 'created_at' | 'updated_at'>>

export type CreateArea = Omit<Area, 'id'>
export type UpdateArea = Partial<Omit<Area, 'id'>>

export type CreateResponsible = Omit<Responsible, 'id' | 'created_at' | 'updated_at'>
export type UpdateResponsible = Partial<Omit<Responsible, 'id' | 'created_at' | 'updated_at'>>

export type CreatePQRSFAnalysis = Omit<PQRSFAnalysis, 'id' | 'created_at' | 'updated_at'>
export type UpdatePQRSFAnalysis = Partial<Omit<PQRSFAnalysis, 'id' | 'created_at' | 'updated_at'>>

export type CreatePQRSFReanalysis = Omit<PQRSFReanalysis, 'id' | 'created_at' | 'updated_at'>
export type UpdatePQRSFReanalysis = Partial<Omit<PQRSFReanalysis, 'id' | 'created_at' | 'updated_at'>>

export type CreateDBUser = Omit<DBUser, 'id' | 'created_at' | 'updated_at'>
export type UpdateDBUser = Partial<Omit<DBUser, 'id' | 'created_at' | 'updated_at'>>

export type CreateTypePerson = Omit<TypePerson, 'id'>
export type UpdateTypePerson = Partial<Omit<TypePerson, 'id'>>

export type CreateStateHolder = Omit<StateHolder, 'id'>
export type UpdateStateHolder = Partial<Omit<StateHolder, 'id'>>

export type CreateDBPQRSF = Omit<DBPQRSF, 'id' | 'created_at' | 'updated_at'>
export type UpdateDBPQRSF = Partial<Omit<DBPQRSF, 'id' | 'created_at' | 'updated_at'>>

export type CreatePQRSFSurvey = Omit<PQRSFSurvey, 'id' | 'created_at' | 'updated_at'>
export type UpdatePQRSFSurvey = Partial<Omit<PQRSFSurvey, 'id' | 'created_at' | 'updated_at'>>

export type CreateTypePQRSF = Omit<TypePQRSF, 'id'>
export type UpdateTypePQRSF = Partial<Omit<TypePQRSF, 'id'>>

export type CreatePQRSStatus = Omit<PQRSStatus, 'id'>
export type UpdatePQRSStatus = Partial<Omit<PQRSStatus, 'id'>>
