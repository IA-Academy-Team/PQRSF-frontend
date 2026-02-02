import { useState, useMemo, useEffect } from "react"
import type { DateRange } from "react-day-picker"
import { Search, Filter, Calendar as CalendarIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Sidebar } from "@/components/sidebar"
import { useSidebar } from "@/contexts/sidebar-context"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { pqrsfService, type PQRSFListItem, type PQRSFListQuery, type SeguimientoItem, type CerradaItem, type ApelacionItem } from "@/services/pqrsf.service"
import { areaService } from "@/services/area.service"
import { catalogService } from "@/services/catalog.service"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { dashboardService, type AreaPendingItem } from "@/services/dashboard.service"
import { PQRSFCard, type UnifiedPQRSFItem } from "@/components/PQRSFCard"
import { PQRSFPagination } from "@/components/PQRSFPagination"
import { usePagination } from "@/hooks/usePagination"
import { useSearchParams } from "react-router-dom"
import {
  transformSeguimientoItem,
  transformCerradaItem,
  transformApelacionItem,
  transformAreaPendingItem,
  getDescription,
} from "@/lib/pqrsf-transformers"
import { ITEMS_PER_PAGE } from "@/lib/pqrsf-utils"

/** Formatea YYYY-MM-DD a texto corto legible (ej: 28 ene 2026) */
function formatDateLabel(isoDate: string): string {
  const d = new Date(isoDate + "T12:00:00")
  if (Number.isNaN(d.getTime())) return isoDate
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })
}

