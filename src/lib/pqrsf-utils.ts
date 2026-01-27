import type { CerradaItem, SeguimientoItem } from "@/services/pqrsf.service"
import type { UnifiedPQRSFItem } from "@/components/PQRSFCard"

/**
 * Calcula el promedio de las calificaciones de una encuesta
 */
export function computeAvgScore(item: SeguimientoItem | CerradaItem): number | null {
  const scores = [
    item.q1Clarity,
    item.q2Timeliness,
    item.q3Quality,
    item.q4Attention,
    item.q5Overall,
  ].filter((value) => typeof value === "number") as number[]
  
  if (scores.length === 0) return null
  return scores.reduce((sum, value) => sum + value, 0) / scores.length
}

/**
 * Calcula la satisfacción del cliente basada en el promedio de calificaciones
 */
export function calculateSatisfaction(avgScore: number | null, surveyComment?: string | null): string | null {
  if (avgScore !== null) {
    if (avgScore >= 4) return "Muy Satisfecho"
    if (avgScore >= 3) return "Satisfecho"
    return "Insatisfecho"
  }
  if (surveyComment) return "Satisfecho"
  return null
}

/**
 * Calcula los días de respuesta entre dos fechas
 */
export function calculateResponseDays(createdAt: string | null, responseSentAt: string | null): number | null {
  if (!createdAt || !responseSentAt) return null
  const created = new Date(createdAt)
  const response = new Date(responseSentAt)
  if (Number.isNaN(created.getTime()) || Number.isNaN(response.getTime())) return null
  return Math.max(0, Math.round((response.getTime() - created.getTime()) / 86400000))
}

/**
 * Calcula los días transcurridos desde una fecha
 */
export function calculateDaysElapsed(createdAt: string | null): number {
  if (!createdAt) return 0
  const created = new Date(createdAt)
  if (Number.isNaN(created.getTime())) return 0
  return Math.max(0, Math.floor((Date.now() - created.getTime()) / 86400000))
}

/**
 * Calcula la prioridad basada en días transcurridos
 */
export function calculatePriorityByDays(daysOpen: number): "Alta" | "Media" | "Baja" {
  if (daysOpen >= 10) return "Alta"
  if (daysOpen >= 5) return "Media"
  return "Baja"
}

/**
 * Calcula la prioridad basada en dueDate o createdAt
 */
export function calculatePriority(dueDate?: string | null, createdAt?: string | null): "Alta" | "Media" | "Baja" {
  const DAY_MS = 1000 * 60 * 60 * 24
  
  if (dueDate) {
    const due = new Date(dueDate)
    if (!Number.isNaN(due.getTime())) {
      const diffDays = Math.ceil((due.getTime() - Date.now()) / DAY_MS)
      if (diffDays <= 2) return "Alta"
      if (diffDays <= 5) return "Media"
      return "Baja"
    }
  }
  
  if (createdAt) {
    const created = new Date(createdAt)
    if (!Number.isNaN(created.getTime())) {
      const elapsed = Math.floor((Date.now() - created.getTime()) / DAY_MS)
      if (elapsed >= 10) return "Alta"
      if (elapsed >= 5) return "Media"
      return "Baja"
    }
  }
  
  return "Media"
}

/**
 * Obtiene las páginas visibles para la paginación
 */
export function getVisiblePages(currentPage: number, totalPages: number, windowSize: number = 5): number[] {
  if (totalPages <= windowSize) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  let start = currentPage - Math.floor(windowSize / 2)
  let end = start + windowSize - 1

  if (start < 1) {
    start = 1
    end = windowSize
  }

  if (end > totalPages) {
    end = totalPages
    start = totalPages - windowSize + 1
  }

  return Array.from({ length: windowSize }, (_, i) => start + i)
}
