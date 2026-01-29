import { useState, useMemo, useEffect } from "react"
import { Search, Filter, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sidebar } from "@/components/sidebar"
import { useSidebar } from "@/contexts/sidebar-context"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { pqrsfService, type PQRSFListItem, type PQRSFListQuery, type SeguimientoItem, type CerradaItem, type ApelacionItem } from "@/services/pqrsf.service"
import { areaService } from "@/services/area.service"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Star, ListChecks } from "lucide-react"
import { surveyService } from "@/services/survey.service"
import { dashboardService, type AreaPendingItem } from "@/services/dashboard.service"
import type { PQRSFSurveyDetailed } from "@/types/database"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PQRSFCard, type UnifiedPQRSFItem } from "@/components/PQRSFCard"
import { PQRSFPagination } from "@/components/PQRSFPagination"
import { usePagination } from "@/hooks/usePagination"
import { useSearchParams } from "react-router-dom"
import {
  transformSeguimientoItem,
  transformCerradaItem,
  transformApelacionItem,
  transformAreaPendingItem,
  transformSurveyItem,
} from "@/lib/pqrsf-transformers"

export default function PQRSFList() {
  const { isCollapsed } = useSidebar()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("general")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6
  const [items, setItems] = useState<PQRSFListItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [dateFilter, setDateFilter] = useState("")
  const [sortFilter, setSortFilter] = useState("recent")
  const [areaId, setAreaId] = useState<number | null>(null)
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const tab = searchParams.get("tab")
    const status = searchParams.get("status")
    if (tab) {
      setActiveTab(tab)
    }
    if (status) {
      setStatusFilter(status)
    } else if (tab === "general") {
      setStatusFilter("todos")
    }
  }, [searchParams])


  useEffect(() => {
    let active = true
    const loadArea = async () => {
      if (!user || user.rol !== "Usuario de Área Responsable") {
        if (active) setAreaId(null)
        return
      }
      try {
        const responsable = await areaService.getResponsibleByUser(Number(user.id))
        if (active) {
          setAreaId(responsable.areaId ?? null)
        }
      } catch (err) {
        console.error("[pqrsf] load area error", err)
        if (active) setAreaId(null)
      }
    }
    void loadArea()
    return () => {
      active = false
    }
  }, [user])

  useEffect(() => {
    let active = true
    const timeout = setTimeout(async () => {
      setIsLoading(true)
      setError("")
      try {
        if (user?.rol === "Usuario de Área Responsable" && !areaId) {
          setItems([])
          setError("No tienes un área asignada.")
          return
        }
        const query: PQRSFListQuery = {
          q: searchTerm.trim() || undefined,
          sort: sortFilter as PQRSFListQuery["sort"],
        }
        if (user?.rol === "Usuario de Área Responsable") {
          query.areaId = areaId ?? undefined
        }
        if (statusFilter !== "todos") {
          query.pqrsStatusId = Number(statusFilter)
        }
        if (dateFilter) {
          query.fromDate = dateFilter
          query.toDate = dateFilter
        }

        const data = await pqrsfService.getAdminList(query)
        if (!active) return
        setItems(data)
      } catch (err) {
        if (!active) return
        console.error("[pqrsf] admin list error", err)
        setError("No se pudo cargar la bandeja de PQRSF.")
      } finally {
        if (active) setIsLoading(false)
      }
    }, 300)

    return () => {
      active = false
      clearTimeout(timeout)
    }
  }, [searchTerm, statusFilter, dateFilter, sortFilter, user, areaId])

  const formattedItems = useMemo<UnifiedPQRSFItem[]>(
    () =>
      items.map((item) => ({
        id: item.id,
        ticketNumber: item.ticketNumber,
        typeName: item.typeName,
        statusName: item.statusName,
        description: item.description,
        clientName: item.clientName,
        areaName: item.areaName,
        createdAt: item.createdAt,
        priority: null,
        responseSentAt: null,
        updatedAt: null,
        daysElapsed: null,
        responseTime: null,
        satisfaction: null,
        dueDate: null,
      })),
    [items],
  )


  const statusStyles: Record<string, string> = {
    radicado: "bg-amber-50 text-amber-700 border-amber-200",
    analisis: "bg-blue-50 text-blue-700 border-blue-200",
    "reanálisis": "bg-red-50 text-red-700 border-red-200",
    devuelto: "bg-orange-50 text-orange-700 border-orange-200",
    cerrado: "bg-emerald-50 text-emerald-700 border-emerald-200",
  }

  const getStatusKey = (status: string): string => {
    return status.toLowerCase()
  }

  const getStatusStyle = (status: string): string => {
    const key = getStatusKey(status)
    return statusStyles[key] || "bg-gray-50 text-gray-700 border-gray-200"
  }

  const { currentPage: safeCurrentPage, totalPages, paginatedItems, setCurrentPage: setSafeCurrentPage } = usePagination({
    items: formattedItems,
    itemsPerPage,
    dependencies: [searchTerm, statusFilter, dateFilter, sortFilter],
  })

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main
        className={cn(
          "flex-1 p-8 h-screen transition-all duration-300 flex flex-col",
          isCollapsed ? "lg:ml-24" : "lg:ml-64",
        )}
      >
        <div className="mb-8 shrink-0">
          <h1 className="text-3xl font-bold text-foreground mb-2">Listado General de PQRSF</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="mb-6 shrink-0">
            <TabsTrigger value="general">Listado General</TabsTrigger>
            {user?.rol === "Administrador" && (
              <>
                <TabsTrigger value="seguimiento">Seguimiento</TabsTrigger>
                <TabsTrigger value="cerradas">Cerradas</TabsTrigger>
                <TabsTrigger value="apelacion">En Apelación</TabsTrigger>
                <TabsTrigger value="encuestas">Encuestas</TabsTrigger>
              </>
            )}
            {user?.rol === "Usuario de Área Responsable" && (
              <>
                <TabsTrigger value="analisis">Análisis Pendiente</TabsTrigger>
                <TabsTrigger value="cerradas">Cerradas</TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="general" className="flex-1 flex flex-col min-h-0 mt-0">
            <CardContent className="pb-2 px-0 mb-6 shrink-0">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre, ID o descripción..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-50">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los estados</SelectItem>
                    <SelectItem value="1">Radicado</SelectItem>
                    <SelectItem value="2">Analisis</SelectItem>
                    <SelectItem value="3">Reanálisis</SelectItem>
                    <SelectItem value="5">Devuelto</SelectItem>
                    <SelectItem value="4">Cerrado</SelectItem>
                  </SelectContent>
                </Select>

                <div className="relative w-full md:w-50">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    className="pl-10"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  />
                </div>

                <Select value={sortFilter} onValueChange={setSortFilter}>
                  <SelectTrigger className="w-full md:w-55">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Fecha (Más reciente)</SelectItem>
                    <SelectItem value="oldest">Fecha (Más antiguo)</SelectItem>
                    <SelectItem value="ticket">ID</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex-1 min-h-0 overflow-y-auto mb-6">
              <div className="grid grid-cols-3 auto-rows-fr gap-4">
                {isLoading && (
                  <Card className="col-span-3 border-dashed p-5">
                    <div className="text-sm text-muted-foreground">Cargando bandeja...</div>
                  </Card>
                )}
                {!isLoading && paginatedItems.length === 0 && (
                  <Card className="col-span-3 border-dashed p-5">
                    <div className="text-sm text-muted-foreground">No hay PQRSF para mostrar.</div>
                  </Card>
                )}
                {paginatedItems.map((item) => (
                  <PQRSFCard
                    key={item.id}
                    item={item}
                    actionLabel="Ver Detalle"
                  />
                ))}
              </div>
            </div>

            <div className="shrink-0 mt-auto">
              <PQRSFPagination
                currentPage={safeCurrentPage}
                totalPages={totalPages}
                onPageChange={setSafeCurrentPage}
              />
            </div>
          </TabsContent>

          {user?.rol === "Administrador" && (
            <>
              <TabsContent value="seguimiento" className="flex-1 flex flex-col min-h-0 mt-0">
                <SeguimientoTabContent />
              </TabsContent>

              <TabsContent value="cerradas" className="flex-1 flex flex-col min-h-0 mt-0">
                <CerradasTabContent />
              </TabsContent>

              <TabsContent value="apelacion" className="flex-1 flex flex-col min-h-0 mt-0">
                <ApelacionTabContent />
              </TabsContent>

              <TabsContent value="encuestas" className="flex-1 flex flex-col min-h-0 mt-0">
                <EncuestasTabContent />
              </TabsContent>
            </>
          )}

          {user?.rol === "Usuario de Área Responsable" && (
            <>
              <TabsContent value="analisis" className="flex-1 flex flex-col min-h-0 mt-0">
                <AnalisisPendienteTabContent />
              </TabsContent>

              <TabsContent value="cerradas" className="flex-1 flex flex-col min-h-0 mt-0">
                <CerradasTabContent />
              </TabsContent>
            </>
          )}
        </Tabs>
      </main>
    </div>
  )
}

