import { useState, useEffect, useMemo } from "react"
import { AlertCircle, Search, ArrowUpRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sidebar } from "@/components/sidebar"
import { useAuth } from "@/contexts/auth-context"
import { useSidebar } from "@/contexts/sidebar-context"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Link } from "react-router-dom"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { pqrsfService, type ApelacionItem } from "@/services/pqrsf.service"

export default function EnApelacion() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { isCollapsed } = useSidebar()
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroArea, setFiltroArea] = useState("todas")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 4
  const [items, setItems] = useState<ApelacionItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  if (!user || user.rol !== "Administrador") {
    navigate("/dashboard")
    return null
  }

  useEffect(() => {
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
  }, [])

  const formattedItems = useMemo(() => {
    return items.map((item) => {
      const createdAt = item.createdAt ? new Date(item.createdAt) : null
      const daysOpen = createdAt ? Math.floor((Date.now() - createdAt.getTime()) / 86400000) : 0
      let prioridad: "alta" | "media" | "baja" = "baja"
      if (daysOpen >= 10) prioridad = "alta"
      else if (daysOpen >= 5) prioridad = "media"

      return {
        id: item.id,
        radicado: item.ticketNumber,
        tipo: item.typeName,
        solicitante: item.clientName || "Anónimo",
        area: item.areaName,
        motivoApelacion: item.surveyComment || "Sin motivo registrado",
        fechaApelacion: createdAt ? createdAt.toLocaleDateString("es-CO") : "Sin fecha",
        respuestaOriginal: item.responseContent || "Sin respuesta registrada",
        prioridad,
      }
    })
  }, [items])

  const filteredPQRSF = formattedItems.filter((p) => {
    const matchSearch =
      p.radicado.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.solicitante.toLowerCase().includes(searchTerm.toLowerCase())
    const matchArea = filtroArea === "todas" || p.area === filtroArea
    return matchSearch && matchArea
  })

  const totalPages = Math.ceil(filteredPQRSF.length / itemsPerPage) || 1

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filtroArea])

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages)
    }
  }, [totalPages])

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
  const paginatedItems = filteredPQRSF.slice(startIndex, endIndex)
  const visiblePages = getVisiblePages(safeCurrentPage, totalPages)

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main
        className={cn(
          "flex-1 p-4 sm:p-6 lg:p-8 h-screen transition-all duration-300 flex flex-col",
          isCollapsed ? "lg:ml-24" : "lg:ml-64",
        )}
      >
        <div className="mb-6 sm:mb-8 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">PQRSF En Apelación</h1>
            </div>
          </div>
        </div>

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

        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="grid grid-cols-2 grid-rows-2 gap-4">
            {isLoading && (
              <Card className="col-span-2 border-dashed">
                <CardContent className="p-4 text-sm text-muted-foreground">Cargando apelaciones...</CardContent>
              </Card>
            )}
            {!isLoading && paginatedItems.length === 0 && (
              <Card className="col-span-2 border-dashed">
                <CardContent className="p-4 text-sm text-muted-foreground">No hay PQRSF en apelación.</CardContent>
              </Card>
            )}
            {paginatedItems.map((pqrsf, index) => (
              <Card key={`${pqrsf.radicado}-${startIndex + index}`} className="hover:shadow-md transition-shadow">
                <CardContent className="p-3">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="font-mono text-sm font-semibold text-primary">{pqrsf.radicado}</span>
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                          {pqrsf.tipo}
                        </span>
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${
                            pqrsf.prioridad === "alta"
                              ? "bg-red-100 text-red-700"
                              : pqrsf.prioridad === "media"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                          }`}
                        >
                          {pqrsf.prioridad === "alta" ? "Alta" : pqrsf.prioridad === "media" ? "Media" : "Baja"}
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4">
                        Solicitante: <span className="font-medium text-foreground">{pqrsf.solicitante}</span> • Área
                        asignada: <span className="font-medium text-foreground">{pqrsf.area}</span>
                      </p>

                      <div className="bg-blue-50 p-4 rounded-lg mb-3">
                        <p className="text-xs font-semibold text-blue-700 mb-1">RESPUESTA ORIGINAL:</p>
                        <p className="text-sm">{pqrsf.respuestaOriginal}</p>
                      </div>

                      <div className="bg-red-50 p-4 rounded-lg">
                        <p className="text-xs font-semibold text-red-700 mb-1">MOTIVO DE APELACIÓN:</p>
                        <p className="text-sm">{pqrsf.motivoApelacion}</p>
                        <p className="text-xs text-muted-foreground mt-2">Fecha de apelación: {pqrsf.fechaApelacion}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 lg:min-w-45">
                      <Link to={`/pqrsf/${pqrsf.radicado}`} className="w-full">
                        <Button variant="outline" className="w-full bg-transparent">
                          Ver Detalle Completo
                          <ArrowUpRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                      <p className="text-xs text-center text-muted-foreground mt-2">
                        El área responsable debe responder nuevamente
                      </p>
                    </div>
                  </div>
                </CardContent>
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
