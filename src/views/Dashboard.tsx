import {
  ArrowUpRight,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ClipboardList,
  XCircle,
  MessageCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sidebar } from "@/components/sidebar"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/auth-context"
import { useEffect, useMemo, useState } from "react"
import { dashboardService, type AdminChat, type AdminMetrics } from "@/services/dashboard.service"

export default function Dashboard() {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null)
  const [chats, setChats] = useState<AdminChat[]>([])
  const [isDashboardLoading, setIsDashboardLoading] = useState(false)
  const [dashboardError, setDashboardError] = useState("")
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

        <main className="flex-1 p-4 sm:p-6 lg:p-8 lg:ml-64 overflow-y-auto min-h-screen">
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Panel de Administración</h1>
                <p className="text-sm sm:text-base text-muted-foreground">Control total del sistema PQRSF</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              {user.rol}
            </div>
          </div>

          {dashboardError && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {dashboardError}
            </div>
          )}

          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 rounded-lg p-2 sm:p-3">
                    <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="flex items-center gap-1 text-xs sm:text-sm bg-white/20 rounded-full px-2 sm:px-3 py-1">
                    <TrendingUp className="h-3 w-3" />
                    <span className="hidden sm:inline">+5% vs mes anterior</span>
                    <span className="sm:hidden">+5%</span>
                  </div>
                </div>
                <h3 className="text-xs sm:text-sm font-medium mb-2 opacity-90">Total PQRSF</h3>
                <p className="text-3xl sm:text-4xl font-bold mb-1">
                  {isDashboardLoading ? "..." : totalPqrs}
                </p>
                <p className="text-xs opacity-80">En el sistema</p>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-orange-500/20 rounded-lg p-2 sm:p-3">
                    <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                  </div>
                </div>
                <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">En Seguimiento</h3>
                <p className="text-3xl sm:text-4xl font-bold text-foreground mb-1">
                  {isDashboardLoading ? "..." : getStatusCount(2)}
                </p>
                <p className="text-xs text-orange-600 font-medium">Respondidas por áreas</p>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-red-500/20 rounded-lg p-2 sm:p-3">
                    <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                  </div>
                </div>
                <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">En Apelación</h3>
                <p className="text-3xl sm:text-4xl font-bold text-foreground mb-1">
                  {isDashboardLoading ? "..." : getStatusCount(3)}
                </p>
                <p className="text-xs text-red-600 font-medium">Devueltas a áreas</p>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-500/20 rounded-lg p-2 sm:p-3">
                    <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                  </div>
                </div>
                <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">Cerradas</h3>
                <p className="text-3xl sm:text-4xl font-bold text-foreground mb-1">
                  {isDashboardLoading ? "..." : getStatusCount(4)}
                </p>
                <p className="text-xs text-green-600 font-medium">Finalizadas</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">PQRSF por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
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

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tiempo Promedio de Respuesta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
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

          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Chats Recientes</CardTitle>
              <Link to="/chats">
                <Button variant="ghost" size="sm" className="w-full sm:w-auto">
                  Ver Todos
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                {chatItems.length === 0 && !isDashboardLoading && (
                  <div className="text-sm text-muted-foreground">Sin chats recientes.</div>
                )}
                {(isDashboardLoading ? [] : chatItems).map((chat, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <MessageCircle className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-semibold text-sm">{chat.radicado}</p>
                        <p className="text-xs text-muted-foreground">{chat.cliente}</p>
                        <p className="text-sm mt-1">{chat.ultimoMensaje}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{chat.fecha}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  if (user.rol === "Usuario de Área Responsable") {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 lg:ml-64 overflow-y-auto min-h-screen">
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Panel del Área Responsable</h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  PQRSF asignadas a: {user.area || "tu área"}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              {user.rol}
              {user.area && <span className="text-muted-foreground">• {user.area}</span>}
            </div>
          </div>

          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 rounded-lg p-2 sm:p-3">
                    <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                </div>
                <h3 className="text-xs sm:text-sm font-medium mb-2 opacity-90">PQRSF Asignadas</h3>
                <p className="text-3xl sm:text-4xl font-bold mb-1">24</p>
                <p className="text-xs opacity-80">Total en tu área</p>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-orange-500/20 rounded-lg p-2 sm:p-3">
                    <ClipboardList className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                  </div>
                </div>
                <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">Pendientes de Respuesta</h3>
                <p className="text-3xl sm:text-4xl font-bold text-foreground mb-1">8</p>
                <p className="text-xs text-orange-600 font-medium">Requieren respuesta</p>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-red-500/20 rounded-lg p-2 sm:p-3">
                    <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                  </div>
                </div>
                <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">Apelaciones</h3>
                <p className="text-3xl sm:text-4xl font-bold text-foreground mb-1">3</p>
                <p className="text-xs text-red-600 font-medium">Para reanálisis</p>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-500/20 rounded-lg p-2 sm:p-3">
                    <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                  </div>
                </div>
                <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">Respondidas</h3>
                <p className="text-3xl sm:text-4xl font-bold text-foreground mb-1">13</p>
                <p className="text-xs text-green-600 font-medium">Enviadas a clientes</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6 sm:mb-8">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">PQRSF Pendientes de Respuesta</CardTitle>
              <Link to="/analisis-pendientes">
                <Button variant="ghost" size="sm" className="w-full sm:w-auto">
                  Ver Todas
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                {[
                  {
                    radicado: "PQRSF-2023-001",
                    tipo: "Petición",
                    solicitante: "Carlos Mendoza",
                    descripcion: "Solicitud de cambio de horario de clase",
                    fecha: "Dic 15, 2023",
                    prioridad: "Media",
                    diasTranscurridos: 5,
                    borderColor: "border-l-orange-500",
                  },
                  {
                    radicado: "PQRSF-2023-005",
                    tipo: "Queja",
                    solicitante: "Ana García",
                    descripcion: "Falta de equipos en sala de cómputo",
                    fecha: "Dic 16, 2023",
                    prioridad: "Alta",
                    diasTranscurridos: 4,
                    borderColor: "border-l-red-500",
                  },
                  {
                    radicado: "PQRSF-2023-008",
                    tipo: "Sugerencia",
                    solicitante: "Luis Rodríguez",
                    descripcion: "Mejoras en material didáctico",
                    fecha: "Dic 17, 2023",
                    prioridad: "Baja",
                    diasTranscurridos: 3,
                    borderColor: "border-l-blue-500",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className={`flex flex-col lg:flex-row lg:items-center justify-between p-4 border-l-4 ${item.borderColor} bg-card rounded-lg hover:shadow-md transition-shadow gap-4`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-sm font-semibold text-primary">{item.radicado}</span>
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                          {item.tipo}
                        </span>
                      </div>
                      <h4 className="font-semibold text-foreground text-sm sm:text-base mb-1">{item.descripcion}</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Solicitante: {item.solicitante} • {item.fecha}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:gap-6">
                      <div className="text-left">
                        <p className="text-xs text-muted-foreground mb-1">PRIORIDAD</p>
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${
                            item.prioridad === "Alta"
                              ? "bg-red-100 text-red-700"
                              : item.prioridad === "Media"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                          }`}
                        >
                          {item.prioridad}
                        </span>
                      </div>

                      <div className="text-left">
                        <p className="text-xs text-muted-foreground mb-1">TIEMPO</p>
                        <p className="text-sm font-medium">{item.diasTranscurridos} días</p>
                      </div>

                      <Link to={`/pqrsf/${item.radicado}`}>
                        <Button size="sm" className="w-full sm:w-auto">
                          <ClipboardList className="h-4 w-4 sm:mr-1" />
                          <span className="hidden sm:inline">Responder</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Apelaciones Recientes</CardTitle>
              <Link to="/apelaciones">
                <Button variant="ghost" size="sm" className="w-full sm:w-auto">
                  Ver Todas
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border-l-4 border-l-red-500 bg-card rounded-lg gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <span className="font-mono text-sm font-semibold text-primary">PQRSF-2023-010</span>
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-700">
                        Apelada
                      </span>
                    </div>
                    <h4 className="font-semibold text-foreground text-sm sm:text-base mb-1">
                      Solicitud rechazada - Usuario apela decisión
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      María Pérez • Requiere reanálisis urgente
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link to="/pqrsf/PQRSF-2023-010">
                      <Button size="sm" variant="outline" className="w-full sm:w-auto bg-transparent">
                        <AlertCircle className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Reanalizar</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return null
}
