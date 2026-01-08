export type UserRole = "Administrador" | "Usuario de Área Responsable"

export type UserArea = "Administración del Sistema" | "Área Responsable (Operativa)"

export type PQRSFStatus = "nueva" | "en_analisis" | "analizada" | "respondida" | "apelada" | "cerrada" | "rechazada"

export type PQRSFType = "Petición" | "Queja" | "Reclamo" | "Sugerencia" | "Felicitación"

export interface User {
  id: string
  nombre: string
  correo: string
  password: string
  rol: UserRole
  area?: UserArea
  cargo?: string
  estado: "activo" | "inactivo"
  createdAt: Date
  updatedAt: Date
}

export interface AuthUser {
  id: string
  nombre: string
  correo: string
  rol: UserRole
  area?: UserArea
}

export interface PQRSF {
  id: string
  radicado: string
  tipo: PQRSFType
  descripcion: string
  solicitante: {
    nombre: string
    codigo?: string
    tipo: "Persona Natural" | "Anónimo"
  }
  area: string
  estado: PQRSFStatus
  prioridad: "alta" | "media" | "baja"
  fechaRadicacion: string
  fechaLimite: string
  analisis?: string
  evidencias?: Array<{ nombre: string; url: string }>
  historial: Array<{
    fecha: string
    accion: string
    usuario: string
    detalle: string
  }>
}

export interface Cargo {
  id: string
  nombre: string
  descripcion: string
  menuOptions: string[]
  actions: string[]
  estado: "activo" | "inactivo"
  createdAt: Date
  updatedAt: Date
}

export interface Chat {
  id: string
  pqrsfId: string
  radicado: string
  cliente: string
  mensajes: Array<{
    id: string
    sender: "cliente" | "sistema"
    mensaje: string
    timestamp: string
  }>
  ultimaActividad: string
}
