import { Search, Filter, Calendar, ClipboardList } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sidebar } from "@/components/sidebar"
import { useSidebar } from "@/contexts/sidebar-context"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/auth-context"
import { useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { areaService } from "@/services/area.service"
import { dashboardService, type AreaPendingItem } from "@/services/dashboard.service"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { PQRSFCard, type UnifiedPQRSFItem } from "@/components/PQRSFCard"
import { ITEMS_PER_PAGE } from "@/lib/pqrsf-utils"

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
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = ITEMS_PER_PAGE

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
    const filtered = pending.filter((item) => {
      const priority = getPriority(item.dueDate, item.createdAt)
      const matchesPriority = priorityFilter === "todos" || priority.toLowerCase() === priorityFilter
      const matchesQuery =
        item.ticketNumber.toLowerCase().includes(query) ||
        (item.clientName ?? "").toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      const matchesDate = dateFilter ? formatDate(item.createdAt) === dateFilter : true
      return matchesPriority && matchesQuery && matchesDate
    })

    if (priorityFilter === "todos") {
      const rank = (value?: string | null) => {
        if (value === "Alta") return 0
        if (value === "Media") return 1
        if (value === "Baja") return 2
        return 3
      }
      return [...filtered].sort((a, b) => {
        const pa = getPriority(a.dueDate, a.createdAt)
        const pb = getPriority(b.dueDate, b.createdAt)
        const diff = rank(pa) - rank(pb)
        if (diff !== 0) return diff
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return db - da
      })
    }

    return filtered
  }, [pending, searchTerm, priorityFilter, dateFilter])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, priorityFilter, dateFilter])

  const totalPages = Math.ceil(filteredPending.length / itemsPerPage) || 1
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages)
    }
  }, [totalPages, currentPage])

  const getVisiblePages = (currentPage: number, totalPages: number, windowSize: number = 5): number[] => {
    if (totalPages <= windowSize) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    let start = currentPage - Math.floor(windowSize / 2)
    let end = start + windowSize - 1
    if (start < 1) {
      start = 1
      end = windowSize
    }
    if (end > totalPages) {
      end = totalPages
      start = totalPages - windowSize + 1
    }
    return Array.from({ length: windowSize }, (_, i) => start + i)
  }

  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages)
  const startIndex = (safeCurrentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedItems = filteredPending.slice(startIndex, endIndex)
  const visiblePages = getVisiblePages(safeCurrentPage, totalPages)


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
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-1 sm:mb-2">PQRSF Pendientes de Respuesta</h1>
          <p className="text-sm text-muted-foreground">
            PQRSF asignadas a {areaName || "tu área"} que requieren respuesta directa al cliente
          </p>
        </div>

        <CardContent className="pb-4 sm:pb-6 px-0 mb-4 sm:mb-6 shrink-0">
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
            {paginatedItems.map((item) => {
              const priority = getPriority(item.dueDate, item.createdAt)
              const diasTranscurridos = getDaysElapsed(item.createdAt)
              const unifiedItem: UnifiedPQRSFItem = {
                id: item.id,
                ticketNumber: item.ticketNumber,
                typeName: item.typeName,
                statusName: "Pendiente",
                description: item.description || null,
                clientName: item.clientName ?? null,
                areaName: item.areaName,
                createdAt: item.createdAt || null,
                priority: priority as "Alta" | "Media" | "Baja",
                responseSentAt: item.responseSentAt || null,
                updatedAt: item.updatedAt || null,
                daysElapsed: diasTranscurridos,
                responseTime: null,
                satisfaction: null,
                dueDate: item.dueDate || null,
              }
              return (
                <PQRSFCard
                  key={item.id}
                  item={unifiedItem}
                  actionLabel="Responder al Cliente"
                  showPriority={true}
                />
              )
            })}
          </div>
        </div>

        <div className="shrink-0 mt-auto">
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                {currentPage > 1 && (
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        setCurrentPage(currentPage - 1)
                      }}
                    />
                  </PaginationItem>
                )}
                {visiblePages.map((pageNum) => (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        setCurrentPage(pageNum)
                      }}
                      isActive={currentPage === pageNum}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                {currentPage < totalPages && (
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        setCurrentPage(currentPage + 1)
                      }}
                    />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </main>
    </div>
  )
}
