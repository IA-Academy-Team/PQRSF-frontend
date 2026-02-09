import { useState, useEffect, useMemo } from "react"
import { CheckCircle, Search, ArrowUpRight, Filter } from "lucide-react"
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
import { pqrsfService, type CerradaItem } from "@/services/pqrsf.service"
import { areaService } from "@/services/area.service"
import { ITEMS_PER_PAGE } from "@/lib/pqrsf-utils"

export default function Cerradas() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { isCollapsed } = useSidebar()
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroTipo, setFiltroTipo] = useState("todos")
  const [filtroArea, setFiltroArea] = useState("todas")
  const [areasList, setAreasList] = useState<{ id: number; name: string }[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = ITEMS_PER_PAGE
  const [items, setItems] = useState<CerradaItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  if (!user || user.rol !== "Administrador") {
    navigate("/dashboard")
    return null
  }

  useEffect(() => {
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
  }, [])

  useEffect(() => {
    let active = true
    areaService.getAll().then((list) => {
      if (!active) return
      setAreasList(list.map((a) => ({ id: a.id, name: a.name })))
    }).catch(() => { if (active) setAreasList([]) })
    return () => { active = false }
  }, [])

  const computeAvgScore = (item: CerradaItem) => {
    const scores = [
      item.q1Clarity,
      item.q2Timeliness,
      item.q3Quality,
      item.q4Attention,
      item.q5Overall,
    ].filter((value) => typeof value === "number") as number[]
    if (scores.length === 0) return null
    const total = scores.reduce((sum, value) => sum + value, 0)
    return total / scores.length
  }

  const formattedItems = useMemo(() => {
    return items.map((item) => {
      const createdAt = item.createdAt ? new Date(item.createdAt) : null
      const closedAt = item.updatedAt ? new Date(item.updatedAt) : null
      const avgScore = computeAvgScore(item)
      let satisfaccion = "Sin respuesta"
      if (avgScore !== null) {
        if (avgScore >= 4) satisfaccion = "Muy Satisfecho"
        else if (avgScore >= 3) satisfaccion = "Satisfecho"
        else satisfaccion = "Insatisfecho"
      } else if (item.surveyComment) {
        satisfaccion = "Satisfecho"
      }

      const responseDays =
        createdAt && closedAt ? Math.max(0, Math.round((closedAt.getTime() - createdAt.getTime()) / 86400000)) : null

      return {
        id: item.id,
        radicado: item.ticketNumber,
        tipo: item.typeName,
        solicitante: item.clientName || "Anónimo",
        area: item.areaName,
        fechaRadicacion: createdAt ? createdAt.toLocaleDateString("es-CO") : "Sin fecha",
        fechaCierre: closedAt ? closedAt.toLocaleDateString("es-CO") : "Sin fecha",
        tiempoRespuesta: responseDays !== null ? `${responseDays} días` : "Sin dato",
        resultado: item.responseContent ? "Resuelta" : "Cerrada",
        satisfaccionCliente: satisfaccion,
      }
    })
  }, [items])

  const filteredPQRSF = formattedItems.filter((p) => {
    const matchSearch =
      p.radicado.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.solicitante.toLowerCase().includes(searchTerm.toLowerCase())
    const matchTipo = filtroTipo === "todos" || p.tipo === filtroTipo
    const matchArea = filtroArea === "todas" || p.area === filtroArea
    return matchSearch && matchTipo && matchArea
  })

  const totalPages = Math.ceil(filteredPQRSF.length / itemsPerPage) || 1

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filtroTipo, filtroArea])

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
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />

      <main
        className={cn(
          "flex-1 flex flex-col min-h-0 p-4 sm:p-6 lg:p-8 min-[1600px]:p-10 pt-14 md:pt-4 transition-all duration-300",
          "max-md:min-h-screen max-md:overflow-y-auto max-md:h-auto md:overflow-hidden",
          isCollapsed ? "lg:ml-24" : "lg:ml-64",
        )}
      >
        <div className="shrink-0 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl min-[1600px]:text-4xl font-bold text-foreground mb-1 sm:mb-2 min-[1600px]:mb-3">PQRSF Cerradas</h1>
            </div>
          </div>
        </div>

        <CardContent className="pb-4 sm:pb-6 px-0 mb-4 sm:mb-6 shrink-0">
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
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Estado (tipo)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="Petición">Petición</SelectItem>
                <SelectItem value="Queja">Queja</SelectItem>
                <SelectItem value="Reclamo">Reclamo</SelectItem>
                <SelectItem value="Sugerencia">Sugerencia</SelectItem>
                <SelectItem value="Felicitación">Felicitación</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroArea} onValueChange={setFiltroArea}>
              <SelectTrigger className="w-full sm:w-50">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Área" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las áreas</SelectItem>
                {areasList.map((a) => (
                  <SelectItem key={a.id} value={a.name}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>

        {error && (
          <div className="shrink-0 mb-4 rounded-lg border border-red-200 bg-red-50 p-4 min-[1600px]:p-5 text-sm min-[1600px]:text-base text-red-700">
            {error}
          </div>
        )}

        <div className="flex-1 min-h-0 overflow-hidden mb-2">
          <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-2 auto-rows-fr min-h-full gap-3 md:gap-4 min-[1600px]:gap-5">
            {isLoading && (
              <Card className="col-span-full border-dashed min-h-0 overflow-hidden">
                <CardContent className="p-4 text-sm text-muted-foreground">Cargando cerradas...</CardContent>
              </Card>
            )}
            {!isLoading && paginatedItems.length === 0 && (
              <Card className="col-span-full border-dashed min-h-0 overflow-hidden">
                <CardContent className="p-4 text-sm text-muted-foreground">No hay PQRSF cerradas.</CardContent>
              </Card>
            )}
            {paginatedItems.map((pqrsf, index) => (
              <Card key={`${pqrsf.radicado}-${startIndex + index}`} className="h-full flex flex-col min-h-0 overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-3 sm:p-4 flex-1 min-h-0 overflow-hidden flex flex-col">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4 sm:gap-6 min-h-0 overflow-hidden">
                    <div className="flex-1 min-w-0 min-h-0 overflow-hidden">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 flex-nowrap min-w-0 overflow-hidden">
                        <span className="font-mono text-xs sm:text-sm font-semibold text-primary truncate min-w-0 flex-1">{pqrsf.radicado}</span>
                        <span className="shrink-0 text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700 whitespace-nowrap">
                          {pqrsf.tipo}
                        </span>
                        <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />
                      </div>

                      <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-4 truncate">
                        Solicitante: <span className="font-medium text-foreground">{pqrsf.solicitante}</span> • Área:{" "}
                        <span className="font-medium text-foreground">{pqrsf.area}</span>
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-2 sm:mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">FECHA RADICACIÓN</p>
                          <p className="text-sm font-medium">{pqrsf.fechaRadicacion}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">FECHA CIERRE</p>
                          <p className="text-sm font-medium">{pqrsf.fechaCierre}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">TIEMPO RESPUESTA</p>
                          <p className="text-sm font-medium text-blue-600">{pqrsf.tiempoRespuesta}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">RESULTADO</p>
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full ${
                              pqrsf.resultado === "Rechazada" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                            }`}
                          >
                            {pqrsf.resultado}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`p-3 rounded-lg ${
                          ["Satisfecho", "Muy Satisfecho"].includes(pqrsf.satisfaccionCliente)
                            ? "bg-green-50"
                            : "bg-red-50"
                        }`}
                      >
                        <p
                          className={`text-xs font-semibold mb-1 ${
                            ["Satisfecho", "Muy Satisfecho"].includes(pqrsf.satisfaccionCliente)
                              ? "text-green-700"
                              : "text-red-700"
                          }`}
                        >
                          SATISFACCIÓN DEL CLIENTE:
                        </p>
                        <p className="text-sm font-medium">{pqrsf.satisfaccionCliente}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 lg:min-w-45">
                      <Link to={`/pqrsf/${pqrsf.radicado}`} className="w-full">
                        <Button variant="outline" className="w-full bg-transparent">
                          Ver Historial Completo
                          <ArrowUpRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
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
