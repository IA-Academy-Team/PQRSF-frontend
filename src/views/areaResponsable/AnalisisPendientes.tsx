import { Search, Filter, Calendar, ClipboardList } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sidebar } from "@/components/sidebar"
import { useSidebar } from "@/contexts/sidebar-context"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/auth-context"
import { useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { areaService } from "@/services/area.service"
import { dashboardService, type AreaPendingItem } from "@/services/dashboard.service"

const DAY_MS = 1000 * 60 * 60 * 24

const getPriority = (dueDate?: string | null, createdAt?: string | null) => {
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

const getDaysElapsed = (createdAt?: string | null) => {
  if (!createdAt) return 0
  const created = new Date(createdAt)
  if (Number.isNaN(created.getTime())) return 0
  return Math.max(0, Math.floor((Date.now() - created.getTime()) / DAY_MS))
}

const formatDate = (value?: string | null) => {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toISOString().split("T")[0]
}

export default function AnalisisPendientes() {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()
  const { isCollapsed } = useSidebar()
  const [pending, setPending] = useState<AreaPendingItem[]>([])
  const [areaName, setAreaName] = useState<string>("")
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("todos")
  const [dateFilter, setDateFilter] = useState("")

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/")
    }
    if (!isLoading && user?.rol !== "Usuario de Área Responsable") {
      navigate("/dashboard")
    }
  }, [user, isLoading, navigate])

  useEffect(() => {
    if (!user || user.rol !== "Usuario de Área Responsable") return

    let active = true
    const loadPending = async () => {
      setIsLoadingData(true)
      setError(null)
      try {
        const userId = Number(user.id)
        if (!userId) {
          throw new Error("Usuario inválido")
        }
        const responsable = await areaService.getResponsibleByUser(userId)
        if (!responsable.areaId) {
          throw new Error("No tienes un área asignada")
        }
        const pendingItems = await dashboardService.getAreaPending(responsable.areaId)
        if (!active) return
        setPending(pendingItems)
        if (pendingItems[0]?.areaName) {
          setAreaName(pendingItems[0].areaName)
        } else {
          const area = await areaService.getById(responsable.areaId)
          if (active) setAreaName(area.name)
        }
      } catch (err) {
        console.error("[area-pendientes] load error", err)
        if (active) {
          setError("No pudimos cargar las PQRSF pendientes.")
        }
      } finally {
        if (active) setIsLoadingData(false)
      }
    }

    void loadPending()

    return () => {
      active = false
    }
  }, [user])

  const filteredPending = useMemo(() => {
    const query = searchTerm.toLowerCase()
    return pending.filter((item) => {
      const priority = getPriority(item.dueDate, item.createdAt)
      const matchesPriority = priorityFilter === "todos" || priority.toLowerCase() === priorityFilter
      const matchesQuery =
        item.ticketNumber.toLowerCase().includes(query) ||
        (item.clientName ?? "").toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      const matchesDate = dateFilter ? formatDate(item.createdAt) === dateFilter : true
      return matchesPriority && matchesQuery && matchesDate
    })
  }, [pending, searchTerm, priorityFilter, dateFilter])

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

  const getPriorityColor = (priority: string) => {
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

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main
        className={cn(
          "flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-h-screen transition-all duration-300",
          isCollapsed ? "lg:ml-24" : "lg:ml-64"
        )}
      >
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ClipboardList className="h-8 w-8 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">PQRSF Pendientes de Respuesta</h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            PQRSF asignadas a {areaName || "tu área"} que requieren respuesta directa al cliente
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por radicado, solicitante o descripción..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full sm:w-50">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas las prioridades</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="baja">Baja</SelectItem>
                </SelectContent>
              </Select>

              <div className="relative w-full sm:w-50">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  className="pl-10"
                  value={dateFilter}
                  onChange={(event) => setDateFilter(event.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Mostrando {filteredPending.length} solicitudes pendientes de respuesta
          </p>
        </div>

        <div className="space-y-4">
          {isLoadingData ? (
            <p className="text-sm text-muted-foreground">Cargando pendientes...</p>
          ) : filteredPending.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay PQRSF pendientes para mostrar.</p>
          ) : (
            filteredPending.map((item) => {
              const priority = getPriority(item.dueDate, item.createdAt)
              const diasTranscurridos = getDaysElapsed(item.createdAt)
              return (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
                      <div className="flex-1 w-full">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                          <span className="font-mono text-sm font-semibold text-primary">{item.ticketNumber}</span>
                          <span className={`text-xs font-medium px-3 py-1 rounded-full border ${getTypeColor(item.typeName)}`}>
                            {item.typeName}
                          </span>
                          <span
                            className={`text-xs font-medium px-3 py-1 rounded-full ${getPriorityColor(priority)}`}
                          >
                            Prioridad {priority}
                          </span>
                          <span className="text-xs font-medium px-3 py-1 rounded-full bg-orange-100 text-orange-700">
                            Pendiente de Respuesta
                          </span>
                        </div>

                        <h3 className="font-semibold text-base sm:text-lg text-foreground mb-2">{item.description}</h3>

                        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">Solicitante:</span> {item.clientName || "Sin nombre"}
                          </div>
                          <div>
                            <span className="font-medium">Área:</span> {item.areaName}
                          </div>
                          <div>
                            <span className="font-medium">Radicado:</span> {formatDate(item.createdAt) || "-"}
                          </div>
                          <div>
                            <span className="font-medium">Tiempo:</span>{" "}
                            <span className="text-orange-600">{diasTranscurridos} días transcurridos</span>
                          </div>
                        </div>
                      </div>

                      <Link to={`/pqrsf/${item.id}`} className="w-full lg:w-auto">
                        <Button className="w-full lg:w-auto">
                          <ClipboardList className="h-4 w-4 mr-2" />
                          Responder al Cliente
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}
