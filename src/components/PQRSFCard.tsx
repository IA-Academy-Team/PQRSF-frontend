import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Link } from "react-router-dom"
import { User, Building2, Calendar, Clock, CheckCircle, ArrowUpRight } from "lucide-react"

export interface UnifiedPQRSFItem {
  id: number
  ticketNumber: string
  typeName: string
  statusName: string
  description: string | null
  clientName: string | null
  areaName: string
  createdAt: string | null
  // Campos opcionales
  priority?: "Alta" | "Media" | "Baja" | null
  responseSentAt?: string | null
  updatedAt?: string | null
  daysElapsed?: number | null
  responseTime?: string | null
  satisfaction?: string | null
  dueDate?: string | null
}

interface PQRSFCardProps {
  item: UnifiedPQRSFItem
  actionLabel?: string
  actionLink?: string
  showPriority?: boolean
}

const getTypeColor = (type: string) => {
  switch (type) {
    case "Petición":
      return "bg-blue-50 text-blue-700 border-blue-200"
    case "Queja":
      return "bg-red-50 text-red-700 border-red-200"
    case "Reclamo":
      return "bg-orange-50 text-orange-700 border-orange-200"
    case "Sugerencia":
      return "bg-green-50 text-green-700 border-green-200"
    case "Felicitación":
      return "bg-purple-50 text-purple-700 border-purple-200"
    default:
      return "bg-gray-50 text-gray-700 border-gray-200"
  }
}

