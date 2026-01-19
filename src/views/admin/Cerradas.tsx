import { useState, useEffect } from "react"
import { CheckCircle, Search, Calendar, ArrowUpRight } from "lucide-react"
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

export default function Cerradas() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { isCollapsed } = useSidebar()
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroTipo, setFiltroTipo] = useState("todos")
  const [filtroMes, setFiltroMes] = useState("todos")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 4

  if (!user || user.rol !== "Administrador") {
    navigate("/dashboard")
    return null
  }

  const pqrsfsCerradas = [
    {
      radicado: "PQRSF-2023-010",
      tipo: "Petición",
      solicitante: "María González",
      area: "Área Responsable (Operativa)",
      fechaRadicacion: "Nov 15, 2023",
      fechaCierre: "Dic 10, 2023",
      tiempoRespuesta: "25 días",
      resultado: "Aprobada",
      satisfaccionCliente: "Satisfecho",
    },
    {
      radicado: "PQRSF-2023-023",
      tipo: "Queja",
      solicitante: "Roberto Díaz",
      area: "Servicio al Cliente",
      fechaRadicacion: "Nov 20, 2023",
      fechaCierre: "Dic 15, 2023",
      tiempoRespuesta: "25 días",
      resultado: "Resuelta",
      satisfaccionCliente: "Satisfecho",
    },
    {
      radicado: "PQRSF-2023-035",
      tipo: "Reclamo",
      solicitante: "Patricia Castro",
      area: "Área Responsable (Operativa)",
      fechaRadicacion: "Nov 25, 2023",
      fechaCierre: "Dic 18, 2023",
      tiempoRespuesta: "23 días",
      resultado: "Rechazada",
      satisfaccionCliente: "Insatisfecho",
    },
    {
      radicado: "PQRSF-2023-042",
      tipo: "Sugerencia",
      solicitante: "Miguel Torres",
      area: "Servicio al Cliente",
      fechaRadicacion: "Dic 01, 2023",
      fechaCierre: "Dic 20, 2023",
      tiempoRespuesta: "19 días",
      resultado: "Aceptada",
      satisfaccionCliente: "Muy Satisfecho",
    },
    {
      radicado: "PQRSF-2023-055",
      tipo: "Felicitación",
      solicitante: "Sandra Jiménez",
      area: "Servicio al Cliente",
      fechaRadicacion: "Dic 05, 2023",
      fechaCierre: "Dic 06, 2023",
      tiempoRespuesta: "1 día",
      resultado: "Registrada",
      satisfaccionCliente: "Muy Satisfecho",
    },
    {
      radicado: "PQRSF-2023-010",
      tipo: "Petición",
      solicitante: "María González",
      area: "Área Responsable (Operativa)",
      fechaRadicacion: "Nov 15, 2023",
      fechaCierre: "Dic 10, 2023",
      tiempoRespuesta: "25 días",
      resultado: "Aprobada",
      satisfaccionCliente: "Satisfecho",
    },
    {
      radicado: "PQRSF-2023-023",
      tipo: "Queja",
      solicitante: "Roberto Díaz",
      area: "Servicio al Cliente",
      fechaRadicacion: "Nov 20, 2023",
      fechaCierre: "Dic 15, 2023",
      tiempoRespuesta: "25 días",
      resultado: "Resuelta",
      satisfaccionCliente: "Satisfecho",
    },
    {
      radicado: "PQRSF-2023-035",
      tipo: "Reclamo",
      solicitante: "Patricia Castro",
      area: "Área Responsable (Operativa)",
      fechaRadicacion: "Nov 25, 2023",
      fechaCierre: "Dic 18, 2023",
      tiempoRespuesta: "23 días",
      resultado: "Rechazada",
      satisfaccionCliente: "Insatisfecho",
    },
    {
      radicado: "PQRSF-2023-042",
      tipo: "Sugerencia",
      solicitante: "Miguel Torres",
      area: "Servicio al Cliente",
      fechaRadicacion: "Dic 01, 2023",
      fechaCierre: "Dic 20, 2023",
      tiempoRespuesta: "19 días",
      resultado: "Aceptada",
      satisfaccionCliente: "Muy Satisfecho",
    },
    {
      radicado: "PQRSF-2023-055",
      tipo: "Felicitación",
      solicitante: "Sandra Jiménez",
      area: "Servicio al Cliente",
      fechaRadicacion: "Dic 05, 2023",
      fechaCierre: "Dic 06, 2023",
      tiempoRespuesta: "1 día",
      resultado: "Registrada",
      satisfaccionCliente: "Muy Satisfecho",
    },
    {
      radicado: "PQRSF-2023-010",
      tipo: "Petición",
      solicitante: "María González",
      area: "Área Responsable (Operativa)",
      fechaRadicacion: "Nov 15, 2023",
      fechaCierre: "Dic 10, 2023",
      tiempoRespuesta: "25 días",
      resultado: "Aprobada",
      satisfaccionCliente: "Satisfecho",
    },
    {
      radicado: "PQRSF-2023-023",
      tipo: "Queja",
      solicitante: "Roberto Díaz",
      area: "Servicio al Cliente",
      fechaRadicacion: "Nov 20, 2023",
      fechaCierre: "Dic 15, 2023",
      tiempoRespuesta: "25 días",
      resultado: "Resuelta",
      satisfaccionCliente: "Satisfecho",
    },
    {
      radicado: "PQRSF-2023-035",
      tipo: "Reclamo",
      solicitante: "Patricia Castro",
      area: "Área Responsable (Operativa)",
      fechaRadicacion: "Nov 25, 2023",
      fechaCierre: "Dic 18, 2023",
      tiempoRespuesta: "23 días",
      resultado: "Rechazada",
      satisfaccionCliente: "Insatisfecho",
    },
    {
      radicado: "PQRSF-2023-042",
      tipo: "Sugerencia",
      solicitante: "Miguel Torres",
      area: "Servicio al Cliente",
      fechaRadicacion: "Dic 01, 2023",
      fechaCierre: "Dic 20, 2023",
      tiempoRespuesta: "19 días",
      resultado: "Aceptada",
      satisfaccionCliente: "Muy Satisfecho",
    },
    {
      radicado: "PQRSF-2023-055",
      tipo: "Felicitación",
      solicitante: "Sandra Jiménez",
      area: "Servicio al Cliente",
      fechaRadicacion: "Dic 05, 2023",
      fechaCierre: "Dic 06, 2023",
      tiempoRespuesta: "1 día",
      resultado: "Registrada",
      satisfaccionCliente: "Muy Satisfecho",
    },
    {
      radicado: "PQRSF-2023-010",
      tipo: "Petición",
      solicitante: "María González",
      area: "Área Responsable (Operativa)",
      fechaRadicacion: "Nov 15, 2023",
      fechaCierre: "Dic 10, 2023",
      tiempoRespuesta: "25 días",
      resultado: "Aprobada",
      satisfaccionCliente: "Satisfecho",
    },
    {
      radicado: "PQRSF-2023-023",
      tipo: "Queja",
      solicitante: "Roberto Díaz",
      area: "Servicio al Cliente",
      fechaRadicacion: "Nov 20, 2023",
      fechaCierre: "Dic 15, 2023",
      tiempoRespuesta: "25 días",
      resultado: "Resuelta",
      satisfaccionCliente: "Satisfecho",
    },
    {
      radicado: "PQRSF-2023-035",
      tipo: "Reclamo",
      solicitante: "Patricia Castro",
      area: "Área Responsable (Operativa)",
      fechaRadicacion: "Nov 25, 2023",
      fechaCierre: "Dic 18, 2023",
      tiempoRespuesta: "23 días",
      resultado: "Rechazada",
      satisfaccionCliente: "Insatisfecho",
    },
    {
      radicado: "PQRSF-2023-042",
      tipo: "Sugerencia",
      solicitante: "Miguel Torres",
      area: "Servicio al Cliente",
      fechaRadicacion: "Dic 01, 2023",
      fechaCierre: "Dic 20, 2023",
      tiempoRespuesta: "19 días",
      resultado: "Aceptada",
      satisfaccionCliente: "Muy Satisfecho",
    },
    {
      radicado: "PQRSF-2023-055",
      tipo: "Felicitación",
      solicitante: "Sandra Jiménez",
      area: "Servicio al Cliente",
      fechaRadicacion: "Dic 05, 2023",
      fechaCierre: "Dic 06, 2023",
      tiempoRespuesta: "1 día",
      resultado: "Registrada",
      satisfaccionCliente: "Muy Satisfecho",
    },
    {
      radicado: "PQRSF-2023-055",
      tipo: "Felicitación",
      solicitante: "Sandra Jiménez",
      area: "Servicio al Cliente",
      fechaRadicacion: "Dic 05, 2023",
      fechaCierre: "Dic 06, 2023",
      tiempoRespuesta: "1 día",
      resultado: "Registrada",
      satisfaccionCliente: "Muy Satisfecho",
    },
    {
      radicado: "PQRSF-2023-010",
      tipo: "Petición",
      solicitante: "María González",
      area: "Área Responsable (Operativa)",
      fechaRadicacion: "Nov 15, 2023",
      fechaCierre: "Dic 10, 2023",
      tiempoRespuesta: "25 días",
      resultado: "Aprobada",
      satisfaccionCliente: "Satisfecho",
    },
    {
      radicado: "PQRSF-2023-023",
      tipo: "Queja",
      solicitante: "Roberto Díaz",
      area: "Servicio al Cliente",
      fechaRadicacion: "Nov 20, 2023",
      fechaCierre: "Dic 15, 2023",
      tiempoRespuesta: "25 días",
      resultado: "Resuelta",
      satisfaccionCliente: "Satisfecho",
    },
    {
      radicado: "PQRSF-2023-035",
      tipo: "Reclamo",
      solicitante: "Patricia Castro",
      area: "Área Responsable (Operativa)",
      fechaRadicacion: "Nov 25, 2023",
      fechaCierre: "Dic 18, 2023",
      tiempoRespuesta: "23 días",
      resultado: "Rechazada",
      satisfaccionCliente: "Insatisfecho",
    },
    {
      radicado: "PQRSF-2023-042",
      tipo: "Sugerencia",
      solicitante: "Miguel Torres",
      area: "Servicio al Cliente",
      fechaRadicacion: "Dic 01, 2023",
      fechaCierre: "Dic 20, 2023",
      tiempoRespuesta: "19 días",
      resultado: "Aceptada",
      satisfaccionCliente: "Muy Satisfecho",
    },
    {
      radicado: "PQRSF-2023-055",
      tipo: "Felicitación",
      solicitante: "Sandra Jiménez",
      area: "Servicio al Cliente",
      fechaRadicacion: "Dic 05, 2023",
      fechaCierre: "Dic 06, 2023",
      tiempoRespuesta: "1 día",
      resultado: "Registrada",
      satisfaccionCliente: "Muy Satisfecho",
    },
    {
      radicado: "PQRSF-2023-055",
      tipo: "Felicitación",
      solicitante: "Sandra Jiménez",
      area: "Servicio al Cliente",
      fechaRadicacion: "Dic 05, 2023",
      fechaCierre: "Dic 06, 2023",
      tiempoRespuesta: "1 día",
      resultado: "Registrada",
      satisfaccionCliente: "Muy Satisfecho",
    },
    {
      radicado: "PQRSF-2023-010",
      tipo: "Petición",
      solicitante: "María González",
      area: "Área Responsable (Operativa)",
      fechaRadicacion: "Nov 15, 2023",
      fechaCierre: "Dic 10, 2023",
      tiempoRespuesta: "25 días",
      resultado: "Aprobada",
      satisfaccionCliente: "Satisfecho",
    },
    {
      radicado: "PQRSF-2023-023",
      tipo: "Queja",
      solicitante: "Roberto Díaz",
      area: "Servicio al Cliente",
      fechaRadicacion: "Nov 20, 2023",
      fechaCierre: "Dic 15, 2023",
      tiempoRespuesta: "25 días",
      resultado: "Resuelta",
      satisfaccionCliente: "Satisfecho",
    },
    {
      radicado: "PQRSF-2023-035",
      tipo: "Reclamo",
      solicitante: "Patricia Castro",
      area: "Área Responsable (Operativa)",
      fechaRadicacion: "Nov 25, 2023",
      fechaCierre: "Dic 18, 2023",
      tiempoRespuesta: "23 días",
      resultado: "Rechazada",
      satisfaccionCliente: "Insatisfecho",
    },
    {
      radicado: "PQRSF-2023-042",
      tipo: "Sugerencia",
      solicitante: "Miguel Torres",
      area: "Servicio al Cliente",
      fechaRadicacion: "Dic 01, 2023",
      fechaCierre: "Dic 20, 2023",
      tiempoRespuesta: "19 días",
      resultado: "Aceptada",
      satisfaccionCliente: "Muy Satisfecho",
    },
    {
      radicado: "PQRSF-2023-055",
      tipo: "Felicitación",
      solicitante: "Sandra Jiménez",
      area: "Servicio al Cliente",
      fechaRadicacion: "Dic 05, 2023",
      fechaCierre: "Dic 06, 2023",
      tiempoRespuesta: "1 día",
      resultado: "Registrada",
      satisfaccionCliente: "Muy Satisfecho",
    },
  ]

  const filteredPQRSF = pqrsfsCerradas.filter((p) => {
    const matchSearch =
      p.radicado.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.solicitante.toLowerCase().includes(searchTerm.toLowerCase())
    const matchTipo = filtroTipo === "todos" || p.tipo === filtroTipo
    return matchSearch && matchTipo
  })

  const totalPages = Math.ceil(filteredPQRSF.length / itemsPerPage) || 1

  // Resetear a la página 1 cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filtroTipo, filtroMes])

  // Asegurar que currentPage esté dentro del rango válido cuando cambia totalPages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages)
    }
  }, [totalPages])

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

  // Calcular índices de paginación
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
          isCollapsed ? "lg:ml-24" : "lg:ml-64"
        )}
      >
        <div className="mb-6 sm:mb-8 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">PQRSF Cerradas</h1>
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
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger className="w-full sm:w-[200px]">
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


        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="grid grid-cols-2 grid-rows-2 gap-4">
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
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">
                      Solicitante: <span className="font-medium text-foreground">{pqrsf.solicitante}</span> • Área:{" "}
                      <span className="font-medium text-foreground">{pqrsf.area}</span>
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
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

                  <div className="flex flex-col gap-2 lg:min-w-[180px]">
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