// Componente interno para Seguimiento
function SeguimientoTabContent() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("todas")
  const itemsPerPage = 9
  const [items, setItems] = useState<SeguimientoItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [actionState, setActionState] = useState<{ id: number; type: "finalize" | "appeal" } | null>(null)

  useEffect(() => {
    if (!user || user.rol !== "Administrador") return
    let active = true
    const loadSeguimiento = async () => {
      setIsLoading(true)
      setError("")
      try {
        const data = await pqrsfService.getSeguimiento()
        if (!active) return
        setItems(data)
      } catch (err) {
        if (!active) return
        console.error("[seguimiento] load error", err)
        setError("No se pudo cargar el seguimiento de PQRSF.")
      } finally {
        if (active) setIsLoading(false)
      }
    }
    void loadSeguimiento()
    return () => {
      active = false
    }
  }, [user])

  const formattedItems = useMemo<UnifiedPQRSFItem[]>(() => {
    return items.map(transformSeguimientoItem)
  }, [items])

  const filteredPQRSF = formattedItems.filter((p) => {
    const matchSearch =
      p.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.clientName || "").toLowerCase().includes(searchTerm.toLowerCase())
    const matchEstado = filtroEstado === "todas" || 
      (filtroEstado === "satisfecho" && p.satisfaction && ["Satisfecho", "Muy Satisfecho"].includes(p.satisfaction)) ||
      (filtroEstado === "insatisfecho" && p.satisfaction && !["Satisfecho", "Muy Satisfecho"].includes(p.satisfaction)) ||
      (filtroEstado === "sin_respuesta" && !p.satisfaction)
    return matchSearch && matchEstado
  })

  const { currentPage, totalPages, paginatedItems, setCurrentPage } = usePagination({
    items: filteredPQRSF,
    itemsPerPage,
    dependencies: [searchTerm, filtroEstado],
  })

  const handleFinalize = async (id: number) => {
    setActionState({ id, type: "finalize" })
    setError("")
    try {
      await pqrsfService.finalize(id)
      try {
        await pqrsfService.getBotResponse(id)
      } catch (err) {
        console.warn("[pqrsf-list] bot-response error", err)
      }
      setItems((prev) => prev.filter((item) => item.id !== id))
    } catch (err) {
      console.error("[seguimiento] finalize error", err)
      setError("No se pudo finalizar la PQRSF.")
    } finally {
      setActionState(null)
    }
  }

  const handleAppeal = async (id: number) => {
    setActionState({ id, type: "appeal" })
    setError("")
    try {
      await pqrsfService.appeal(id)
      setItems((prev) => prev.filter((item) => item.id !== id))
    } catch (err) {
      console.error("[seguimiento] appeal error", err)
      setError("No se pudo enviar la PQRSF a apelación.")
    } finally {
      setActionState(null)
    }
  }

  if (!user || user.rol !== "Administrador") {
    return <div className="text-sm text-muted-foreground">No tienes permisos para ver esta sección.</div>
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <CardContent className="p-0 pb-6 mb-6 shrink-0">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por radicado o solicitante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filtroEstado} onValueChange={setFiltroEstado}>
            <SelectTrigger className="w-full sm:w-50">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              <SelectItem value="satisfecho">Cliente Satisfecho</SelectItem>
              <SelectItem value="insatisfecho">Cliente Insatisfecho</SelectItem>
              <SelectItem value="sin_respuesta">Sin Respuesta</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto mb-6">
        <div className="grid grid-cols-3 auto-rows-fr gap-4">
          {isLoading && (
            <Card className="col-span-3 border-dashed p-5">
              <div className="text-sm text-muted-foreground">Cargando seguimiento...</div>
            </Card>
          )}
          {!isLoading && paginatedItems.length === 0 && (
            <Card className="col-span-3 border-dashed p-5">
              <div className="text-sm text-muted-foreground">No hay PQRSF en seguimiento.</div>
            </Card>
          )}
          {paginatedItems.map((pqrsf) => (
            <PQRSFCard
              key={pqrsf.id}
              item={pqrsf}
              actionLabel="Ver Detalle"
            />
          ))}
        </div>
      </div>

      <div className="shrink-0 mt-auto">
        <PQRSFPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  )
}