const getPriorityColor = (priority?: string | null) => {
  switch (priority) {
    case "Alta":
      return "bg-red-100 text-red-700"
    case "Media":
      return "bg-yellow-100 text-yellow-700"
    case "Baja":
      return "bg-green-100 text-green-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

const getStatusStyle = (status: string) => {
  const statusLower = status.toLowerCase()
  if (statusLower.includes("radicado")) return "bg-amber-50 text-amber-700 border-amber-200"
  if (statusLower.includes("analisis") || statusLower.includes("análisis")) return "bg-blue-50 text-blue-700 border-blue-200"
  if (statusLower.includes("reanálisis") || statusLower.includes("reanalisis")) return "bg-red-50 text-red-700 border-red-200"
  if (statusLower.includes("devuelto")) return "bg-orange-50 text-orange-700 border-orange-200"
  if (statusLower.includes("cerrado")) return "bg-emerald-50 text-emerald-700 border-emerald-200"
  return "bg-gray-50 text-gray-700 border-gray-200"
}

const formatDate = (date: string | null | undefined) => {
  if (!date) return null
  try {
    return new Date(date).toLocaleDateString("es-CO")
  } catch {
    return null
  }
}

export function PQRSFCard({
  item,
  actionLabel = "Ver Detalle",
  actionLink,
  showPriority = false,
}: PQRSFCardProps) {
  const fechaRadicacion = formatDate(item.createdAt)
  const fechaRespuesta = formatDate(item.responseSentAt || item.updatedAt)
  const linkTo = actionLink || `/pqrsf/${item.id}`

  return (
    <Card className="h-full max-h-[70vh] flex flex-col min-h-0 overflow-hidden p-[clamp(0.5rem,4cqw,2.5rem)] max-md:p-3 hover:shadow-md transition-shadow @container-[size]">
      <div className="flex items-start justify-between gap-[clamp(0.35rem,2.5cqw,1.75rem)] max-md:gap-2 flex-1 min-h-0 overflow-hidden">
        <div className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden space-y-[clamp(0.2rem,1.5cqh,1.25rem)] max-md:space-y-1.5">
          {/* Badges: desktop sin cambios; móvil wrap + tipografía más pequeña */}
          <div className="flex items-center gap-[clamp(0.2rem,1.2cqw,1rem)] flex-nowrap min-w-0 overflow-hidden max-md:flex-wrap max-md:gap-1">
            <span className="font-mono text-muted-foreground truncate min-w-0 flex-1 text-[clamp(0.6rem,3.5cqw,1.375rem)] max-md:text-[0.65rem] max-md:break-all">{item.ticketNumber}</span>
            <Badge variant="outline" className={`shrink-0 font-medium text-[clamp(0.6rem,3.5cqw,1.375rem)] max-md:text-[0.65rem] whitespace-nowrap ${getTypeColor(item.typeName)}`}>
              {item.typeName}
            </Badge>
            <Badge variant="outline" className={`shrink-0 font-medium text-[clamp(0.6rem,3.5cqw,1.375rem)] max-md:text-[0.65rem] capitalize whitespace-nowrap ${getStatusStyle(item.statusName)}`}>
              {item.statusName}
            </Badge>
            {showPriority && item.priority && (
              <Badge variant="outline" className={`shrink-0 font-medium text-[clamp(0.6rem,3.5cqw,1.375rem)] max-md:text-[0.65rem] whitespace-nowrap ${getPriorityColor(item.priority)}`}>
                Prioridad {item.priority}
              </Badge>
            )}
          </div>

          {/* Descripción: desktop sin cambios; móvil texto más pequeño, más líneas, wrap */}
          <h3 className="font-medium text-foreground leading-snug line-clamp-2 flex-1 min-h-0 overflow-hidden text-[clamp(0.7rem,4cqw,1.75rem)] max-md:text-[0.7rem] max-md:line-clamp-4 max-md:wrap-break-word">
            {item.description || "Sin descripción"}
          </h3>

          {/* Información: desktop sin cambios; móvil tipografía más pequeña y wrap nombre/área */}
          <div className="flex flex-col gap-[clamp(0.15rem,1cqh,1rem)] max-md:gap-0.5 text-[clamp(0.6rem,3.5cqw,1.375rem)] max-md:text-[0.65rem] text-muted-foreground shrink-0">
            <div className="flex items-center gap-[clamp(0.2rem,1.2cqw,1rem)] max-md:gap-1 max-md:min-w-0">
              <User className="h-[clamp(0.65rem,4cqh,1.75rem)] w-[clamp(0.65rem,4cqh,1.75rem)] max-md:h-3 max-md:w-3 shrink-0" />
              <span className="truncate max-md:overflow-visible max-md:whitespace-normal max-md:wrap-break-word max-md:min-w-0">{item.clientName || "Sin nombre"}</span>
            </div>
            <div className="flex items-center gap-[clamp(0.2rem,1.2cqw,1rem)] max-md:gap-1 max-md:min-w-0">
              <Building2 className="h-[clamp(0.65rem,4cqh,1.75rem)] w-[clamp(0.65rem,4cqh,1.75rem)] max-md:h-3 max-md:w-3 shrink-0" />
              <span className="truncate max-md:overflow-visible max-md:whitespace-normal max-md:wrap-break-word max-md:min-w-0">{item.areaName}</span>
            </div>
            <div className="flex items-center gap-[clamp(0.2rem,1.2cqw,1rem)] max-md:gap-1 max-md:min-w-0">
              <Calendar className="h-[clamp(0.65rem,4cqh,1.75rem)] w-[clamp(0.65rem,4cqh,1.75rem)] max-md:h-3 max-md:w-3 shrink-0" />
              <span>{fechaRadicacion || "Sin fecha"}</span>
            </div>

            {/* Fecha de respuesta - SIEMPRE VISIBLE (vacío si no hay) */}
            <div className="flex items-center gap-[clamp(0.2rem,1.2cqw,1rem)] max-md:gap-1 max-md:min-w-0">
              <CheckCircle className="h-[clamp(0.65rem,4cqh,1.75rem)] w-[clamp(0.65rem,4cqh,1.75rem)] max-md:h-3 max-md:w-3 shrink-0 text-green-600" />
              <span className={fechaRespuesta ? "text-green-600" : "text-muted-foreground"}>{fechaRespuesta ? `Respondido: ${fechaRespuesta}` : "Sin respuesta"}</span>
            </div>

            {/* Tiempo de respuesta - SIEMPRE VISIBLE (vacío si no hay) */}
            <div className="flex items-center gap-[clamp(0.2rem,1.2cqw,1rem)] max-md:gap-1 max-md:min-w-0">
              <Clock className="h-[clamp(0.65rem,4cqh,1.75rem)] w-[clamp(0.65rem,4cqh,1.75rem)] max-md:h-3 max-md:w-3 shrink-0 text-blue-600" />
              <span className={item.responseTime ? "text-blue-600" : "text-muted-foreground"}>{item.responseTime || "Sin tiempo registrado"}</span>
            </div>

            {/* Satisfacción del cliente - SIEMPRE VISIBLE (vacío si no hay) */}
            <div className="flex items-center gap-[clamp(0.2rem,1.2cqw,1rem)] max-md:gap-1 max-md:min-w-0 max-md:flex-wrap">
              <span className="font-semibold text-foreground shrink-0 text-[clamp(0.6rem,3.5cqw,1.375rem)] max-md:text-[0.65rem]">Satisfacción:</span>
              <span
                className={`font-medium text-[clamp(0.6rem,3.5cqw,1.375rem)] max-md:text-[0.65rem] max-md:wrap-break-word ${
                  item.satisfaction
                    ? ["Satisfecho", "Muy Satisfecho"].includes(item.satisfaction)
                      ? "text-green-700"
                      : "text-red-700"
                    : "text-muted-foreground"
                }`}
              >
                {item.satisfaction || "Sin evaluación"}
              </span>
            </div>
          </div>
        </div>

        {/* Botón de acción: desktop sin cambios; móvil más pequeño */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Link to={linkTo}>
              <Button variant="ghost" size="sm" className="shrink-0 size-[clamp(1.5rem,7cqh,3rem)] max-md:size-6 p-0">
                <ArrowUpRight className="h-[clamp(0.75rem,4cqh,1.75rem)] w-[clamp(0.75rem,4cqh,1.75rem)] max-md:h-3 max-md:w-3" />
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            {actionLabel}
          </TooltipContent>
        </Tooltip>
      </div>
    </Card>
  )
}
