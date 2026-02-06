import {
  ArrowUpRight,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ClipboardList,
  MessageCircle,
  Star,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sidebar } from "@/components/sidebar"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/auth-context"
import { useSidebar } from "@/contexts/sidebar-context"
import { useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import {
  dashboardService,
  type AdminChat,
  type AdminMetrics,
  type AreaAppealItem,
  type AreaMetrics,
  type AreaPendingItem,
} from "@/services/dashboard.service"
import { areaService } from "@/services/area.service"
import { surveyService, getSurveyOverallAverage } from "@/services/survey.service"
import { HttpError } from "@/lib/api"

export default function Dashboard() {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()
  const { isCollapsed } = useSidebar()
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null)
  const [chats, setChats] = useState<AdminChat[]>([])
  const [isDashboardLoading, setIsDashboardLoading] = useState(false)
  const [dashboardError, setDashboardError] = useState("")
  const [areaMetrics, setAreaMetrics] = useState<AreaMetrics | null>(null)
  const [areaPending, setAreaPending] = useState<AreaPendingItem[]>([])
  const [areaAppeals, setAreaAppeals] = useState<AreaAppealItem[]>([])
  const [areaName, setAreaName] = useState("")
  const [areaError, setAreaError] = useState("")
  const [isAreaLoading, setIsAreaLoading] = useState(false)
  const [surveyOverallAverage, setSurveyOverallAverage] = useState<number | null>(null)
  const [isSurveyAverageLoading, setIsSurveyAverageLoading] = useState(false)
  const chatItems = useMemo(() => {
    const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" })
    const formatRelative = (value?: string | null) => {
      if (!value) return "Sin actividad"
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) return "Sin actividad"
      const diffMs = date.getTime() - Date.now()
      const diffMinutes = Math.round(diffMs / 60000)
      if (Math.abs(diffMinutes) < 60) return rtf.format(diffMinutes, "minute")
      const diffHours = Math.round(diffMinutes / 60)
      if (Math.abs(diffHours) < 24) return rtf.format(diffHours, "hour")
      const diffDays = Math.round(diffHours / 24)
      return rtf.format(diffDays, "day")
    }

    return chats.map((chat) => ({
      radicado: chat.ticketNumber || `CHAT-${chat.chatId}`,
      cliente: chat.clientName || "Cliente",
      ultimoMensaje: chat.lastMessage || "Sin mensajes",
      fecha: formatRelative(chat.lastMessageAt),
    }))
  }, [chats])

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/")
    }
  }, [user, isLoading, navigate])

  useEffect(() => {
    if (!user || user.rol !== "Administrador") return

    let active = true
    const loadDashboard = async () => {
      setIsDashboardLoading(true)
      setDashboardError("")
      try {
        const [metricsResponse, chatsResponse] = await Promise.all([
          dashboardService.getAdminMetrics(),
          dashboardService.getAdminChats(),
        ])
        if (!active) return
        setMetrics(metricsResponse)
        setChats(chatsResponse)
      } catch (err) {
        if (!active) return
        console.error("[dashboard] admin load error", err)
        setDashboardError("No se pudo cargar el dashboard. Intenta nuevamente.")
      } finally {
        if (active) setIsDashboardLoading(false)
      }
    }

    void loadDashboard()
    return () => {
      active = false
    }
  }, [user])

  useEffect(() => {
    if (!user || user.rol !== "Administrador") return
    let active = true
    setIsSurveyAverageLoading(true)
    surveyService
      .listAdmin()
      .then((list) => {
        if (!active) return
        setSurveyOverallAverage(getSurveyOverallAverage(list))
      })
      .catch(() => {
        if (active) setSurveyOverallAverage(null)
      })
      .finally(() => {
        if (active) setIsSurveyAverageLoading(false)
      })
    return () => {
      active = false
    }
  }, [user])

  useEffect(() => {
    if (!user || user.rol !== "Usuario de Área Responsable") return

    let active = true
    const loadAreaDashboard = async () => {
      setIsAreaLoading(true)
      setAreaError("")
      try {
        const userId = Number(user.id)
        if (!userId) {
          throw new Error("Usuario inválido")
        }
        const responsable = await areaService.getResponsibleByUser(userId)
        if (!responsable.areaId) {
          throw new Error("No tienes un área asignada")
        }
        const [metricsResponse, pendingResponse, appealsResponse] = await Promise.all([
          dashboardService.getAreaMetrics(responsable.areaId),
          dashboardService.getAreaPending(responsable.areaId),
          dashboardService.getAreaAppeals(responsable.areaId),
        ])
        if (!active) return
        setAreaMetrics(metricsResponse)
        setAreaPending(pendingResponse)
        setAreaAppeals(appealsResponse)
        if (pendingResponse[0]?.areaName) {
          setAreaName(pendingResponse[0].areaName)
        } else if (appealsResponse[0]?.areaName) {
          setAreaName(appealsResponse[0].areaName)
        } else {
          const area = await areaService.getById(responsable.areaId)
          if (active) setAreaName(area.name)
        }
      } catch (err) {
        if (!active) return
        console.error("[dashboard] area load error", err)
        if (err instanceof HttpError && err.status === 404) {
          setAreaError("No tienes un área asignada. Contacta al administrador.")
        } else {
          setAreaError("No se pudo cargar el panel del área. Intenta nuevamente.")
        }
      } finally {
        if (active) setIsAreaLoading(false)
      }
    }

    void loadAreaDashboard()
    return () => {
      active = false
    }
  }, [user])

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (user.rol === "Administrador") {
    const getStatusCount = (statusId: number) =>
      metrics?.byStatus?.find((status) => status.statusId === statusId)?.count ?? 0
    const getAppealsCount = () =>
      (metrics?.byStatus ?? []).reduce((acc, item) => {
        if (item.statusId === 3 || item.statusId === 5) return acc + item.count
        return acc
      }, 0)
    const totalPqrs = metrics?.totalPqrs ?? 0
    const pqrsByType = metrics?.byType ?? []
    const avgResponseByArea = metrics?.avgResponseByArea ?? []
    const pqrsByTypeTotal = totalPqrs > 0 ? totalPqrs : 1

    return (
      <div className="flex min-h-screen bg-background max-md:overflow-visible md:h-screen md:overflow-hidden">
        <Sidebar />

        <main
          className={cn(
            "flex-1 p-4 sm:p-6 lg:p-8 min-[1600px]:p-10 pt-14 md:pt-4 flex flex-col transition-all duration-300",
            "max-md:min-h-screen max-md:overflow-y-auto max-md:h-auto md:h-screen md:overflow-hidden",
            isCollapsed ? "lg:ml-24" : "lg:ml-64"
          )}
        >
          <div className="mb-4 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl min-[1600px]:text-5xl font-bold text-foreground mb-2 min-[1600px]:mb-3">Panel de Administración</h1>
              </div>
            </div>
          </div>


          {dashboardError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 min-[1600px]:p-4 text-sm min-[1600px]:text-base text-red-700">
              {dashboardError}
            </div>
          )}

          <div className="grid gap-3 md:gap-4 md:grid-cols-2 lg:gap-5 min-[1600px]:gap-6 max-md:flex-initial max-md:overflow-visible flex-1 min-h-0 overflow-hidden">
            {/* Columna Izquierda */}
            <div className="flex flex-col gap-3 md:gap-4 lg:gap-5 min-[1600px]:gap-6 max-md:min-h-0 max-md:overflow-visible min-h-0 overflow-hidden">
              {/* Fila 1: Cards de métricas */}
              <div className="grid gap-1.5 sm:gap-2 min-[1600px]:gap-3 grid-cols-1 sm:grid-cols-5 auto-rows-min min-h-20 shrink-0">
                <Link to="/pqrsf?tab=general&status=todos">
                  <Card className="border-blue-200 bg-blue-50 cursor-pointer hover:opacity-90 transition-opacity min-h-16 h-full w-full relative @container">
                    <span className="absolute top-1.5 left-2.5 text-[clamp(0.6rem,4.5cqw,1.4rem)] font-semibold text-muted-foreground z-10">Total</span>
                    <CardContent className="p-1.5 sm:p-2 min-[1600px]:p-2.5 h-full w-full flex items-center justify-center @container">
                      <div className="flex items-center justify-center gap-[10%]">
                        <div className="w-[28%] min-w-7 max-w-28 aspect-square flex items-center justify-center bg-blue-500/20 rounded-lg shrink-0">
                          <FileText className="h-[65%] w-[65%] text-blue-600" />
                        </div>
                        <p className="text-[clamp(1rem,14cqw,3rem)] font-bold text-foreground min-w-0 overflow-visible whitespace-nowrap">
                          {isDashboardLoading ? "..." : totalPqrs}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                <Link to="/encuestas">
                  <Card className="border-amber-200 bg-amber-50 cursor-pointer hover:opacity-90 transition-opacity min-h-16 h-full w-full relative @container">
                    <span className="absolute top-1.5 left-2.5 text-[clamp(0.6rem,4.5cqw,1.4rem)] font-semibold text-muted-foreground z-10">Promedio</span>
                    <CardContent className="p-1.5 sm:p-2 min-[1600px]:p-2.5 h-full w-full flex items-center justify-center @container">
                      <div className="flex items-center justify-center gap-[10%]">
                        <div className="w-[28%] min-w-7 max-w-28 aspect-square flex items-center justify-center bg-amber-500/20 rounded-lg shrink-0">
                          <Star className="h-[65%] w-[65%] text-amber-600" />
                        </div>
                        <p className="text-[clamp(1rem,14cqw,3rem)] font-bold text-foreground min-w-0 overflow-visible whitespace-nowrap text-center">
                          {isDashboardLoading || isSurveyAverageLoading ? "..." : surveyOverallAverage !== null ? surveyOverallAverage.toFixed(1) : "Sin datos"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link to="/pqrsf?tab=seguimiento">
                  <Card className="border-orange-200 bg-orange-50 cursor-pointer hover:opacity-90 transition-opacity min-h-16 h-full w-full relative @container">
                    <span className="absolute top-1.5 left-2.5 text-[clamp(0.6rem,4.5cqw,1.4rem)] font-semibold text-muted-foreground z-10">Seguimiento</span>
                    <CardContent className="p-1.5 sm:p-2 min-[1600px]:p-2.5 h-full w-full flex items-center justify-center @container">
                      <div className="flex items-center justify-center gap-[10%]">
                        <div className="w-[28%] min-w-7 max-w-28 aspect-square flex items-center justify-center bg-orange-500/20 rounded-lg shrink-0">
                          <Clock className="h-[65%] w-[65%] text-orange-600" />
                        </div>
                        <p className="text-[clamp(1rem,14cqw,3rem)] font-bold text-foreground min-w-0 overflow-visible whitespace-nowrap">
                          {isDashboardLoading ? "..." : getStatusCount(2)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link to="/pqrsf?tab=apelacion">
                  <Card className="border-red-200 bg-red-50 cursor-pointer hover:opacity-90 transition-opacity min-h-16 h-full w-full relative @container">
                    <span className="absolute top-1.5 left-2.5 text-[clamp(0.6rem,4.5cqw,1.4rem)] font-semibold text-muted-foreground z-10">Apeladas</span>
                    <CardContent className="p-1.5 sm:p-2 min-[1600px]:p-2.5 h-full w-full flex items-center justify-center @container">
                      <div className="flex items-center justify-center gap-[10%]">
                        <div className="w-[28%] min-w-7 max-w-28 aspect-square flex items-center justify-center bg-red-500/20 rounded-lg shrink-0">
                          <AlertCircle className="h-[65%] w-[65%] text-red-600" />
                        </div>
                        <p className="text-[clamp(1rem,14cqw,3rem)] font-bold text-foreground min-w-0 overflow-visible whitespace-nowrap">
                          {isDashboardLoading ? "..." : getAppealsCount()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link to="/pqrsf?tab=cerradas">
                  <Card className="border-green-200 bg-green-50 cursor-pointer hover:opacity-90 transition-opacity min-h-16 h-full w-full relative @container">
                    <span className="absolute top-1.5 left-2.5 text-[clamp(0.6rem,4.5cqw,1.4rem)] font-semibold text-muted-foreground z-10">Cerradas</span>
                    <CardContent className="p-1.5 sm:p-2 min-[1600px]:p-2.5 h-full w-full flex items-center justify-center @container">
                      <div className="flex items-center justify-center gap-[10%]">
                        <div className="w-[28%] min-w-7 max-w-28 aspect-square flex items-center justify-center bg-green-500/20 rounded-lg shrink-0">
                          <CheckCircle2 className="h-[65%] w-[65%] text-green-600" />
                        </div>
                        <p className="text-[clamp(1rem,14cqw,3rem)] font-bold text-foreground min-w-0 overflow-visible whitespace-nowrap">
                          {isDashboardLoading ? "..." : getStatusCount(4)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>

              {/* Fila 2: Chats Recientes */}
              <div className="min-h-0 flex flex-1">
                <Card className="h-full w-full flex flex-col min-h-0">
                  <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 px-3 pt-3 pb-0 sm:px-4 sm:pt-4 sm:pb-0 min-[1600px]:px-6 min-[1600px]:pt-6 min-[1600px]:pb-0 shrink-0">
                    <CardTitle className="text-sm sm:text-base min-[1600px]:text-lg min-[1920px]:text-xl">Chats Recientes</CardTitle>
                    <Link to="/chats">
                      <Button variant="ghost" size="sm" className="w-full sm:w-auto text-xs min-[1600px]:text-sm">
                        <ArrowUpRight className="h-3 w-3 min-[1600px]:h-4 min-[1600px]:w-4 ml-1" />
                      </Button>
                    </Link>
                  </CardHeader>
                  <CardContent className="px-3 pt-0 pb-3 sm:px-4 sm:pt-0 sm:pb-4 min-[1600px]:px-6 min-[1600px]:pt-0 min-[1600px]:pb-6 flex-1 min-h-0 flex flex-col overflow-hidden">
                    <div className="flex flex-col flex-1 min-h-0 gap-2 sm:gap-2.5 min-[1600px]:gap-3">
                      {chatItems.length === 0 && !isDashboardLoading && (
                        <div className="text-xs min-[1600px]:text-sm text-muted-foreground">Sin chats recientes.</div>
                      )}
                      {(isDashboardLoading ? [] : chatItems.slice(0, 6)).map((chat, index) => (
                        <div
                          key={index}
                          className="flex min-h-12 flex-1 items-center justify-between gap-2 overflow-hidden rounded-lg border p-2 transition-colors hover:bg-muted/50 sm:p-2.5 min-[1600px]:p-3 @container-[size]"
                        >
                          <div className="flex min-w-0 flex-1 items-center gap-[clamp(0.5rem,2cqh,1.25rem)] min-[1600px]:gap-4 min-[1920px]:gap-5">
                            <MessageCircle className="h-4 w-4 shrink-0 text-primary min-[1600px]:h-5 min-[1600px]:w-5" />
                            <div className="min-w-0 flex-1 overflow-hidden">
                              <p className="truncate font-semibold text-xs min-[1600px]:text-sm">{chat.radicado}</p>
                              <p className="truncate text-[11px] text-muted-foreground min-[1600px]:text-xs">{chat.cliente}</p>
                              <p className="mt-0.5 line-clamp-2 text-[11px] min-[1600px]:text-xs">{chat.ultimoMensaje}</p>
                            </div>
                          </div>
                          <span className="ml-2 shrink-0 text-[11px] text-muted-foreground min-[1600px]:text-xs">{chat.fecha}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Columna Derecha */}
            <div className="flex flex-col gap-3 md:gap-4 lg:gap-5 min-[1600px]:gap-6 max-md:min-h-0 max-md:overflow-visible min-h-0 overflow-hidden">
              {/* Fila 1: PQRSF por Tipo */}
              <Card className="flex-1 min-h-0 flex flex-col">
                <CardHeader className="shrink-0 px-3 pt-3 pb-0 sm:px-4 sm:pt-4 sm:pb-0 min-[1600px]:px-6 min-[1600px]:pt-6 min-[1600px]:pb-0">
                  <CardTitle className="text-base sm:text-lg min-[1600px]:text-xl">PQRSF por Tipo</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 min-h-0 overflow-y-auto px-3 pt-0 pb-3 sm:px-4 sm:pt-0 sm:pb-4 min-[1600px]:px-6 min-[1600px]:pt-0 min-[1600px]:pb-6">
                  <div className="space-y-3 min-[1600px]:space-y-5">
                    {pqrsByType.length === 0 && !isDashboardLoading && (
                      <div className="text-sm min-[1600px]:text-base text-muted-foreground">Sin datos disponibles.</div>
                    )}
                    {(isDashboardLoading ? [] : pqrsByType).map((item) => {
                      const colorMap: Record<string, string> = {
                        Petición: "bg-blue-500",
                        Queja: "bg-red-500",
                        Reclamo: "bg-orange-500",
                        Sugerencia: "bg-green-500",
                        Felicitación: "bg-purple-500",
                      }
                      const color = colorMap[item.typeName] || "bg-gray-400"
                      return (
                        <div key={item.typeName} className="flex items-center gap-4 min-[1600px]:gap-5">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2 min-[1600px]:mb-3">
                              <span className="text-sm min-[1600px]:text-base font-medium">{item.typeName}</span>
                              <span className="text-sm min-[1600px]:text-base text-muted-foreground">{item.count}</span>
                            </div>
                            <div className="h-2 min-[1600px]:h-2.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full ${color}`}
                                style={{ width: `${(item.count / pqrsByTypeTotal) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Fila 2: Tiempo Promedio de Respuesta */}
              <Card className="flex-1 min-h-0 flex flex-col">
                <CardHeader className="shrink-0 px-3 pt-3 pb-0 sm:px-4 sm:pt-4 sm:pb-0 min-[1600px]:px-6 min-[1600px]:pt-6 min-[1600px]:pb-0">
                  <CardTitle className="text-base sm:text-lg min-[1600px]:text-xl">Tiempo Promedio de Respuesta</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 min-h-0 overflow-y-auto px-3 pt-0 pb-3 sm:px-4 sm:pt-0 sm:pb-4 min-[1600px]:px-6 min-[1600px]:pt-0 min-[1600px]:pb-6">
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 sm:gap-x-4 sm:gap-y-2 min-[1600px]:gap-x-4 min-[1600px]:gap-y-3">
                    {avgResponseByArea.length === 0 && !isDashboardLoading && (
                      <div className="col-span-2 text-sm min-[1600px]:text-base text-muted-foreground">Sin datos disponibles.</div>
                    )}
                    {(isDashboardLoading ? [] : avgResponseByArea.slice(0, 14)).map((item, index) => {
                      const colors = ["text-green-600", "text-blue-600", "text-purple-600", "text-amber-600", "text-cyan-600", "text-pink-600", "text-indigo-600"]
                      return (
                        <div key={item.areaId} className="flex items-center justify-between p-2.5 sm:p-3 min-[1600px]:p-4 bg-muted/50 rounded-lg">
                          <span className="text-sm min-[1600px]:text-base font-medium truncate pr-2">{item.areaName}</span>
                          <span className={`text-sm min-[1600px]:text-base font-bold shrink-0 ${colors[index % colors.length] || "text-muted-foreground"}`}>
                            {item.avgDays} días
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (user.rol === "Usuario de Área Responsable") {
    const getAreaStatusCount = (statusId: number) =>
      areaMetrics?.byStatus?.find((status) => status.statusId === statusId)?.count ?? 0
    const totalAssigned = areaMetrics?.totalPqrs ?? 0
    const pendingCount = (areaMetrics?.byStatus ?? []).reduce((acc, item) => {
      if (item.statusId === 4) return acc
      return acc + item.count
    }, 0)
    const appealsCount = (areaMetrics?.byStatus ?? []).reduce((acc, item) => {
      if (item.statusId === 3 || item.statusId === 5) return acc + item.count
      return acc
    }, 0)
    const respondedCount = getAreaStatusCount(4)

    const getPriorityLabel = (dueDate?: string | null, createdAt?: string | null) => {
      if (dueDate) {
        const due = new Date(dueDate)
        if (!Number.isNaN(due.getTime())) {
          const diffDays = Math.ceil((due.getTime() - Date.now()) / 86400000)
          if (diffDays <= 2) return "Alta"
          if (diffDays <= 5) return "Media"
          return "Baja"
        }
      }
      if (createdAt) {
        const created = new Date(createdAt)
        if (!Number.isNaN(created.getTime())) {
          const elapsed = Math.floor((Date.now() - created.getTime()) / 86400000)
          if (elapsed >= 10) return "Alta"
          if (elapsed >= 5) return "Media"
          return "Baja"
        }
      }
      return "Media"
    }

    const getDaysElapsed = (createdAt?: string | null) => {
      if (!createdAt) return 0
      const created = new Date(createdAt)
      if (Number.isNaN(created.getTime())) return 0
      return Math.max(0, Math.floor((Date.now() - created.getTime()) / 86400000))
    }

    return (
      <div className="flex h-screen bg-background overflow-hidden max-md:overflow-visible max-md:h-auto max-md:min-h-screen">
        <Sidebar />

        <main
          className={cn(
            "flex-1 p-3 sm:p-4 lg:p-5 min-[1600px]:p-10 pt-14 md:pt-3 flex flex-col transition-all duration-300",
            "max-md:min-h-screen max-md:overflow-y-auto max-md:h-auto md:h-screen md:overflow-hidden",
            isCollapsed ? "lg:ml-24" : "lg:ml-64"
          )}
        >
          <div className="mb-3 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h1 className="text-xl sm:text-2xl min-[1600px]:text-3xl font-bold text-foreground mb-1 min-[1600px]:mb-2">Panel del Área Responsable</h1>
              </div>
            </div>
          </div>

          {areaError && (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-2 min-[1600px]:p-3 text-xs min-[1600px]:text-sm text-red-700">
              {areaError}
            </div>
          )}

          <div className="grid gap-2 sm:gap-3 min-[1600px]:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-min min-h-20 mb-3 shrink-0">
            <Link to="/pqrsf?tab=general&status=todos">
              <Card className="bg-linear-to-br from-blue-500 to-blue-600 text-white border-0 cursor-pointer hover:opacity-90 transition-opacity min-h-16 h-full w-full relative @container">
                <span className="absolute top-1.5 left-2.5 text-[clamp(0.8rem,4.2cqw,1.2rem)] font-semibold opacity-90 z-10">Asignadas</span>
                <CardContent className="p-2 sm:p-2.5 min-[1600px]:p-3 h-full w-full flex items-center justify-center @container">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-9 h-9 min-[1600px]:w-10 min-[1600px]:h-10 flex items-center justify-center bg-white/20 rounded-lg shrink-0">
                      <FileText className="h-4 w-4 min-[1600px]:h-6 min-[1600px]:w-6" />
                    </div>
                    <p className="text-[clamp(1.3rem,6cqw,3rem)] font-bold min-w-0 overflow-visible whitespace-nowrap">
                      {isAreaLoading ? "..." : totalAssigned}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/pqrsf?tab=analisis">
              <Card className="border-orange-200 bg-orange-50 cursor-pointer hover:opacity-90 transition-opacity min-h-16 h-full w-full relative @container">
                <span className="absolute top-1.5 left-2.5 text-[clamp(0.6rem,4cqw,1.1rem)] font-semibold text-muted-foreground z-10">Pendientes</span>
                <CardContent className="p-2 sm:p-2.5 min-[1600px]:p-3 h-full w-full flex items-center justify-center @container">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-9 h-9 min-[1600px]:w-10 min-[1600px]:h-10 flex items-center justify-center bg-orange-500/20 rounded-lg shrink-0">
                      <ClipboardList className="h-3 w-4 min-[1600px]:h-6 min-[1600px]:w-6 text-orange-600" />
                    </div>
                    <p className="text-[clamp(1.3rem,6cqw,3rem)] font-bold text-foreground min-w-0 overflow-visible whitespace-nowrap">
                      {isAreaLoading ? "..." : pendingCount}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/pqrsf?tab=apelacion">
              <Card className="border-red-200 bg-red-50 cursor-pointer hover:opacity-90 transition-opacity min-h-16 h-full w-full relative @container">
                <span className="absolute top-1.5 left-2.5 text-[clamp(0.6rem,4cqw,1.1rem)] font-semibold text-muted-foreground z-10">Apelaciones</span>
                <CardContent className="p-2 sm:p-2.5 min-[1600px]:p-3 h-full w-full flex items-center justify-center @container">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-9 h-9 min-[1600px]:w-10 min-[1600px]:h-10 flex items-center justify-center bg-red-500/20 rounded-lg shrink-0">
                      <AlertCircle className="h-4 w-4 min-[1600px]:h-6 min-[1600px]:w-6 text-red-600" />
                    </div>
                    <p className="text-[clamp(1.3rem,6cqw,3rem)] font-bold text-foreground min-w-0 overflow-visible whitespace-nowrap">
                      {isAreaLoading ? "..." : appealsCount}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/pqrsf?tab=cerradas">
              <Card className="border-green-200 bg-green-50 cursor-pointer hover:opacity-90 transition-opacity min-h-16 h-full w-full relative @container">
                <span className="absolute top-1.5 left-2.5 text-[clamp(0.6rem,4cqw,1.1rem)] font-semibold text-muted-foreground z-10">Cerradas</span>
                <CardContent className="p-2 sm:p-2.5 min-[1600px]:p-3 h-full w-full flex items-center justify-center @container">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-9 h-9 min-[1600px]:w-10 min-[1600px]:h-10 flex items-center justify-center bg-green-500/20 rounded-lg shrink-0">
                      <CheckCircle2 className="h-4 w-4 min-[1600px]:h-6 min-[1600px]:w-6 text-green-600" />
                    </div>
                    <p className="text-[clamp(1.3rem,6cqw,3rem)] font-bold text-foreground min-w-0 overflow-visible whitespace-nowrap">
                      {isAreaLoading ? "..." : respondedCount}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 min-[1600px]:gap-5 max-md:flex-initial max-md:overflow-visible flex-1 min-h-0">
            <Card className="h-full flex flex-col">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 min-[1600px]:p-5 shrink-0">
                <CardTitle className="text-sm sm:text-base min-[1600px]:text-lg">PQRSF Pendientes de Respuesta</CardTitle>
                <Link to="/analisis-pendientes">
                  <Button variant="ghost" size="sm" className="w-full sm:w-auto h-7 min-[1600px]:h-8 text-xs min-[1600px]:text-sm">
                    Ver Todas
                    <ArrowUpRight className="h-3 w-3 min-[1600px]:h-4 min-[1600px]:w-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-3 min-[1600px]:p-5 flex-1 min-h-0 overflow-y-auto">
                <div className="space-y-2 min-[1600px]:space-y-3">
                  {isAreaLoading ? (
                    <div className="text-xs min-[1600px]:text-sm text-muted-foreground">Cargando pendientes...</div>
                  ) : areaPending.length === 0 ? (
                    <div className="text-xs min-[1600px]:text-sm text-muted-foreground">Sin PQRSF pendientes.</div>
                  ) : (
                    [...areaPending]
                      .sort((a, b) => {
                        const priorityRank = (value?: string | null) => {
                          if (value === "Alta") return 0
                          if (value === "Media") return 1
                          if (value === "Baja") return 2
                          return 3
                        }
                        const pa = getPriorityLabel(a.dueDate, a.createdAt)
                        const pb = getPriorityLabel(b.dueDate, b.createdAt)
                        const diff = priorityRank(pa) - priorityRank(pb)
                        if (diff !== 0) return diff
                        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0
                        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0
                        return db - da
                      })
                      .slice(0, 4)
                      .map((item) => {
                      const prioridad = getPriorityLabel(item.dueDate, item.createdAt)
                      const diasTranscurridos = getDaysElapsed(item.createdAt)
                      const borderColor =
                        prioridad === "Alta"
                          ? "border-l-red-500"
                          : prioridad === "Media"
                            ? "border-l-orange-500"
                            : "border-l-blue-500"
                      return (
                        <div
                          key={item.id}
                          className={`flex flex-col lg:flex-row lg:items-center justify-between p-2.5 min-[1600px]:p-4 border-l-4 ${borderColor} bg-card rounded-lg hover:shadow-md transition-shadow gap-2 min-[1600px]:gap-3`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 min-[1600px]:gap-3 mb-1">
                              <span className="font-mono text-xs min-[1600px]:text-sm font-semibold text-primary">{item.ticketNumber}</span>
                              <span className="text-[10px] min-[1600px]:text-xs font-medium px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                {item.typeName}
                              </span>
                            </div>
                            <h4 className="font-semibold text-foreground text-xs min-[1600px]:text-sm mb-0.5 truncate">
                              {item.description}
                            </h4>
                            <p className="text-[10px] min-[1600px]:text-xs text-muted-foreground truncate">
                              {item.clientName || areaName || "Cliente"} • {item.createdAt?.split("T")[0] ?? ""}
                            </p>
                          </div>

                          <div className="flex flex-row items-center gap-2 min-[1600px]:gap-3">
                            <div className="text-left">
                              <p className="text-[10px] min-[1600px]:text-xs text-muted-foreground mb-0.5">PRIORIDAD</p>
                              <span
                                className={`text-[10px] min-[1600px]:text-xs font-medium px-1.5 py-0.5 rounded-full ${
                                  prioridad === "Alta"
                                    ? "bg-red-100 text-red-700"
                                    : prioridad === "Media"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-green-100 text-green-700"
                                }`}
                              >
                                {prioridad}
                              </span>
                            </div>

                            <div className="text-left">
                              <p className="text-[10px] min-[1600px]:text-xs text-muted-foreground mb-0.5">TIEMPO</p>
                              <p className="text-xs min-[1600px]:text-sm font-medium">{diasTranscurridos}d</p>
                            </div>

                            <Link to={`/pqrsf/${item.id}`}>
                              <Button size="sm" className="h-7 min-[1600px]:h-8 text-xs min-[1600px]:text-sm px-2">
                                <ClipboardList className="h-3 w-3 min-[1600px]:h-4 min-[1600px]:w-4 mr-1" />
                                Responder
                              </Button>
                            </Link>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="h-full flex flex-col">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6 min-[1600px]:p-8 shrink-0">
                <CardTitle className="text-lg sm:text-xl min-[1600px]:text-2xl">Apelaciones Recientes</CardTitle>
                <Link to="/apelaciones">
                  <Button variant="ghost" size="sm" className="w-full sm:w-auto min-[1600px]:text-base">
                    Ver Todas
                    <ArrowUpRight className="h-4 w-4 min-[1600px]:h-5 min-[1600px]:w-5 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 min-[1600px]:p-8 flex-1 min-h-0 overflow-y-auto">
                <div className="space-y-4 min-[1600px]:space-y-5">
                  {isAreaLoading ? (
                    <div className="text-xs min-[1600px]:text-sm text-muted-foreground">Cargando apelaciones...</div>
                  ) : areaAppeals.length === 0 ? (
                    <div className="text-xs min-[1600px]:text-sm text-muted-foreground">Sin apelaciones recientes.</div>
                  ) : (
                    areaAppeals.slice(0, 1).map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col lg:flex-row lg:items-center justify-between p-4 min-[1600px]:p-5 border-l-4 border-l-red-500 bg-card rounded-lg gap-4 min-[1600px]:gap-5"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 sm:gap-4">
                            <span className="font-mono text-sm min-[1600px]:text-base font-semibold text-primary">{item.ticketNumber}</span>
                            <span className="text-xs min-[1600px]:text-sm font-medium px-2 py-1 rounded-full bg-red-100 text-red-700">
                              Apelada
                            </span>
                          </div>
                          <h4 className="font-semibold text-foreground text-sm sm:text-base min-[1600px]:text-lg mb-1">
                            {item.description}
                          </h4>
                          <p className="text-xs sm:text-sm min-[1600px]:text-base text-muted-foreground">
                            {item.clientName || areaName || "Cliente"} • {item.responseContent || "Requiere reanálisis"}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <Link to={`/pqrsf/${item.id}`}>
                            <Button size="sm" variant="outline" className="w-full sm:w-auto bg-transparent">
                              <AlertCircle className="h-4 w-4 sm:mr-1" />
                              <span className="hidden sm:inline">Reanalizar</span>
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4 p-6">
        <p className="text-muted-foreground">No tienes acceso a este panel.</p>
        <Button variant="outline" onClick={() => navigate("/")}>
          Volver al inicio
        </Button>
      </div>
    </div>
  )
}
