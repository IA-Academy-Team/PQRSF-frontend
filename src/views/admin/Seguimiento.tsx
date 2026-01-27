import { useState, useEffect, useMemo } from "react"
import { Clock, Search, CheckCircle, XCircle, AlertCircle, ArrowUpRight } from "lucide-react"
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
import { pqrsfService, type SeguimientoItem } from "@/services/pqrsf.service"

export default function Seguimiento() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { isCollapsed } = useSidebar()
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("todas")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 4
  const [items, setItems] = useState<SeguimientoItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [actionState, setActionState] = useState<{ id: number; type: "finalize" | "appeal" } | null>(null)

  if (!user || user.rol !== "Administrador") {
    navigate("/dashboard")
    return null
  }

  useEffect(() => {
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
  }, [])

  const computeAvgScore = (item: SeguimientoItem) => {
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
      const avgScore = computeAvgScore(item)
      const hasSurvey = avgScore !== null || Boolean(item.surveyComment)
      let estadoCliente: "satisfecho" | "insatisfecho" | "sin_respuesta" = "sin_respuesta"

      if (avgScore !== null) {
        if (avgScore >= 4) estadoCliente = "satisfecho"
        else if (avgScore <= 2) estadoCliente = "insatisfecho"
        else estadoCliente = "sin_respuesta"
      } else if (hasSurvey) {
        estadoCliente = "satisfecho"
      }

      return {
        id: item.id,
        radicado: item.ticketNumber,
        tipo: item.typeName,
        solicitante: item.clientName || "Anónimo",
        area: item.areaName,
        respuestaEnviada: item.responseContent || "Sin respuesta registrada",
        fechaRespuesta: item.responseSentAt
          ? new Date(item.responseSentAt).toLocaleDateString("es-CO")
          : "Sin fecha",
        respuestaCliente: item.surveyComment || (avgScore !== null ? `Calificación promedio: ${avgScore.toFixed(1)}/5` : null),
        estadoCliente,
      }
    })
  }, [items])

  const filteredPQRSF = formattedItems.filter((p) => {
    const matchSearch =
      p.radicado.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.solicitante.toLowerCase().includes(searchTerm.toLowerCase())
    const matchEstado = filtroEstado === "todas" || p.estadoCliente === filtroEstado
    return matchSearch && matchEstado
  })

  const totalPages = Math.ceil(filteredPQRSF.length / itemsPerPage) || 1

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filtroEstado])

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

  const handleFinalize = async (id: number) => {
    setActionState({ id, type: "finalize" })
    setError("")
    try {
      await pqrsfService.finalize(id)
      try {
        await pqrsfService.getBotResponse(id)
      } catch (err) {
        console.warn("[seguimiento] bot-response error", err)
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
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Seguimiento de PQRSF</h1>
            </div>
          </div>
        </div>

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

        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="grid grid-cols-2 grid-rows-2 gap-4">
            {isLoading && (
              <Card className="col-span-2 border-dashed">
                <CardContent className="p-4 text-sm text-muted-foreground">Cargando seguimiento...</CardContent>
              </Card>
            )}
            {!isLoading && paginatedItems.length === 0 && (
              <Card className="col-span-2 border-dashed">
                <CardContent className="p-4 text-sm text-muted-foreground">No hay PQRSF en seguimiento.</CardContent>
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
                        {pqrsf.estadoCliente === "satisfecho" && <CheckCircle className="h-4 w-4 text-green-600" />}
                        {pqrsf.estadoCliente === "insatisfecho" && <XCircle className="h-4 w-4 text-red-600" />}
                        {pqrsf.estadoCliente === "sin_respuesta" && <Clock className="h-4 w-4 text-orange-600" />}
                      </div>

                      <p className="text-sm text-muted-foreground mb-4">
                        Solicitante: <span className="font-medium text-foreground">{pqrsf.solicitante}</span> • Respondido
                        por: <span className="font-medium text-foreground">{pqrsf.area}</span>
                      </p>

                      <div className="bg-blue-50 p-4 rounded-lg mb-3">
                        <p className="text-xs font-semibold text-blue-700 mb-1">RESPUESTA ENVIADA:</p>
                        <p className="text-sm">{pqrsf.respuestaEnviada}</p>
                        <p className="text-xs text-muted-foreground mt-2">Fecha: {pqrsf.fechaRespuesta}</p>
                      </div>

                      {pqrsf.respuestaCliente ? (
                        <div
                          className={`p-4 rounded-lg ${
                            pqrsf.estadoCliente === "satisfecho" ? "bg-green-50" : "bg-red-50"
                          }`}
                        >
                          <p
                            className={`text-xs font-semibold mb-1 ${
                              pqrsf.estadoCliente === "satisfecho" ? "text-green-700" : "text-red-700"
                            }`}
                          >
                            RESPUESTA DEL CLIENTE:
                          </p>
                          <p className="text-sm">{pqrsf.respuestaCliente}</p>
                        </div>
                      ) : (
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <p className="text-xs font-semibold text-orange-700 mb-1">El cliente aún no ha respondido</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 lg:min-w-45">
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => handleFinalize(pqrsf.id)}
                        disabled={actionState?.id === pqrsf.id}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Finalizar PQRSF
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
                        onClick={() => handleAppeal(pqrsf.id)}
                        disabled={actionState?.id === pqrsf.id}
                      >
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Enviar a Apelación
                      </Button>
                      <Link to={`/pqrsf/${pqrsf.radicado}`} className="w-full">
                        <Button variant="ghost" className="w-full">
                          Ver Detalle
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
