import { useState, useMemo, useEffect } from "react"
import { Search, Filter, Calendar, User, Building2, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sidebar } from "@/components/sidebar"
import { useSidebar } from "@/contexts/sidebar-context"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import { pqrsfService, type PQRSFListItem, type PQRSFListQuery } from "@/services/pqrsf.service"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

export default function PQRSFList() {
  const { isCollapsed } = useSidebar()
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9
  const [items, setItems] = useState<PQRSFListItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [dateFilter, setDateFilter] = useState("")
  const [sortFilter, setSortFilter] = useState("recent")

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, dateFilter, sortFilter])

  useEffect(() => {
    let active = true
    const timeout = setTimeout(async () => {
      setIsLoading(true)
      setError("")
      try {
        const query: PQRSFListQuery = {
          q: searchTerm.trim() || undefined,
          sort: sortFilter as PQRSFListQuery["sort"],
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
  }, [searchTerm, statusFilter, dateFilter, sortFilter])

  const formattedItems = useMemo(
    () =>
      items.map((item) => ({
        id: item.ticketNumber,
        user: item.clientName || "Anónimo",
        type: item.typeName,
        area: item.areaName,
        date: item.createdAt ? new Date(item.createdAt).toLocaleDateString("es-CO") : "Sin fecha",
        status: item.statusName,
        description: item.description || "Sin descripcion",
      })),
    [items],
  )

  const totalPages = Math.ceil(formattedItems.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedItems = formattedItems.slice(startIndex, endIndex)

  const statusStyles: Record<string, string> = {
    radicado: "bg-amber-50 text-amber-700 border-amber-200",
    analisis: "bg-blue-50 text-blue-700 border-blue-200",
    "reanálisis": "bg-red-50 text-red-700 border-red-200",
    cerrado: "bg-emerald-50 text-emerald-700 border-emerald-200",
  }

  const getStatusKey = (status: string): string => {
    return status.toLowerCase()
  }

  const getStatusStyle = (status: string): string => {
    const key = getStatusKey(status)
    return statusStyles[key] || "bg-gray-50 text-gray-700 border-gray-200"
  }

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

  const visiblePages = getVisiblePages(currentPage, totalPages)

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

        <CardContent className="pb-6 px-0 mb-6 shrink-0">
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
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="1">Radicado</SelectItem>
                <SelectItem value="2">Analisis</SelectItem>
                <SelectItem value="3">Reanálisis</SelectItem>
                <SelectItem value="4">Cerrado</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative w-full md:w-[200px]">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                className="pl-10"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>

            <Select value={sortFilter} onValueChange={setSortFilter}>
              <SelectTrigger className="w-full md:w-[220px]">
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
              <Card key={item.id} className="p-5 hover:shadow-md transition-shadow h-full flex flex-col">
                <div className="flex items-start justify-between gap-4 flex-1 min-h-0">
                  <div className="flex-1 min-w-0 space-y-3 flex flex-col">
                    <div className="flex items-center gap-2 flex-wrap shrink-0">
                      <span className="text-xs font-mono text-muted-foreground">{item.id}</span>
                      <Badge variant="outline" className="text-xs font-medium">
                        {item.type}
                      </Badge>
                      <Badge variant="outline" className={`text-xs font-medium capitalize ${getStatusStyle(item.status)}`}>
                        {item.status}
                      </Badge>
                    </div>

                    <h3 className="font-medium text-foreground leading-snug line-clamp-2 flex-1 min-h-10">{item.description}</h3>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground shrink-0 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{item.user}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{item.area}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        <span>{item.date}</span>
                      </div>
                    </div>
                  </div>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link to={`/pqrsf/${item.id}`}>
                        <Button variant="ghost" size="sm" className="shrink-0">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      Ver Detalle
                    </TooltipContent>
                  </Tooltip>
                </div>
              </Card>
            ))}
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
