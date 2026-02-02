import type { SeguimientoItem, CerradaItem, ApelacionItem } from "@/services/pqrsf.service"
import type { PQRSFSurveyDetailed } from "@/types/database"
import type { AreaPendingItem, AreaAppealItem } from "@/services/dashboard.service"
import type { UnifiedPQRSFItem } from "@/components/PQRSFCard"
import {
  computeAvgScore,
  calculateSatisfaction,
  calculateResponseDays,
  calculateDaysElapsed,
  calculatePriorityByDays,
  calculatePriority,
} from "./pqrsf-utils"

/** Obtiene la descripción del ítem; soporta API con 'description' o 'descripcion' (en raíz o en item.pqrs). Exportada para uso en listados. */
export function getDescription(item: {
  description?: string | null
  descripcion?: string | null
  pqrs?: { description?: string | null; descripcion?: string | null }
}): string | null {
  const d =
    item.description ??
    item.descripcion ??
    item.pqrs?.description ??
    item.pqrs?.descripcion
  return d == null ? null : String(d)
}

/**
 * Transforma un SeguimientoItem a UnifiedPQRSFItem
 */
export function transformSeguimientoItem(item: SeguimientoItem): UnifiedPQRSFItem {
  const avgScore = computeAvgScore(item)
  const satisfaccion = calculateSatisfaction(avgScore, item.surveyComment)
  const responseDays = calculateResponseDays(item.createdAt, item.responseSentAt)

  return {
    id: item.id,
    ticketNumber: item.ticketNumber,
    typeName: item.typeName,
    statusName: item.statusName,
    description: getDescription(item),
    clientName: item.clientName,
    areaName: item.areaName,
    createdAt: item.createdAt,
    priority: null,
    responseSentAt: item.responseSentAt,
    updatedAt: null,
    daysElapsed: null,
    responseTime: responseDays !== null ? `${responseDays} días` : null,
    satisfaction: satisfaccion,
    dueDate: null,
  }
}

/**
 * Transforma un CerradaItem a UnifiedPQRSFItem
 */
export function transformCerradaItem(item: CerradaItem): UnifiedPQRSFItem {
  const avgScore = computeAvgScore(item)
  const satisfaccion = calculateSatisfaction(avgScore, item.surveyComment)
  const responseDays = calculateResponseDays(item.createdAt, item.updatedAt)

  return {
    id: item.id,
    ticketNumber: item.ticketNumber,
    typeName: item.typeName,
    statusName: item.statusName,
    description: getDescription(item),
    clientName: item.clientName,
    areaName: item.areaName,
    createdAt: item.createdAt,
    priority: null,
    responseSentAt: item.responseSentAt,
    updatedAt: item.updatedAt,
    daysElapsed: null,
    responseTime: responseDays !== null ? `${responseDays} días` : null,
    satisfaction: satisfaccion,
    dueDate: null,
  }
}

/**
 * Transforma un ApelacionItem a UnifiedPQRSFItem
 */
export function transformApelacionItem(item: ApelacionItem): UnifiedPQRSFItem {
  const daysOpen = calculateDaysElapsed(item.createdAt ?? null)
  const prioridad = calculatePriorityByDays(daysOpen)

  return {
    id: item.id,
    ticketNumber: item.ticketNumber,
    typeName: item.typeName,
    statusName: item.statusName,
    description: getDescription(item),
    clientName: item.clientName,
    areaName: item.areaName,
    createdAt: item.createdAt,
    priority: prioridad,
    responseSentAt: item.responseSentAt,
    updatedAt: null,
    daysElapsed: daysOpen,
    responseTime: null,
    satisfaction: null,
    dueDate: null,
  }
}

/**
 * Transforma un AreaPendingItem a UnifiedPQRSFItem
 */
export function transformAreaPendingItem(item: AreaPendingItem): UnifiedPQRSFItem {
  const daysElapsed = calculateDaysElapsed(item.createdAt ?? null)
  const priority = calculatePriority(item.dueDate, item.createdAt)
  
  return {
    id: item.id,
    ticketNumber: item.ticketNumber,
    typeName: item.typeName,
    statusName: "Pendiente",
    description: item.description || null,
    clientName: item.clientName ?? null,
    areaName: item.areaName,
    createdAt: item.createdAt || null,
    priority,
    responseSentAt: item.responseSentAt || null,
    updatedAt: item.updatedAt || null,
    daysElapsed,
    responseTime: null,
    satisfaction: null,
    dueDate: item.dueDate || null,
  }
}

/**
 * Transforma un AreaAppealItem a UnifiedPQRSFItem (apelaciones del área del responsable)
 */
export function transformAreaAppealItem(item: AreaAppealItem): UnifiedPQRSFItem {
  const daysElapsed = calculateDaysElapsed(item.createdAt ?? null)
  const priority = calculatePriorityByDays(daysElapsed)
  return {
    id: item.id,
    ticketNumber: item.ticketNumber,
    typeName: item.typeName,
    statusName: "En apelación",
    description: item.description || null,
    clientName: item.clientName ?? null,
    areaName: item.areaName,
    createdAt: item.createdAt || null,
    priority,
    responseSentAt: item.responseSentAt || null,
    updatedAt: item.updatedAt || null,
    daysElapsed,
    responseTime: null,
    satisfaction: null,
    dueDate: item.dueDate || null,
  }
}

/**
 * Transforma un PQRSFSurveyDetailed a UnifiedPQRSFItem
 */
export function transformSurveyItem(item: PQRSFSurveyDetailed): UnifiedPQRSFItem {
  const avgScore = (() => {
    const values = [
      item.q1Clarity,
      item.q2Timeliness,
      item.q3Quality,
      item.q4Attention,
      item.q5Overall,
    ].filter((value): value is number => typeof value === "number")
    if (values.length === 0) return null
    return values.reduce((sum, value) => sum + value, 0) / values.length
  })()

  const satisfaccion = calculateSatisfaction(avgScore, item.comment)
  const createdAtDate = item.pqrsCreatedAt ? new Date(item.pqrsCreatedAt) : null
  const responseSentAtDate = item.pqrsUpdatedAt ? new Date(item.pqrsUpdatedAt) : null
  const responseDays = createdAtDate && responseSentAtDate
    ? Math.max(0, Math.round((responseSentAtDate.getTime() - createdAtDate.getTime()) / 86400000))
    : null

  return {
    id: item.id,
    ticketNumber: item.ticketNumber,
    typeName: item.typeName,
    statusName: item.statusName,
    description: item.comment || null,
    clientName: item.clientName ?? null,
    areaName: item.areaName,
    createdAt: item.pqrsCreatedAt ?? null,
    priority: null,
    responseSentAt: item.pqrsUpdatedAt ?? null,
    updatedAt: item.pqrsUpdatedAt ?? null,
    daysElapsed: null,
    responseTime: responseDays !== null ? `${responseDays} días` : null,
    satisfaction: satisfaccion,
    dueDate: null,
  }
}
