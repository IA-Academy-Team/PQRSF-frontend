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
    <Card className="p-5 hover:shadow-md transition-shadow h-full flex flex-col">
      <div className="flex items-start justify-between gap-4 flex-1 min-h-0">
        <div className="flex-1 min-w-0 space-y-3 flex flex-col">
          {/* Badges: Radicado, Tipo, Estado, Prioridad */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <span className="text-xs font-mono text-muted-foreground">{item.ticketNumber}</span>
            <Badge variant="outline" className={`text-xs font-medium ${getTypeColor(item.typeName)}`}>
              {item.typeName}
            </Badge>
            <Badge variant="outline" className={`text-xs font-medium capitalize ${getStatusStyle(item.statusName)}`}>
              {item.statusName}
            </Badge>
            {showPriority && item.priority && (
              <Badge variant="outline" className={`text-xs font-medium ${getPriorityColor(item.priority)}`}>
                Prioridad {item.priority}
              </Badge>
            )}
          </div>

          {/* Descripción */}
          <h3 className="font-medium text-foreground leading-snug line-clamp-2 flex-1 min-h-10">
            {item.description || "Sin descripción"}
          </h3>

          {/* Información del solicitante y área - SIEMPRE VISIBLE */}
          <div className="flex flex-col gap-2 text-sm text-muted-foreground shrink-0">
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{item.clientName || "Sin nombre"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{item.areaName}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span>{fechaRadicacion || "Sin fecha"}</span>
            </div>

            {/* Fecha de respuesta - SIEMPRE VISIBLE (vacío si no hay) */}
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 shrink-0 text-green-600" />
              <span className={fechaRespuesta ? "text-green-600" : "text-muted-foreground"}>
                {fechaRespuesta ? `Respondido: ${fechaRespuesta}` : "Sin respuesta"}
              </span>
            </div>

            {/* Tiempo de respuesta - SIEMPRE VISIBLE (vacío si no hay) */}
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 shrink-0 text-blue-600" />
              <span className={item.responseTime ? "text-blue-600" : "text-muted-foreground"}>
                {item.responseTime || "Sin tiempo registrado"}
              </span>
            </div>

            {/* Satisfacción del cliente - SIEMPRE VISIBLE (vacío si no hay) */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-foreground shrink-0">Satisfacción:</span>
              <span
                className={`text-xs font-medium ${
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

        {/* Botón de acción */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Link to={linkTo}>
              <Button variant="ghost" size="sm" className="shrink-0">
                <ArrowUpRight className="h-4 w-4" />
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
