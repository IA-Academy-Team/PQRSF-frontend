// Exportar todos los servicios desde un solo punto
export { api, HttpError, API_BASE } from '@/lib/api'
export { pqrsfService } from './pqrsf.service'
export { chatService } from './chat.service'
export { userService } from './user.service'
export { areaService } from './area.service'
export { catalogService } from './catalog.service'
export { dashboardService } from './dashboard.service'

// Exportar tipos
export * from '@/types/database'