// Componente interno para Cerradas
function CerradasTabContent() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroTipo, setFiltroTipo] = useState("todos")
  const itemsPerPage = 9
  const [items, setItems] = useState<CerradaItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!user || (user.rol !== "Administrador" && user.rol !== "Usuario de Área Responsable")) return
    let active = true
    const loadCerradas = async () => {
      setIsLoading(true)
      setError("")
      try {
        const data = await pqrsfService.getCerradas()
        if (!active) return
        setItems(data)
      } catch (err) {
        if (!active) return
        console.error("[cerradas] load error", err)
        setError("No se pudo cargar las PQRSF cerradas.")
      } finally {
        if (active) setIsLoading(false)
      }
    }
    void loadCerradas()
    return () => {
      active = false
    }
  }, [user])

  const formattedItems = useMemo<UnifiedPQRSFItem[]>(() => {
    return items.map(transformCerradaItem)
  }, [items])

  const filteredPQRSF = formattedItems.filter((p) => {
    const matchSearch =
      p.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.clientName || "").toLowerCase().includes(searchTerm.toLowerCase())
    const matchTipo = filtroTipo === "todos" || p.typeName === filtroTipo
    return matchSearch && matchTipo
  })

  const { currentPage, totalPages, paginatedItems, setCurrentPage } = usePagination({
    items: filteredPQRSF,
    itemsPerPage,
    dependencies: [searchTerm, filtroTipo],
  })

  if (!user || (user.rol !== "Administrador" && user.rol !== "Usuario de Área Responsable")) {
    return <div className="text-sm text-muted-foreground">No tienes permisos para ver esta sección.</div>
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <CardContent className="pb-6 px-0 mb-6 shrink-0">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por radicado o solicitante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filtroTipo} onValueChange={setFiltroTipo}>
            <SelectTrigger className="w-full sm:w-50">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los tipos</SelectItem>
              <SelectItem value="Petición">Petición</SelectItem>
              <SelectItem value="Queja">Queja</SelectItem>
              <SelectItem value="Reclamo">Reclamo</SelectItem>
              <SelectItem value="Sugerencia">Sugerencia</SelectItem>
              <SelectItem value="Felicitación">Felicitación</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto mb-6">
        <div className="grid grid-cols-3 auto-rows-fr gap-4">
          {isLoading && (
            <Card className="col-span-3 border-dashed p-5">
              <div className="text-sm text-muted-foreground">Cargando cerradas...</div>
            </Card>
          )}
          {!isLoading && paginatedItems.length === 0 && (
            <Card className="col-span-3 border-dashed p-5">
              <div className="text-sm text-muted-foreground">No hay PQRSF cerradas.</div>
            </Card>
          )}
          {paginatedItems.map((pqrsf) => (
            <PQRSFCard
              key={pqrsf.id}
              item={pqrsf}
              actionLabel="Ver Historial Completo"
            />
          ))}
        </div>
      </div>

      <div className="shrink-0 mt-auto">
        <PQRSFPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  )
}

