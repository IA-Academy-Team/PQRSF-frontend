import { useState, useEffect } from "react"
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

export default function Seguimiento() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { isCollapsed } = useSidebar()
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("todas")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 4

  if (!user || user.rol !== "Administrador") {
    navigate("/dashboard")
    return null
  }

  const pqrsfsRespondidas = [
    {
      radicado: "PQRSF-2023-045",
      tipo: "Petición",
      solicitante: "Carlos Méndez",
      area: "Área Responsable (Operativa)",
      respuestaEnviada: "Se aprobó el cambio de horario solicitado",
      fechaRespuesta: "Dic 18, 2023",
      respuestaCliente: "Satisfecho - Gracias por la respuesta",
      estadoCliente: "satisfecho",
    },
    {
      radicado: "PQRSF-2023-051",
      tipo: "Queja",
      solicitante: "Ana López",
      area: "Área Responsable (Operativa)",
      respuestaEnviada: "Se realizó mantenimiento a los equipos",
      fechaRespuesta: "Dic 19, 2023",
      respuestaCliente: "Insatisfecho - Los equipos siguen fallando",
      estadoCliente: "insatisfecho",
    },
    {
      radicado: "PQRSF-2023-062",
      tipo: "Sugerencia",
      solicitante: "Luis Rodríguez",
      area: "Servicio al Cliente",
      respuestaEnviada: "Se implementarán las mejoras sugeridas en el próximo periodo",
      fechaRespuesta: "Dic 20, 2023",
      respuestaCliente: null,
      estadoCliente: "sin_respuesta",
    },
    {
      radicado: "PQRSF-2023-045",
      tipo: "Petición",
      solicitante: "Carlos Méndez",
      area: "Área Responsable (Operativa)",
      respuestaEnviada: "Se aprobó el cambio de horario solicitado",
      fechaRespuesta: "Dic 18, 2023",
      respuestaCliente: "Satisfecho - Gracias por la respuesta",
      estadoCliente: "satisfecho",
    },
    {
      radicado: "PQRSF-2023-051",
      tipo: "Queja",
      solicitante: "Ana López",
      area: "Área Responsable (Operativa)",
      respuestaEnviada: "Se realizó mantenimiento a los equipos",
      fechaRespuesta: "Dic 19, 2023",
      respuestaCliente: "Insatisfecho - Los equipos siguen fallando",
      estadoCliente: "insatisfecho",
    },
    {
      radicado: "PQRSF-2023-062",
      tipo: "Sugerencia",
      solicitante: "Luis Rodríguez",
      area: "Servicio al Cliente",
      respuestaEnviada: "Se implementarán las mejoras sugeridas en el próximo periodo",
      fechaRespuesta: "Dic 20, 2023",
      respuestaCliente: null,
      estadoCliente: "sin_respuesta",
    },
    {
      radicado: "PQRSF-2023-045",
      tipo: "Petición",
      solicitante: "Carlos Méndez",
      area: "Área Responsable (Operativa)",
      respuestaEnviada: "Se aprobó el cambio de horario solicitado",
      fechaRespuesta: "Dic 18, 2023",
      respuestaCliente: "Satisfecho - Gracias por la respuesta",
      estadoCliente: "satisfecho",
    },
    {
      radicado: "PQRSF-2023-051",
      tipo: "Queja",
      solicitante: "Ana López",
      area: "Área Responsable (Operativa)",
      respuestaEnviada: "Se realizó mantenimiento a los equipos",
      fechaRespuesta: "Dic 19, 2023",
      respuestaCliente: "Insatisfecho - Los equipos siguen fallando",
      estadoCliente: "insatisfecho",
    },
    {
      radicado: "PQRSF-2023-062",
      tipo: "Sugerencia",
      solicitante: "Luis Rodríguez",
      area: "Servicio al Cliente",
      respuestaEnviada: "Se implementarán las mejoras sugeridas en el próximo periodo",
      fechaRespuesta: "Dic 20, 2023",
      respuestaCliente: null,
      estadoCliente: "sin_respuesta",
    },
    {
      radicado: "PQRSF-2023-045",
      tipo: "Petición",
      solicitante: "Carlos Méndez",
      area: "Área Responsable (Operativa)",
      respuestaEnviada: "Se aprobó el cambio de horario solicitado",
      fechaRespuesta: "Dic 18, 2023",
      respuestaCliente: "Satisfecho - Gracias por la respuesta",
      estadoCliente: "satisfecho",
    },
    {
      radicado: "PQRSF-2023-051",
      tipo: "Queja",
      solicitante: "Ana López",
      area: "Área Responsable (Operativa)",
      respuestaEnviada: "Se realizó mantenimiento a los equipos",
      fechaRespuesta: "Dic 19, 2023",
      respuestaCliente: "Insatisfecho - Los equipos siguen fallando",
      estadoCliente: "insatisfecho",
    },
    {
      radicado: "PQRSF-2023-062",
      tipo: "Sugerencia",
      solicitante: "Luis Rodríguez",
      area: "Servicio al Cliente",
      respuestaEnviada: "Se implementarán las mejoras sugeridas en el próximo periodo",
      fechaRespuesta: "Dic 20, 2023",
      respuestaCliente: null,
      estadoCliente: "sin_respuesta",
    },
    {
      radicado: "PQRSF-2023-045",
      tipo: "Petición",
      solicitante: "Carlos Méndez",
      area: "Área Responsable (Operativa)",
      respuestaEnviada: "Se aprobó el cambio de horario solicitado",
      fechaRespuesta: "Dic 18, 2023",
      respuestaCliente: "Satisfecho - Gracias por la respuesta",
      estadoCliente: "satisfecho",
    },
    {
      radicado: "PQRSF-2023-051",
      tipo: "Queja",
      solicitante: "Ana López",
      area: "Área Responsable (Operativa)",
      respuestaEnviada: "Se realizó mantenimiento a los equipos",
      fechaRespuesta: "Dic 19, 2023",
      respuestaCliente: "Insatisfecho - Los equipos siguen fallando",
      estadoCliente: "insatisfecho",
    },
    {
      radicado: "PQRSF-2023-062",
      tipo: "Sugerencia",
      solicitante: "Luis Rodríguez",
      area: "Servicio al Cliente",
      respuestaEnviada: "Se implementarán las mejoras sugeridas en el próximo periodo",
      fechaRespuesta: "Dic 20, 2023",
      respuestaCliente: null,
      estadoCliente: "sin_respuesta",
    },
    {
      radicado: "PQRSF-2023-045",
      tipo: "Petición",
      solicitante: "Carlos Méndez",
      area: "Área Responsable (Operativa)",
      respuestaEnviada: "Se aprobó el cambio de horario solicitado",
      fechaRespuesta: "Dic 18, 2023",
      respuestaCliente: "Satisfecho - Gracias por la respuesta",
      estadoCliente: "satisfecho",
    },
    {
      radicado: "PQRSF-2023-051",
      tipo: "Queja",
      solicitante: "Ana López",
      area: "Área Responsable (Operativa)",
      respuestaEnviada: "Se realizó mantenimiento a los equipos",
      fechaRespuesta: "Dic 19, 2023",
      respuestaCliente: "Insatisfecho - Los equipos siguen fallando",
      estadoCliente: "insatisfecho",
    },
    {
      radicado: "PQRSF-2023-062",
      tipo: "Sugerencia",
      solicitante: "Luis Rodríguez",
      area: "Servicio al Cliente",
      respuestaEnviada: "Se implementarán las mejoras sugeridas en el próximo periodo",
      fechaRespuesta: "Dic 20, 2023",
      respuestaCliente: null,
      estadoCliente: "sin_respuesta",
    },
    {
      radicado: "PQRSF-2023-045",
      tipo: "Petición",
      solicitante: "Carlos Méndez",
      area: "Área Responsable (Operativa)",
      respuestaEnviada: "Se aprobó el cambio de horario solicitado",
      fechaRespuesta: "Dic 18, 2023",
      respuestaCliente: "Satisfecho - Gracias por la respuesta",
      estadoCliente: "satisfecho",
    },
    {
      radicado: "PQRSF-2023-051",
      tipo: "Queja",
      solicitante: "Ana López",
      area: "Área Responsable (Operativa)",
      respuestaEnviada: "Se realizó mantenimiento a los equipos",
      fechaRespuesta: "Dic 19, 2023",
      respuestaCliente: "Insatisfecho - Los equipos siguen fallando",
      estadoCliente: "insatisfecho",
    },
    {
      radicado: "PQRSF-2023-062",
      tipo: "Sugerencia",
      solicitante: "Luis Rodríguez",
      area: "Servicio al Cliente",
      respuestaEnviada: "Se implementarán las mejoras sugeridas en el próximo periodo",
      fechaRespuesta: "Dic 20, 2023",
      respuestaCliente: null,
      estadoCliente: "sin_respuesta",
    },
    {
      radicado: "PQRSF-2023-045",
      tipo: "Petición",
      solicitante: "Carlos Méndez",
      area: "Área Responsable (Operativa)",
      respuestaEnviada: "Se aprobó el cambio de horario solicitado",
      fechaRespuesta: "Dic 18, 2023",
      respuestaCliente: "Satisfecho - Gracias por la respuesta",
      estadoCliente: "satisfecho",
    },
    {
      radicado: "PQRSF-2023-051",
      tipo: "Queja",
      solicitante: "Ana López",
      area: "Área Responsable (Operativa)",
      respuestaEnviada: "Se realizó mantenimiento a los equipos",
      fechaRespuesta: "Dic 19, 2023",
      respuestaCliente: "Insatisfecho - Los equipos siguen fallando",
      estadoCliente: "insatisfecho",
    },
    {
      radicado: "PQRSF-2023-062",
      tipo: "Sugerencia",
      solicitante: "Luis Rodríguez",
      area: "Servicio al Cliente",
      respuestaEnviada: "Se implementarán las mejoras sugeridas en el próximo periodo",
      fechaRespuesta: "Dic 20, 2023",
      respuestaCliente: null,
      estadoCliente: "sin_respuesta",
    },
    
  ]

  const filteredPQRSF = pqrsfsRespondidas.filter((p) => {
    const matchSearch =
      p.radicado.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.solicitante.toLowerCase().includes(searchTerm.toLowerCase())
    const matchEstado = filtroEstado === "todas" || p.estadoCliente === filtroEstado
    return matchSearch && matchEstado
  })

  // Resetear a la página 1 cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filtroEstado])

  const getVisiblePages = (currentPage: number, totalPages: number, windowSize: number = 5): number[] => {
    if (totalPages <= windowSize) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    // Calcular rango inicial: mantener currentPage centrado
    let start = currentPage - Math.floor(windowSize / 2)
    let end = start + windowSize - 1

    // Ajustar si start < 1
    if (start < 1) {
      start = 1
      end = windowSize
    }

    // Ajustar si end > totalPages
    if (end > totalPages) {
      end = totalPages
      start = totalPages - windowSize + 1
    }

    return Array.from({ length: windowSize }, (_, i) => start + i)
  }

  const totalPages = Math.ceil(filteredPQRSF.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedItems = filteredPQRSF.slice(startIndex, endIndex)
  const visiblePages = getVisiblePages(currentPage, totalPages)

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main
        className={cn(
          "flex-1 p-4 sm:p-6 lg:p-8 h-screen transition-all duration-300 flex flex-col",
          isCollapsed ? "lg:ml-24" : "lg:ml-64"
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
              <SelectTrigger className="w-full sm:w-[200px]">
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

        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="grid grid-cols-2 grid-rows-2 gap-4">
            {paginatedItems.map((pqrsf) => (
            <Card key={pqrsf.radicado} className="hover:shadow-md transition-shadow">
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

                  <div className="flex flex-col gap-2 lg:min-w-[180px]">
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Finalizar PQRSF
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
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
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage > 1) setCurrentPage(currentPage - 1)
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
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
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </main>
    </div>
  )
}