export default function PQRSFList() {
  const { isCollapsed } = useSidebar()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("general")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = ITEMS_PER_PAGE
  const [items, setItems] = useState<PQRSFListItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [typeFilter, setTypeFilter] = useState("todos")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [sortFilter, setSortFilter] = useState("recent")
  const [areaId, setAreaId] = useState<number | null>(null)
  const [areaFilter, setAreaFilter] = useState("todos")
  const [areasList, setAreasList] = useState<{ id: number; name: string }[]>([])
  const [typesList, setTypesList] = useState<{ id: number; name: string }[]>([])
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
    if (!user || user.rol !== "Administrador") return
    let active = true
    areaService
      .getAll()
      .then((list) => {
        if (!active) return
        setAreasList(list.map((a) => ({ id: a.id, name: a.name })))
      })
      .catch(() => {
        if (active) setAreasList([])
      })
    return () => {
      active = false
    }
  }, [user])

  useEffect(() => {
    let active = true
    catalogService
      .getTypePQRSF()
      .then((list) => {
        if (!active) return
        setTypesList(list.map((t) => ({ id: t.id, name: t.name })))
      })
      .catch(() => {
        if (active) setTypesList([])
      })
    return () => {
      active = false
    }
  }, [])

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
        } else if (user?.rol === "Administrador" && areaFilter !== "todos") {
          query.areaId = Number(areaFilter)
        }
        if (statusFilter !== "todos") {
          query.pqrsStatusId = Number(statusFilter)
        }
        if (typeFilter !== "todos") {
          query.typePqrsId = Number(typeFilter)
        }
        if (dateFrom) query.fromDate = dateFrom
        if (dateTo) query.toDate = dateTo

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
  }, [searchTerm, statusFilter, typeFilter, dateFrom, dateTo, sortFilter, user, areaId, areaFilter])

  const formattedItems = useMemo<UnifiedPQRSFItem[]>(
    () =>
      items.map((item) => ({
        id: item.id,
        ticketNumber: item.ticketNumber,
        typeName: item.typeName,
        statusName: item.statusName,
        description: getDescription(item),
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
    dependencies: [searchTerm, statusFilter, typeFilter, dateFrom, dateTo, sortFilter],
  })

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />

      <main
        className={cn(
          "flex-1 flex flex-col min-h-0 p-4 sm:p-6 lg:p-8 min-[1600px]:p-10 transition-all duration-300 overflow-hidden",
          isCollapsed ? "lg:ml-24" : "lg:ml-64",
        )}
      >
        <div className="shrink-0 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl min-[1600px]:text-4xl font-bold text-foreground mb-1 sm:mb-2 min-[1600px]:mb-3">Listado General de PQRSF</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <TabsList className="mb-4 sm:mb-6 shrink-0">
            <TabsTrigger value="general">Listado General</TabsTrigger>
            {user?.rol === "Administrador" && (
              <>
                <TabsTrigger value="seguimiento">Seguimiento</TabsTrigger>
                <TabsTrigger value="cerradas">Cerradas</TabsTrigger>
                <TabsTrigger value="apelacion">En Apelación</TabsTrigger>
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
            <CardContent className="pb-2 px-0 mb-4 sm:mb-6 shrink-0">
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

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-50">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los tipos</SelectItem>
                    {typesList.map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {user?.rol === "Administrador" && (
                  <Select value={areaFilter} onValueChange={setAreaFilter}>
                    <SelectTrigger className="w-full md:w-50">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Todas las áreas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas las áreas</SelectItem>
                      {areasList.map((a) => (
                        <SelectItem key={a.id} value={String(a.id)}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full md:w-50 justify-start text-left font-normal pl-10 text-sm min-w-0 truncate",
                        !dateFrom && !dateTo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                      <span className="truncate">
                        {dateFrom && dateTo
                          ? `${formatDateLabel(dateFrom)} — ${formatDateLabel(dateTo)}`
                          : dateFrom
                            ? `Desde ${formatDateLabel(dateFrom)}`
                            : "Rango de fechas (desde — hasta)"}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      defaultMonth={dateFrom ? new Date(dateFrom + "T12:00:00") : undefined}
                      selected={
                        dateFrom
                          ? {
                              from: new Date(dateFrom + "T12:00:00"),
                              to: dateTo ? new Date(dateTo + "T12:00:00") : undefined,
                            }
                          : undefined
                      }
                      onSelect={(range: DateRange | undefined) => {
                        setDateFrom(range?.from ? range.from.toISOString().split("T")[0] : "")
                        setDateTo(range?.to ? range.to.toISOString().split("T")[0] : "")
                      }}
                      numberOfMonths={1}
                    />
                  </PopoverContent>
                </Popover>

                <Select value={sortFilter} onValueChange={setSortFilter}>
                  <SelectTrigger className="w-full md:w-55 [&_[data-slot=select-value]]:flex-1 [&_[data-slot=select-value]]:justify-center">
                    <Filter className="h-4 w-4 mr-2 shrink-0" />
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Reciente</SelectItem>
                    <SelectItem value="oldest">Antigua</SelectItem>
                    <SelectItem value="ticket">Ticket</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 min-[1600px]:p-5 text-sm min-[1600px]:text-base text-red-700">
                {error}
              </div>
            )}

            <div className="flex-1 min-h-0 overflow-hidden mb-2">
              <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-2 auto-rows-fr min-h-full gap-3 md:gap-4 min-[1600px]:gap-5">
                {isLoading && (
                  <Card className="col-span-full border-dashed p-4 sm:p-5">
                    <div className="text-sm text-muted-foreground">Cargando bandeja...</div>
                  </Card>
                )}
                {!isLoading && paginatedItems.length === 0 && (
                  <Card className="col-span-full border-dashed p-4 sm:p-5">
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
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [filtroTipo, setFiltroTipo] = useState("todos")
  const [filtroArea, setFiltroArea] = useState("todas")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [sortFilter, setSortFilter] = useState<"recent" | "oldest" | "ticket">("recent")
  const [areasSeguimiento, setAreasSeguimiento] = useState<{ id: number; name: string }[]>([])
  const [statusList, setStatusList] = useState<{ id: number; name: string }[]>([])
  const [typesList, setTypesList] = useState<{ id: number; name: string }[]>([])
  const itemsPerPage = ITEMS_PER_PAGE
  const [items, setItems] = useState<SeguimientoItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [actionState, setActionState] = useState<{ id: number; type: "finalize" | "appeal" } | null>(null)

  useEffect(() => {
    if (!user || user.rol !== "Administrador") return
    let active = true
    areaService.getAll().then((list) => {
      if (!active) return
      setAreasSeguimiento(list.map((a) => ({ id: a.id, name: a.name })))
    }).catch(() => { if (active) setAreasSeguimiento([]) })
    return () => { active = false }
  }, [user])

  useEffect(() => {
    let active = true
    catalogService.getPQRSStatus().then((list) => {
      if (!active) return
      setStatusList(list.map((s) => ({ id: s.id, name: s.name })))
    }).catch(() => { if (active) setStatusList([]) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    catalogService.getTypePQRSF().then((list) => {
      if (!active) return
      setTypesList(list.map((t) => ({ id: t.id, name: t.name })))
    }).catch(() => { if (active) setTypesList([]) })
    return () => { active = false }
  }, [])

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

  const filteredPQRSF = useMemo(() => {
    const filtered = formattedItems.filter((p) => {
      const matchSearch =
        p.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.clientName || "").toLowerCase().includes(searchTerm.toLowerCase())
      const matchEstado = filtroEstado === "todos" || p.statusName === filtroEstado
      const matchTipo = filtroTipo === "todos" || p.typeName === filtroTipo
      const matchArea = filtroArea === "todas" || p.areaName === filtroArea
      const fechaItem = p.createdAt ? p.createdAt.slice(0, 10) : ""
      const matchFecha =
        (!dateFrom || (fechaItem && fechaItem >= dateFrom)) &&
        (!dateTo || (fechaItem && fechaItem <= dateTo))
      return matchSearch && matchEstado && matchTipo && matchArea && matchFecha
    })
    if (sortFilter === "oldest") {
      return [...filtered].sort((a, b) => (a.createdAt || "").localeCompare(b.createdAt || ""))
    }
    if (sortFilter === "ticket") {
      return [...filtered].sort((a, b) => a.ticketNumber.localeCompare(b.ticketNumber))
    }
    return [...filtered].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
  }, [formattedItems, searchTerm, filtroEstado, filtroTipo, filtroArea, dateFrom, dateTo, sortFilter])

  const { currentPage, totalPages, paginatedItems, setCurrentPage } = usePagination({
    items: filteredPQRSF,
    itemsPerPage,
    dependencies: [searchTerm, filtroEstado, filtroTipo, filtroArea, dateFrom, dateTo, sortFilter],
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
      <CardContent className="pb-2 px-0 mb-4 sm:mb-6 shrink-0">
        <div className="flex flex-col md:flex-row gap-4">
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
            <SelectTrigger className="w-full md:w-50">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              {statusList.map((s) => (
                <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filtroTipo} onValueChange={setFiltroTipo}>
            <SelectTrigger className="w-full md:w-50">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Todos los tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los tipos</SelectItem>
              {typesList.map((t) => (
                <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {user?.rol === "Administrador" && (
            <Select value={filtroArea} onValueChange={setFiltroArea}>
              <SelectTrigger className="w-full md:w-50">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Todas las áreas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las áreas</SelectItem>
                {areasSeguimiento.map((a) => (
                  <SelectItem key={a.id} value={a.name}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full md:w-50 justify-start text-left font-normal pl-10 text-sm min-w-0 truncate",
                  !dateFrom && !dateTo && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                <span className="truncate">
                  {dateFrom && dateTo
                    ? `${formatDateLabel(dateFrom)} — ${formatDateLabel(dateTo)}`
                    : dateFrom
                      ? `Desde ${formatDateLabel(dateFrom)}`
                      : "Rango de fechas (desde — hasta)"}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                defaultMonth={dateFrom ? new Date(dateFrom + "T12:00:00") : undefined}
                selected={
                  dateFrom
                    ? { from: new Date(dateFrom + "T12:00:00"), to: dateTo ? new Date(dateTo + "T12:00:00") : undefined }
                    : undefined
                }
                onSelect={(range: DateRange | undefined) => {
                  setDateFrom(range?.from ? range.from.toISOString().split("T")[0] : "")
                  setDateTo(range?.to ? range.to.toISOString().split("T")[0] : "")
                }}
                numberOfMonths={1}
              />
            </PopoverContent>
          </Popover>
          <Select value={sortFilter} onValueChange={(v) => setSortFilter(v as "recent" | "oldest" | "ticket")}>
            <SelectTrigger className="w-full md:w-55 [&_[data-slot=select-value]]:flex-1 [&_[data-slot=select-value]]:justify-center">
              <Filter className="h-4 w-4 mr-2 shrink-0" />
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Reciente</SelectItem>
              <SelectItem value="oldest">Antigua</SelectItem>
              <SelectItem value="ticket">Ticket</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-hidden mb-2">
        <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-2 auto-rows-fr min-h-full gap-3 md:gap-4 min-[1600px]:gap-5">
          {isLoading && (
            <Card className="col-span-full border-dashed p-4 sm:p-5">
              <div className="text-sm text-muted-foreground">Cargando seguimiento...</div>
            </Card>
          )}
          {!isLoading && paginatedItems.length === 0 && (
            <Card className="col-span-full border-dashed p-4 sm:p-5">
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
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [filtroTipo, setFiltroTipo] = useState("todos")
  const [filtroArea, setFiltroArea] = useState("todas")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [sortFilter, setSortFilter] = useState<"recent" | "oldest" | "ticket">("recent")
  const [areasCerradas, setAreasCerradas] = useState<{ id: number; name: string }[]>([])
  const [statusList, setStatusList] = useState<{ id: number; name: string }[]>([])
  const [typesList, setTypesList] = useState<{ id: number; name: string }[]>([])
  const itemsPerPage = ITEMS_PER_PAGE
  const [items, setItems] = useState<CerradaItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!user || (user.rol !== "Administrador" && user.rol !== "Usuario de Área Responsable")) return
    let active = true
    areaService.getAll().then((list) => {
      if (!active) return
      setAreasCerradas(list.map((a) => ({ id: a.id, name: a.name })))
    }).catch(() => { if (active) setAreasCerradas([]) })
    return () => { active = false }
  }, [user])

  useEffect(() => {
    let active = true
    catalogService.getPQRSStatus().then((list) => {
      if (!active) return
      setStatusList(list.map((s) => ({ id: s.id, name: s.name })))
    }).catch(() => { if (active) setStatusList([]) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    catalogService.getTypePQRSF().then((list) => {
      if (!active) return
      setTypesList(list.map((t) => ({ id: t.id, name: t.name })))
    }).catch(() => { if (active) setTypesList([]) })
    return () => { active = false }
  }, [])

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

  const filteredPQRSF = useMemo(() => {
    const filtered = formattedItems.filter((p) => {
      const matchSearch =
        p.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.clientName || "").toLowerCase().includes(searchTerm.toLowerCase())
      const matchEstado = filtroEstado === "todos" || p.statusName === filtroEstado
      const matchTipo = filtroTipo === "todos" || p.typeName === filtroTipo
      const matchArea = filtroArea === "todas" || p.areaName === filtroArea
      const fechaItem = p.createdAt ? p.createdAt.slice(0, 10) : ""
      const matchFecha =
        (!dateFrom || (fechaItem && fechaItem >= dateFrom)) &&
        (!dateTo || (fechaItem && fechaItem <= dateTo))
      return matchSearch && matchEstado && matchTipo && matchArea && matchFecha
    })
    if (sortFilter === "oldest") {
      return [...filtered].sort((a, b) => (a.createdAt || "").localeCompare(b.createdAt || ""))
    }
    if (sortFilter === "ticket") {
      return [...filtered].sort((a, b) => a.ticketNumber.localeCompare(b.ticketNumber))
    }
    return [...filtered].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
  }, [formattedItems, searchTerm, filtroEstado, filtroTipo, filtroArea, dateFrom, dateTo, sortFilter])

  const { currentPage, totalPages, paginatedItems, setCurrentPage } = usePagination({
    items: filteredPQRSF,
    itemsPerPage,
    dependencies: [searchTerm, filtroEstado, filtroTipo, filtroArea, dateFrom, dateTo, sortFilter],
  })

  if (!user || (user.rol !== "Administrador" && user.rol !== "Usuario de Área Responsable")) {
    return <div className="text-sm text-muted-foreground">No tienes permisos para ver esta sección.</div>
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <CardContent className="pb-2 px-0 mb-4 sm:mb-6 shrink-0">
        <div className="flex flex-col md:flex-row gap-4">
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
            <SelectTrigger className="w-full md:w-50">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              {statusList.map((s) => (
                <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filtroTipo} onValueChange={setFiltroTipo}>
            <SelectTrigger className="w-full md:w-50">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Todos los tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los tipos</SelectItem>
              {typesList.map((t) => (
                <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {user?.rol === "Administrador" && (
            <Select value={filtroArea} onValueChange={setFiltroArea}>
              <SelectTrigger className="w-full md:w-50">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Todas las áreas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las áreas</SelectItem>
                {areasCerradas.map((a) => (
                  <SelectItem key={a.id} value={a.name}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full md:w-50 justify-start text-left font-normal pl-10 text-sm min-w-0 truncate",
                  !dateFrom && !dateTo && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                <span className="truncate">
                  {dateFrom && dateTo
                    ? `${formatDateLabel(dateFrom)} — ${formatDateLabel(dateTo)}`
                    : dateFrom
                      ? `Desde ${formatDateLabel(dateFrom)}`
                      : "Rango de fechas (desde — hasta)"}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                defaultMonth={dateFrom ? new Date(dateFrom + "T12:00:00") : undefined}
                selected={
                  dateFrom
                    ? { from: new Date(dateFrom + "T12:00:00"), to: dateTo ? new Date(dateTo + "T12:00:00") : undefined }
                    : undefined
                }
                onSelect={(range: DateRange | undefined) => {
                  setDateFrom(range?.from ? range.from.toISOString().split("T")[0] : "")
                  setDateTo(range?.to ? range.to.toISOString().split("T")[0] : "")
                }}
                numberOfMonths={1}
              />
            </PopoverContent>
          </Popover>
          <Select value={sortFilter} onValueChange={(v) => setSortFilter(v as "recent" | "oldest" | "ticket")}>
            <SelectTrigger className="w-full md:w-55 [&_[data-slot=select-value]]:flex-1 [&_[data-slot=select-value]]:justify-center">
              <Filter className="h-4 w-4 mr-2 shrink-0" />
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Reciente</SelectItem>
              <SelectItem value="oldest">Antigua</SelectItem>
              <SelectItem value="ticket">Ticket</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-hidden mb-2">
        <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-2 auto-rows-fr min-h-full gap-3 md:gap-4 min-[1600px]:gap-5">
          {isLoading && (
            <Card className="col-span-full border-dashed p-4 sm:p-5">
              <div className="text-sm text-muted-foreground">Cargando cerradas...</div>
            </Card>
          )}
          {!isLoading && paginatedItems.length === 0 && (
            <Card className="col-span-full border-dashed p-4 sm:p-5">
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
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [filtroTipo, setFiltroTipo] = useState("todos")
  const [filtroArea, setFiltroArea] = useState("todas")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [sortFilter, setSortFilter] = useState<"recent" | "oldest" | "ticket">("recent")
  const [areasApelacion, setAreasApelacion] = useState<{ id: number; name: string }[]>([])
  const [statusList, setStatusList] = useState<{ id: number; name: string }[]>([])
  const [typesList, setTypesList] = useState<{ id: number; name: string }[]>([])
  const itemsPerPage = ITEMS_PER_PAGE
  const [items, setItems] = useState<ApelacionItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!user || user.rol !== "Administrador") return
    let active = true
    areaService.getAll().then((list) => {
      if (!active) return
      setAreasApelacion(list.map((a) => ({ id: a.id, name: a.name })))
    }).catch(() => { if (active) setAreasApelacion([]) })
    return () => { active = false }
  }, [user])

  useEffect(() => {
    let active = true
    catalogService.getPQRSStatus().then((list) => {
      if (!active) return
      setStatusList(list.map((s) => ({ id: s.id, name: s.name })))
    }).catch(() => { if (active) setStatusList([]) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    catalogService.getTypePQRSF().then((list) => {
      if (!active) return
      setTypesList(list.map((t) => ({ id: t.id, name: t.name })))
    }).catch(() => { if (active) setTypesList([]) })
    return () => { active = false }
  }, [])

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

  const filteredPQRSF = useMemo(() => {
    const filtered = formattedItems.filter((p) => {
      const matchSearch =
        p.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.clientName || "").toLowerCase().includes(searchTerm.toLowerCase())
      const matchEstado = filtroEstado === "todos" || p.statusName === filtroEstado
      const matchTipo = filtroTipo === "todos" || p.typeName === filtroTipo
      const matchArea = filtroArea === "todas" || p.areaName === filtroArea
      const fechaItem = p.createdAt ? p.createdAt.slice(0, 10) : ""
      const matchFecha =
        (!dateFrom || (fechaItem && fechaItem >= dateFrom)) &&
        (!dateTo || (fechaItem && fechaItem <= dateTo))
      return matchSearch && matchEstado && matchTipo && matchArea && matchFecha
    })
    if (sortFilter === "oldest") {
      return [...filtered].sort((a, b) => (a.createdAt || "").localeCompare(b.createdAt || ""))
    }
    if (sortFilter === "ticket") {
      return [...filtered].sort((a, b) => a.ticketNumber.localeCompare(b.ticketNumber))
    }
    return [...filtered].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
  }, [formattedItems, searchTerm, filtroEstado, filtroTipo, filtroArea, dateFrom, dateTo, sortFilter])

  const { currentPage, totalPages, paginatedItems, setCurrentPage } = usePagination({
    items: filteredPQRSF,
    itemsPerPage,
    dependencies: [searchTerm, filtroEstado, filtroTipo, filtroArea, dateFrom, dateTo, sortFilter],
  })

  if (!user || user.rol !== "Administrador") {
    return <div className="text-sm text-muted-foreground">No tienes permisos para ver esta sección.</div>
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <CardContent className="pb-2 px-0 mb-4 sm:mb-6 shrink-0">
        <div className="flex flex-col md:flex-row gap-4">
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
            <SelectTrigger className="w-full md:w-50">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              {statusList.map((s) => (
                <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filtroTipo} onValueChange={setFiltroTipo}>
            <SelectTrigger className="w-full md:w-50">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Todos los tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los tipos</SelectItem>
              {typesList.map((t) => (
                <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {user?.rol === "Administrador" && (
            <Select value={filtroArea} onValueChange={setFiltroArea}>
              <SelectTrigger className="w-full md:w-50">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Todas las áreas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las áreas</SelectItem>
                {areasApelacion.map((a) => (
                  <SelectItem key={a.id} value={a.name}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full md:w-50 justify-start text-left font-normal pl-10 text-sm min-w-0 truncate",
                  !dateFrom && !dateTo && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                <span className="truncate">
                  {dateFrom && dateTo
                    ? `${formatDateLabel(dateFrom)} — ${formatDateLabel(dateTo)}`
                    : dateFrom
                      ? `Desde ${formatDateLabel(dateFrom)}`
                      : "Rango de fechas (desde — hasta)"}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                defaultMonth={dateFrom ? new Date(dateFrom + "T12:00:00") : undefined}
                selected={
                  dateFrom
                    ? { from: new Date(dateFrom + "T12:00:00"), to: dateTo ? new Date(dateTo + "T12:00:00") : undefined }
                    : undefined
                }
                onSelect={(range: DateRange | undefined) => {
                  setDateFrom(range?.from ? range.from.toISOString().split("T")[0] : "")
                  setDateTo(range?.to ? range.to.toISOString().split("T")[0] : "")
                }}
                numberOfMonths={1}
              />
            </PopoverContent>
          </Popover>
          <Select value={sortFilter} onValueChange={(v) => setSortFilter(v as "recent" | "oldest" | "ticket")}>
            <SelectTrigger className="w-full md:w-55 [&_[data-slot=select-value]]:flex-1 [&_[data-slot=select-value]]:justify-center">
              <Filter className="h-4 w-4 mr-2 shrink-0" />
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Reciente</SelectItem>
              <SelectItem value="oldest">Antigua</SelectItem>
              <SelectItem value="ticket">Ticket</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-hidden mb-2">
        <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-2 auto-rows-fr min-h-full gap-3 md:gap-4 min-[1600px]:gap-5">
          {isLoading && (
            <Card className="col-span-full border-dashed p-4 sm:p-5">
              <div className="text-sm text-muted-foreground">Cargando apelaciones...</div>
            </Card>
          )}
          {!isLoading && paginatedItems.length === 0 && (
            <Card className="col-span-full border-dashed p-4 sm:p-5">
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
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [filtroTipo, setFiltroTipo] = useState("todos")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [sortFilter, setSortFilter] = useState<"recent" | "oldest" | "ticket">("recent")
  const [statusList, setStatusList] = useState<{ id: number; name: string }[]>([])
  const [typesList, setTypesList] = useState<{ id: number; name: string }[]>([])
  const itemsPerPage = ITEMS_PER_PAGE

  useEffect(() => {
    let active = true
    catalogService.getPQRSStatus().then((list) => {
      if (!active) return
      setStatusList(list.map((s) => ({ id: s.id, name: s.name })))
    }).catch(() => { if (active) setStatusList([]) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    catalogService.getTypePQRSF().then((list) => {
      if (!active) return
      setTypesList(list.map((t) => ({ id: t.id, name: t.name })))
    }).catch(() => { if (active) setTypesList([]) })
    return () => { active = false }
  }, [])

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
    const filtered = formattedItems.filter((item) => {
      const matchesEstado = filtroEstado === "todos" || item.statusName === filtroEstado
      const matchesTipo = filtroTipo === "todos" || item.typeName === filtroTipo
      const matchesQuery =
        item.ticketNumber.toLowerCase().includes(query) ||
        (item.clientName ?? "").toLowerCase().includes(query) ||
        (item.description ?? "").toLowerCase().includes(query)
      const itemDate = formatDate(item.createdAt)
      const matchesDate =
        (!dateFrom && !dateTo) ||
        (itemDate !== "" && (!dateFrom || itemDate >= dateFrom) && (!dateTo || itemDate <= dateTo))
      return matchesEstado && matchesTipo && matchesQuery && matchesDate
    })
    if (sortFilter === "oldest") {
      return [...filtered].sort((a, b) => (a.createdAt || "").localeCompare(b.createdAt || ""))
    }
    if (sortFilter === "ticket") {
      return [...filtered].sort((a, b) => a.ticketNumber.localeCompare(b.ticketNumber))
    }
    return [...filtered].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
  }, [formattedItems, searchTerm, filtroEstado, filtroTipo, dateFrom, dateTo, sortFilter])

  const { currentPage, totalPages, paginatedItems, setCurrentPage } = usePagination({
    items: filteredPending,
    itemsPerPage,
    dependencies: [searchTerm, filtroEstado, filtroTipo, dateFrom, dateTo, sortFilter],
  })

  if (!user || user.rol !== "Usuario de Área Responsable") {
    return <div className="text-sm text-muted-foreground">No tienes permisos para ver esta sección.</div>
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <CardContent className="pb-2 px-0 mb-4 sm:mb-6 shrink-0">
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
          <Select value={filtroEstado} onValueChange={setFiltroEstado}>
            <SelectTrigger className="w-full md:w-50">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              {statusList.map((s) => (
                <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filtroTipo} onValueChange={setFiltroTipo}>
            <SelectTrigger className="w-full md:w-50">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Todos los tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los tipos</SelectItem>
              {typesList.map((t) => (
                <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full md:w-50 justify-start text-left font-normal pl-10 text-sm min-w-0 truncate",
                  !dateFrom && !dateTo && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                <span className="truncate">
                  {dateFrom && dateTo
                    ? `${formatDateLabel(dateFrom)} — ${formatDateLabel(dateTo)}`
                    : dateFrom
                      ? `Desde ${formatDateLabel(dateFrom)}`
                      : "Rango de fechas (desde — hasta)"}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                defaultMonth={dateFrom ? new Date(dateFrom + "T12:00:00") : undefined}
                selected={
                  dateFrom
                    ? {
                        from: new Date(dateFrom + "T12:00:00"),
                        to: dateTo ? new Date(dateTo + "T12:00:00") : undefined,
                      }
                    : undefined
                }
                onSelect={(range: DateRange | undefined) => {
                  setDateFrom(range?.from ? range.from.toISOString().split("T")[0] : "")
                  setDateTo(range?.to ? range.to.toISOString().split("T")[0] : "")
                }}
                numberOfMonths={1}
              />
            </PopoverContent>
          </Popover>
          <Select value={sortFilter} onValueChange={(v) => setSortFilter(v as "recent" | "oldest" | "ticket")}>
            <SelectTrigger className="w-full md:w-55 [&_[data-slot=select-value]]:flex-1 [&_[data-slot=select-value]]:justify-center">
              <Filter className="h-4 w-4 mr-2 shrink-0" />
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Reciente</SelectItem>
              <SelectItem value="oldest">Antigua</SelectItem>
              <SelectItem value="ticket">Ticket</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-hidden mb-2">
        <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-2 auto-rows-fr min-h-full gap-3 md:gap-4 min-[1600px]:gap-5">
          {isLoadingData && (
            <Card className="col-span-full border-dashed p-4 sm:p-5">
              <div className="text-sm text-muted-foreground">Cargando pendientes...</div>
            </Card>
          )}
          {!isLoadingData && paginatedItems.length === 0 && (
            <Card className="col-span-full border-dashed p-4 sm:p-5">
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