// Componente interno para En Apelación
function ApelacionTabContent() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroArea, setFiltroArea] = useState("todas")
  const itemsPerPage = 9
  const [items, setItems] = useState<ApelacionItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!user || user.rol !== "Administrador") return
    let active = true
    const loadApelaciones = async () => {
      setIsLoading(true)
      setError("")
      try {
        const data = await pqrsfService.getApelaciones()
        if (!active) return
        setItems(data)
      } catch (err) {
        if (!active) return
        console.error("[apelaciones] load error", err)
        setError("No se pudo cargar las PQRSF en apelación.")
      } finally {
        if (active) setIsLoading(false)
      }
    }
    void loadApelaciones()
    return () => {
      active = false
    }
  }, [user])

  const formattedItems = useMemo<UnifiedPQRSFItem[]>(() => {
    return items.map(transformApelacionItem)
  }, [items])

  const filteredPQRSF = formattedItems.filter((p) => {
    const matchSearch =
      p.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.clientName || "").toLowerCase().includes(searchTerm.toLowerCase())
    const matchArea = filtroArea === "todas" || p.areaName === filtroArea
    return matchSearch && matchArea
  })

  const { currentPage, totalPages, paginatedItems, setCurrentPage } = usePagination({
    items: filteredPQRSF,
    itemsPerPage,
    dependencies: [searchTerm, filtroArea],
  })

  if (!user || user.rol !== "Administrador") {
    return <div className="text-sm text-muted-foreground">No tienes permisos para ver esta sección.</div>
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <CardContent className="pb-6 px-0 mb-6 shrink-0">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por radicado o solicitante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filtroArea} onValueChange={setFiltroArea}>
            <SelectTrigger className="w-full sm:w-62.5">
              <SelectValue placeholder="Filtrar por área" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las áreas</SelectItem>
              <SelectItem value="Área Responsable (Operativa)">Área Responsable</SelectItem>
              <SelectItem value="Servicio al Cliente">Servicio al Cliente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto mb-6">
        <div className="grid grid-cols-3 auto-rows-fr gap-4">
          {isLoading && (
            <Card className="col-span-3 border-dashed p-5">
              <div className="text-sm text-muted-foreground">Cargando apelaciones...</div>
            </Card>
          )}
          {!isLoading && paginatedItems.length === 0 && (
            <Card className="col-span-3 border-dashed p-5">
              <div className="text-sm text-muted-foreground">No hay PQRSF en apelación.</div>
            </Card>
          )}
          {paginatedItems.map((pqrsf) => (
            <PQRSFCard
              key={pqrsf.id}
              item={pqrsf}
              actionLabel="Ver Detalle Completo"
              showPriority={true}
            />
          ))}
        </div>
      </div>

      <div className="shrink-0 mt-auto">
        <PQRSFPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  )
}

