import {
  ArrowUpRight,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ClipboardList,
  MessageCircle,
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
        setAreaError("No se pudo cargar el panel del área. Intenta nuevamente.")
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
    const totalPqrs = metrics?.totalPqrs ?? 0
    const pqrsByType = metrics?.byType ?? []
    const avgResponseByArea = metrics?.avgResponseByArea ?? []
    const pqrsByTypeTotal = totalPqrs > 0 ? totalPqrs : 1

    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />

        <main
          className={cn(
            "flex-1 p-4 sm:p-6 lg:p-8 h-screen overflow-hidden transition-all duration-300 flex flex-col",
            isCollapsed ? "lg:ml-24" : "lg:ml-64"
          )}
        >
          <div className="mb-4 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Panel de Administración</h1>
              </div>
            </div>
          </div>

          <div className="mb-4 shrink-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              {user.rol}
            </div>
          </div>

          {dashboardError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {dashboardError}
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-2 lg:gap-6 flex-1 min-h-0 overflow-hidden">
            {/* Columna Izquierda */}
            <div className="flex flex-col gap-4 lg:gap-6 min-h-0 overflow-hidden">
              {/* Fila 1: Cards */}
              <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 shrink-0">
                <Card className="bg-linear-to-br from-blue-500 to-blue-600 text-white border-0">
                  <CardContent className="p-2 sm:p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="bg-white/20 rounded-lg p-1 sm:p-1.5">
                        <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                      </div>
                    </div>
                    <h3 className="text-xs font-medium mb-1 opacity-90">Total PQRSF</h3>
                    <p className="text-xl sm:text-2xl font-bold">
                      {isDashboardLoading ? "..." : totalPqrs}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-orange-200 bg-orange-50">
                  <CardContent className="p-2 sm:p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="bg-orange-500/20 rounded-lg p-1 sm:p-1.5">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
                      </div>
                    </div>
                    <h3 className="text-xs font-medium text-muted-foreground mb-1">En Seguimiento</h3>
                    <p className="text-xl sm:text-2xl font-bold text-foreground">
                      {isDashboardLoading ? "..." : getStatusCount(2)}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-2 sm:p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="bg-red-500/20 rounded-lg p-1 sm:p-1.5">
                        <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                      </div>
                    </div>
                    <h3 className="text-xs font-medium text-muted-foreground mb-1">En Apelación</h3>
                    <p className="text-xl sm:text-2xl font-bold text-foreground">
                      {isDashboardLoading ? "..." : getStatusCount(3)}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-2 sm:p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="bg-green-500/20 rounded-lg p-1 sm:p-1.5">
                        <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                      </div>
                    </div>
                    <h3 className="text-xs font-medium text-muted-foreground mb-1">Cerradas</h3>
                    <p className="text-xl sm:text-2xl font-bold text-foreground">
                      {isDashboardLoading ? "..." : getStatusCount(4)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Fila 2: Chats Recientes */}
              <div className="min-h-0 flex flex-1">
                <Card className="h-full w-full flex flex-col">
                  <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6 shrink-0">
                    <CardTitle className="text-lg sm:text-xl">Chats Recientes</CardTitle>
                    <Link to="/chats">
                      <Button variant="ghost" size="sm" className="w-full sm:w-auto">
                        Ver Todos
                        <ArrowUpRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 flex-1 min-h-0 overflow-hidden">
                    <div className="space-y-3">
                      {chatItems.length === 0 && !isDashboardLoading && (
                        <div className="text-sm text-muted-foreground">Sin chats recientes.</div>
                      )}
                      {(isDashboardLoading ? [] : chatItems).map((chat, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <MessageCircle className="h-4 w-4 text-primary shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-sm truncate">{chat.radicado}</p>
                              <p className="text-xs text-muted-foreground truncate">{chat.cliente}</p>
                              <p className="text-xs mt-1 line-clamp-2">{chat.ultimoMensaje}</p>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0 ml-2">{chat.fecha}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Columna Derecha */}
            <div className="flex flex-col gap-4 lg:gap-6 min-h-0 overflow-hidden">
              {/* Fila 1: PQRSF por Tipo */}
              <Card className="flex-2 min-h-0 flex flex-col">
                <CardHeader className="shrink-0">
                  <CardTitle className="text-lg">PQRSF por Tipo</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 min-h-0 overflow-y-auto">
                  <div className="space-y-4">
                    {pqrsByType.length === 0 && !isDashboardLoading && (
                      <div className="text-sm text-muted-foreground">Sin datos disponibles.</div>
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
                        <div key={item.typeName} className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">{item.typeName}</span>
                              <span className="text-sm text-muted-foreground">{item.count}</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
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
                <CardHeader className="shrink-0">
                  <CardTitle className="text-lg">Tiempo Promedio de Respuesta</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 min-h-0 overflow-y-auto">
                  <div className="space-y-2">
                    {avgResponseByArea.length === 0 && !isDashboardLoading && (
                      <div className="text-sm text-muted-foreground">Sin datos disponibles.</div>
                    )}
                    {(isDashboardLoading ? [] : avgResponseByArea.slice(0, 3)).map((item, index) => {
                      const colors = ["text-green-600", "text-blue-600", "text-purple-600"]
                      return (
                        <div key={item.areaId} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <span className="text-sm font-medium">{item.areaName}</span>
                          <span className={`text-sm font-bold ${colors[index] || "text-muted-foreground"}`}>
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
    const appealsCount = getAreaStatusCount(3)
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
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />

        <main
          className={cn(
            "flex-1 p-3 sm:p-4 lg:p-5 h-screen transition-all duration-300 flex flex-col overflow-hidden",
            isCollapsed ? "lg:ml-24" : "lg:ml-64"
          )}
        >
          <div className="mb-3 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1">Panel del Área Responsable</h1>
              </div>
            </div>
          </div>

          <div className="mb-3 shrink-0">
            <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
              {user.rol}
            </div>
          </div>

          {areaError && (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
              {areaError}
            </div>
          )}

          <div className="grid gap-2 sm:gap-3 grid-cols-2 lg:grid-cols-4 mb-3 shrink-0">
            <Card className="bg-linear-to-br from-blue-500 to-blue-600 text-white border-0">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-white/20 rounded-lg p-1.5">
                    <FileText className="h-4 w-4" />
                  </div>
                </div>
                <h3 className="text-xs font-medium mb-1 opacity-90">PQRSF Asignadas</h3>
                <p className="text-2xl font-bold mb-0.5">{isAreaLoading ? "..." : totalAssigned}</p>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-orange-500/20 rounded-lg p-1.5">
                    <ClipboardList className="h-4 w-4 text-orange-600" />
                  </div>
                </div>
                <h3 className="text-xs font-medium text-muted-foreground mb-1">Pendientes</h3>
                <p className="text-2xl font-bold text-foreground mb-0.5">
                  {isAreaLoading ? "..." : pendingCount}
                </p>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-red-500/20 rounded-lg p-1.5">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  </div>
                </div>
                <h3 className="text-xs font-medium text-muted-foreground mb-1">Apelaciones</h3>
                <p className="text-2xl font-bold text-foreground mb-0.5">
                  {isAreaLoading ? "..." : appealsCount}
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-green-500/20 rounded-lg p-1.5">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                <h3 className="text-xs font-medium text-muted-foreground mb-1">Respondidas</h3>
                <p className="text-2xl font-bold text-foreground mb-0.5">
                  {isAreaLoading ? "..." : respondedCount}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-1 min-h-0">
            <Card className="h-full flex flex-col">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 shrink-0">
                <CardTitle className="text-sm sm:text-base">PQRSF Pendientes de Respuesta</CardTitle>
                <Link to="/analisis-pendientes">
                  <Button variant="ghost" size="sm" className="w-full sm:w-auto h-7 text-xs">
                    Ver Todas
                    <ArrowUpRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-3 flex-1 min-h-0 overflow-y-auto">
                <div className="space-y-2">
                  {isAreaLoading ? (
                    <div className="text-xs text-muted-foreground">Cargando pendientes...</div>
                  ) : areaPending.length === 0 ? (
                    <div className="text-xs text-muted-foreground">Sin PQRSF pendientes.</div>
                  ) : (
                    areaPending.slice(0, 2).map((item) => {
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
                          className={`flex flex-col lg:flex-row lg:items-center justify-between p-2.5 border-l-4 ${borderColor} bg-card rounded-lg hover:shadow-md transition-shadow gap-2`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-xs font-semibold text-primary">{item.ticketNumber}</span>
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                {item.typeName}
                              </span>
                            </div>
                            <h4 className="font-semibold text-foreground text-xs mb-0.5 truncate">
                              {item.description}
                            </h4>
                            <p className="text-[10px] text-muted-foreground truncate">
                              {item.clientName || areaName || "Cliente"} • {item.createdAt?.split("T")[0] ?? ""}
                            </p>
                          </div>

                          <div className="flex flex-row items-center gap-2">
                            <div className="text-left">
                              <p className="text-[10px] text-muted-foreground mb-0.5">PRIORIDAD</p>
                              <span
                                className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
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
                              <p className="text-[10px] text-muted-foreground mb-0.5">TIEMPO</p>
                              <p className="text-xs font-medium">{diasTranscurridos}d</p>
                            </div>

                            <Link to={`/pqrsf/${item.id}`}>
                              <Button size="sm" className="h-7 text-xs px-2">
                                <ClipboardList className="h-3 w-3 mr-1" />
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
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6 shrink-0">
                <CardTitle className="text-lg sm:text-xl">Apelaciones Recientes</CardTitle>
                <Link to="/apelaciones">
                  <Button variant="ghost" size="sm" className="w-full sm:w-auto">
                    Ver Todas
                    <ArrowUpRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 flex-1 min-h-0 overflow-y-auto">
                <div className="space-y-4">
                  {isAreaLoading ? (
                    <div className="text-xs text-muted-foreground">Cargando apelaciones...</div>
                  ) : areaAppeals.length === 0 ? (
                    <div className="text-xs text-muted-foreground">Sin apelaciones recientes.</div>
                  ) : (
                    areaAppeals.slice(0, 1).map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border-l-4 border-l-red-500 bg-card rounded-lg gap-4"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 sm:gap-4">
                            <span className="font-mono text-sm font-semibold text-primary">{item.ticketNumber}</span>
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-700">
                              Apelada
                            </span>
                          </div>
                          <h4 className="font-semibold text-foreground text-sm sm:text-base mb-1">
                            {item.description}
                          </h4>
                          <p className="text-xs sm:text-sm text-muted-foreground">
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

  return null
}
