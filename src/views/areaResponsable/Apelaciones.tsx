import { Search, Filter, Calendar, AlertCircle } from "lucide-react"
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
import { dashboardService, type AreaAppealItem } from "@/services/dashboard.service"
import { ITEMS_PER_PAGE } from "@/lib/pqrsf-utils"
import { usePagination } from "@/hooks/usePagination"
import { PQRSFPagination } from "@/components/PQRSFPagination"

const DAY_MS = 1000 * 60 * 60 * 24

const formatDate = (value?: string | null) => {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toISOString().split("T")[0]
}

const isUrgent = (dueDate?: string | null) => {
  if (!dueDate) return false
  const due = new Date(dueDate)
  if (Number.isNaN(due.getTime())) return false
  const diffDays = Math.ceil((due.getTime() - Date.now()) / DAY_MS)
  return diffDays <= 1
}

export default function Apelaciones() {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()
  const { isCollapsed } = useSidebar()
  const [appeals, setAppeals] = useState<AreaAppealItem[]>([])
  const [areaName, setAreaName] = useState("")
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("todos")
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
    const loadAppeals = async () => {
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
        const appealsItems = await dashboardService.getAreaAppeals(responsable.areaId)
        if (!active) return
        setAppeals(appealsItems)
        if (appealsItems[0]?.areaName) {
          setAreaName(appealsItems[0].areaName)
        } else {
          const area = await areaService.getById(responsable.areaId)
          if (active) setAreaName(area.name)
        }
      } catch (err) {
        console.error("[area-apelaciones] load error", err)
        if (active) {
          setError("No pudimos cargar las apelaciones.")
        }
      } finally {
        if (active) setIsLoadingData(false)
      }
    }

    void loadAppeals()

    return () => {
      active = false
    }
  }, [user])

  const filteredAppeals = useMemo(() => {
    const query = searchTerm.toLowerCase()
    return appeals.filter((item) => {
      const matchesType = typeFilter === "todos" || item.typeName.toLowerCase() === typeFilter
      const matchesQuery =
        item.ticketNumber.toLowerCase().includes(query) ||
        (item.clientName ?? "").toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      const matchesDate = dateFilter ? formatDate(item.createdAt) === dateFilter : true
      return matchesType && matchesQuery && matchesDate
    })
  }, [appeals, searchTerm, typeFilter, dateFilter])

  const { currentPage, totalPages, paginatedItems, setCurrentPage } = usePagination({
    items: filteredAppeals,
    itemsPerPage: ITEMS_PER_PAGE,
    dependencies: [searchTerm, typeFilter, dateFilter],
  })

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
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
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
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />

      <main
        className={cn(
          "flex-1 flex flex-col min-h-0 p-4 sm:p-6 lg:p-8 pt-14 md:pt-4 transition-all duration-300",
          "max-md:min-h-screen max-md:overflow-y-auto max-md:h-auto md:overflow-hidden",
          isCollapsed ? "lg:ml-24" : "lg:ml-64"
        )}
      >
        <div className="shrink-0 mb-4 sm:mb-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Apelaciones</h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            PQRSF de {areaName || "tu área"} que requieren reanálisis por apelación del usuario
          </p>
        </div>

        <Card className="shrink-0 mb-4 sm:mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por radicado o solicitante..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-50">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los tipos</SelectItem>
                  <SelectItem value="petición">Petición</SelectItem>
                  <SelectItem value="queja">Queja</SelectItem>
                  <SelectItem value="reclamo">Reclamo</SelectItem>
                  <SelectItem value="sugerencia">Sugerencia</SelectItem>
                  <SelectItem value="felicitación">Felicitación</SelectItem>
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

        {error && <p className="shrink-0 mb-4 text-sm text-destructive">{error}</p>}

        {!isLoadingData && filteredAppeals.length > 0 && (
          <div className="shrink-0 mb-4">
            <p className="text-sm text-muted-foreground">
              {filteredAppeals.length} apelación(es) • Página {currentPage} de {totalPages}
            </p>
          </div>
        )}

        <div className="flex-1 min-h-0 overflow-hidden mb-2">
          <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-2 auto-rows-fr min-h-full gap-3 md:gap-4 min-[1600px]:gap-5">
            {isLoadingData ? (
              <Card className="col-span-full border-dashed p-4">
                <CardContent className="p-4 text-sm text-muted-foreground">Cargando apelaciones...</CardContent>
              </Card>
            ) : paginatedItems.length === 0 ? (
              <Card className="col-span-full border-dashed p-4">
                <CardContent className="p-4 text-sm text-muted-foreground">No hay apelaciones registradas.</CardContent>
              </Card>
            ) : (
              paginatedItems.map((item) => {
              const urgent = isUrgent(item.dueDate)
              const motivo = item.responseContent ?? item.analysisAnswer ?? "Sin información registrada"
              const analisisAnterior = item.analysisAnswer ?? "Sin análisis registrado"
              return (
                <Card
                  key={item.id}
                  className={`h-full flex flex-col min-h-0 overflow-hidden hover:shadow-lg transition-shadow ${urgent ? "border-2 border-red-300" : ""}`}
                >
                  <CardContent className="p-4 sm:p-6 flex-1 min-h-0 overflow-hidden flex flex-col">
                    {urgent && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <p className="text-sm font-medium text-red-700">Apelación Urgente - Requiere atención inmediata</p>
                      </div>
                    )}

                    <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
                      <div className="flex-1 w-full">
                        <div className="flex flex-nowrap items-center gap-2 sm:gap-3 mb-3 min-w-0 overflow-hidden">
                          <span className="font-mono text-sm font-semibold text-primary truncate min-w-0 flex-1">{item.ticketNumber}</span>
                          <span className={`shrink-0 text-xs font-medium px-3 py-1 rounded-full border whitespace-nowrap ${getTypeColor(item.typeName)}`}>
                            {item.typeName}
                          </span>
                          <span className="shrink-0 text-xs font-medium px-3 py-1 rounded-full bg-red-100 text-red-700 whitespace-nowrap">
                            Apelada
                          </span>
                        </div>

                        <h3 className="font-semibold text-base sm:text-lg text-foreground mb-2">{item.description}</h3>

                        <div className="space-y-2 mb-4">
                          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
                            <div>
                              <span className="font-medium">Solicitante:</span> {item.clientName || "Sin nombre"}
                            </div>
                            <div>
                              <span className="font-medium">Radicación original:</span> {formatDate(item.createdAt)}
                            </div>
                            <div>
                              <span className="font-medium">Fecha apelación:</span> {formatDate(item.updatedAt || item.createdAt)}
                            </div>
                          </div>
                        </div>

                        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">MOTIVO DE APELACIÓN</p>
                            <p className="text-sm">{motivo}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">ANÁLISIS ANTERIOR</p>
                            <p className="text-sm">{analisisAnterior}</p>
                          </div>
                        </div>
                      </div>

                      <Link to={`/pqrsf/${item.id}`} className="w-full lg:w-auto">
                        <Button className="w-full lg:w-auto bg-red-600 hover:bg-red-700">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Reanalizar
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })
            )}
          </div>
        </div>

<div className="shrink-0 border-t border-border pt-4 mt-auto">
            <PQRSFPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </main>
    </div>
  )
}