// Componente interno para Análisis Pendiente
function AnalisisPendienteTabContent() {
  const { user } = useAuth()
  const [pending, setPending] = useState<AreaPendingItem[]>([])
  const [areaName, setAreaName] = useState<string>("")
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("todos")
  const [dateFilter, setDateFilter] = useState("")
  const itemsPerPage = 9

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

  const formatDate = (value?: string | null) => {
    if (!value) return ""
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ""
    return date.toISOString().split("T")[0]
  }

  const formattedItems = useMemo<UnifiedPQRSFItem[]>(() => {
    return pending.map(transformAreaPendingItem)
  }, [pending])

  const filteredPending = useMemo(() => {
    const query = searchTerm.toLowerCase()
    return formattedItems.filter((item) => {
      const matchesPriority = priorityFilter === "todos" || (item.priority?.toLowerCase() === priorityFilter)
      const matchesQuery =
        item.ticketNumber.toLowerCase().includes(query) ||
        (item.clientName ?? "").toLowerCase().includes(query) ||
        (item.description ?? "").toLowerCase().includes(query)
      const matchesDate = dateFilter ? formatDate(item.createdAt) === dateFilter : true
      return matchesPriority && matchesQuery && matchesDate
    })
  }, [formattedItems, searchTerm, priorityFilter, dateFilter])

  const { currentPage, totalPages, paginatedItems, setCurrentPage } = usePagination({
    items: filteredPending,
    itemsPerPage,
    dependencies: [searchTerm, priorityFilter, dateFilter],
  })

  if (!user || user.rol !== "Usuario de Área Responsable") {
    return <div className="text-sm text-muted-foreground">No tienes permisos para ver esta sección.</div>
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <CardContent className="pb-6 px-0 mb-6 shrink-0">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por radicado, solicitante o descripción..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full md:w-50">
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

          <div className="relative w-full md:w-50">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              className="pl-10"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
        </div>
      </CardContent>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto mb-6">
        <div className="grid grid-cols-3 auto-rows-fr gap-4">
          {isLoadingData && (
            <Card className="col-span-3 border-dashed p-5">
              <div className="text-sm text-muted-foreground">Cargando pendientes...</div>
            </Card>
          )}
          {!isLoadingData && paginatedItems.length === 0 && (
            <Card className="col-span-3 border-dashed p-5">
              <div className="text-sm text-muted-foreground">No hay PQRSF pendientes para mostrar.</div>
            </Card>
          )}
          {paginatedItems.map((item) => (
            <PQRSFCard
              key={item.id}
              item={item}
              actionLabel="Responder al Cliente"
              showPriority={true}
            />
          ))}
        </div>
      </div>

      <div className="shrink-0 mt-auto">
        <PQRSFPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  )
}

// Componente interno para Encuestas
function EncuestasTabContent() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [items, setItems] = useState<PQRSFSurveyDetailed[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const itemsPerPage = 9

  useEffect(() => {
    let active = true
    const loadSurveys = async () => {
      setIsLoading(true)
      setError("")
      try {
        const data = await surveyService.listAdmin()
        if (!active) return
        setItems(data)
      } catch (err) {
        if (!active) return
        console.error("[surveys] load error", err)
        setError("No se pudieron cargar las encuestas.")
      } finally {
        if (active) setIsLoading(false)
      }
    }
    void loadSurveys()
    return () => {
      active = false
    }
  }, [])

  const formattedItems = useMemo<UnifiedPQRSFItem[]>(() => {
    return items.map(transformSurveyItem)
  }, [items])

  const QUESTION_LABELS = [
    { key: "q1Clarity", label: "Claridad del proceso" },
    { key: "q2Timeliness", label: "Tiempo de respuesta" },
    { key: "q3Quality", label: "Calidad de la respuesta" },
    { key: "q4Attention", label: "Trato y atencion" },
    { key: "q5Overall", label: "Satisfaccion general" },
  ] as const

  const formatScore = (value: number | null) => {
    if (typeof value !== "number") return "Sin respuesta"
    return `${value} / 5`
  }

  const computePercentage = (survey: PQRSFSurveyDetailed) => {
    const totalStars = [
      survey.q1Clarity,
      survey.q2Timeliness,
      survey.q3Quality,
      survey.q4Attention,
      survey.q5Overall,
    ]
      .filter((value): value is number => typeof value === "number")
      .reduce((sum, value) => sum + value, 0)
    
    if (totalStars === 0) return null
    // Fórmula: (número de estrellas / 25) * 5
    const percentage = (totalStars / 25) * 5
    return percentage
  }

  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return formattedItems
    return formattedItems.filter((item) => {
      const ticket = item.ticketNumber.toLowerCase()
      const client = (item.clientName || "").toLowerCase()
      const area = item.areaName.toLowerCase()
      return ticket.includes(term) || client.includes(term) || area.includes(term)
    })
  }, [formattedItems, searchTerm])

  const { currentPage, totalPages, paginatedItems, setCurrentPage } = usePagination({
    items: filteredItems,
    itemsPerPage,
    dependencies: [searchTerm],
  })

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <CardContent className="pb-6 px-0 mb-6 shrink-0">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por radicado, solicitante o area..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardContent>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto mb-6">
        <div className="grid grid-cols-3 auto-rows-fr gap-4">
          {isLoading && (
            <Card className="col-span-3 border-dashed p-5">
              <div className="text-sm text-muted-foreground">Cargando encuestas...</div>
            </Card>
          )}
          {!isLoading && paginatedItems.length === 0 && (
            <Card className="col-span-3 border-dashed p-5">
              <div className="text-sm text-muted-foreground">No hay encuestas registradas.</div>
            </Card>
          )}

          {paginatedItems.map((unifiedItem) => {
            // Necesitamos el item original para el diálogo de puntajes
            const originalItem = items.find((i) => i.id === unifiedItem.id)
            if (!originalItem) return null
            
            const percentage = computePercentage(originalItem)
            
            return (
              <div key={unifiedItem.id} className="relative">
                <PQRSFCard
                  item={unifiedItem}
                  actionLabel="Ver Detalle"
                />
                <div className="absolute top-5 right-5 z-10">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2 bg-background shadow-sm">
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                        {percentage !== null ? percentage.toFixed(1) : "Sin puntaje"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-xl">
                      <DialogHeader>
                        <DialogTitle>Detalle de encuesta</DialogTitle>
                        <DialogDescription>
                          {originalItem.ticketNumber} • {originalItem.clientName || "Anonimo"}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-3">
                        {QUESTION_LABELS.map((question) => {
                          const value = originalItem[question.key]
                          return (
                            <div
                              key={question.key}
                              className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm"
                            >
                              <span className="text-foreground">{question.label}</span>
                              <span className="font-semibold text-foreground">{formatScore(value as number)}</span>
                            </div>
                          )
                        })}
                      </div>
                      {originalItem.comment && (
                        <div className="rounded-lg border border-border bg-muted/20 p-3 text-sm text-muted-foreground">
                          "{originalItem.comment}"
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="shrink-0 mt-auto">
        <PQRSFPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  )
}
