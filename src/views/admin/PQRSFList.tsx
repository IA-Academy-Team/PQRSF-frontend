import { useState, useMemo } from "react"
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"

export default function PQRSFList() {
  const { isCollapsed } = useSidebar()
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 4

  const pqrsfItems = [
    {
      id: "PQRSF-2023-001",
      user: "Carlos Mendoza",
      type: "Petición",
      area: "Formación",
      date: "2023-12-15",
      status: "Pendiente",
      description: "Solicitud de cambio de horario de clase",
    },
    {
      id: "PQRSF-2023-002",
      user: "Ana García",
      type: "Queja",
      area: "Empleabilidad",
      date: "2023-12-14",
      status: "En revisión",
      description: "Falta de seguimiento en proceso de contratación",
    },
    {
      id: "PQRSF-2023-003",
      user: "Luis Rodríguez",
      type: "Sugerencia",
      area: "Coworking Hubux",
      date: "2023-12-13",
      status: "Aprobado",
      description: "Mejoras en espacios de trabajo colaborativo",
    },
    {
      id: "PQRSF-2023-004",
      user: "Anónimo",
      type: "Reclamo",
      area: "Administración",
      date: "2023-12-12",
      status: "Pendiente",
      description: "Inconformidad con proceso de pago",
    },
    {
      id: "PQRSF-2023-005",
      user: "María López",
      type: "Petición",
      area: "Formación",
      date: "2023-12-11",
      status: "En revisión",
      description: "Solicitud de certificado de estudios",
    },
    {
      id: "PQRSF-2023-006",
      user: "Juan Pérez",
      type: "Queja",
      area: "Empleabilidad",
      date: "2023-12-10",
      status: "Pendiente",
      description: "Problemas con el proceso de selección",
    },
    {
      id: "PQRSF-2023-007",
      user: "Sofía Martínez",
      type: "Sugerencia",
      area: "Coworking Hubux",
      date: "2023-12-09",
      status: "Aprobado",
      description: "Mejoras en los espacios de trabajo",
    },
    {
      id: "PQRSF-2023-008",
      user: "Diego Ramírez",
      type: "Reclamo",
      area: "Administración",
      date: "2023-12-08",
      status: "En revisión",
      description: "Problema con facturación",
    },
    {
      id: "PQRSF-2023-009",
      user: "Laura García",
      type: "Felicitación",
      area: "Servicio al Cliente",
      date: "2023-12-07",
      status: "Aprobado",
      description: "Excelente atención recibida",
    },
    {
      id: "PQRSF-2023-010",
      user: "Carlos Torres",
      type: "Petición",
      area: "Formación",
      date: "2023-12-06",
      status: "Pendiente",
      description: "Solicitud de cambio de grupo",
    },
    {
      id: "PQRSF-2023-011",
      user: "Ana Rodríguez",
      type: "Queja",
      area: "Empleabilidad",
      date: "2023-12-05",
      status: "En revisión",
      description: "Falta de respuesta en proceso de contratación",
    },
    {
      id: "PQRSF-2023-012",
      user: "Pedro Sánchez",
      type: "Reclamo",
      area: "Administración",
      date: "2023-12-04",
      status: "Pendiente",
      description: "Problema con el sistema de pagos",
    },
    {
      id: "PQRSF-2023-013",
      user: "Carmen Díaz",
      type: "Sugerencia",
      area: "Coworking Hubux",
      date: "2023-12-03",
      status: "Aprobado",
      description: "Mejoras en la iluminación de espacios",
    },
    {
      id: "PQRSF-2023-014",
      user: "Roberto Jiménez",
      type: "Petición",
      area: "Formación",
      date: "2023-12-02",
      status: "En revisión",
      description: "Solicitud de material adicional",
    },
    {
      id: "PQRSF-2023-015",
      user: "Patricia Castro",
      type: "Queja",
      area: "Empleabilidad",
      date: "2023-12-01",
      status: "Pendiente",
      description: "Problemas con el portal de empleo",
    },
  ]

  const totalPages = Math.ceil(pqrsfItems.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedItems = pqrsfItems.slice(startIndex, endIndex)

  const statusStyles: Record<string, string> = {
    pendiente: "bg-amber-50 text-amber-700 border-amber-200",
    "en revisión": "bg-blue-50 text-blue-700 border-blue-200",
    aprobado: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rechazado: "bg-red-50 text-red-700 border-red-200",
  }

  const getStatusKey = (status: string): string => {
    return status.toLowerCase()
  }

  const getStatusStyle = (status: string): string => {
    const key = getStatusKey(status)
    return statusStyles[key] || "bg-gray-50 text-gray-700 border-gray-200"
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main
        className={cn(
          "flex-1 p-8 h-screen transition-all duration-300 flex flex-col",
          isCollapsed ? "lg:ml-24" : "lg:ml-64"
        )}
      >
        <div className="mb-8 shrink-0">
          <h1 className="text-3xl font-bold text-foreground mb-2">Listado General de PQRSF</h1>
          <p className="text-muted-foreground">Busca y filtra todas las solicitudes registradas en el sistema</p>
        </div>

        <CardContent className="pb-6 px-0 mb-6 shrink-0">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por nombre, ID o descripción..." className="pl-10" />
            </div>

            <Select defaultValue="todos">
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="revision">En revisión</SelectItem>
                <SelectItem value="aprobado">Aprobado</SelectItem>
                <SelectItem value="rechazado">Rechazado</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative w-full md:w-[200px]">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="date" className="pl-10" />
            </div>

            <Select defaultValue="reciente">
              <SelectTrigger className="w-full md:w-[220px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reciente">Fecha (Más reciente)</SelectItem>
                <SelectItem value="antiguo">Fecha (Más antiguo)</SelectItem>
                <SelectItem value="id">ID</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>

        <div className="flex-1 min-h-0 overflow-y-auto mb-6">
          <div className="space-y-2">
            {paginatedItems.map((item) => (
              <Card key={item.id} className="p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  {/* Contenido principal */}
                  <div className="flex-1 min-w-0 space-y-3">
                    {/* Header con ID y badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-muted-foreground">{item.id}</span>
                      <Badge variant="outline" className="text-xs font-medium">
                        {item.type}
                      </Badge>
                      <Badge variant="outline" className={`text-xs font-medium capitalize ${getStatusStyle(item.status)}`}>
                        {item.status}
                      </Badge>
                    </div>

                    {/* Título */}
                    <h3 className="font-medium text-foreground leading-snug">{item.description}</h3>

                    {/* Metadatos */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        <span>{item.user}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5" />
                        <span>{item.area}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{item.date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Botón de acción */}
                  <Link to={`/pqrsf/${item.id}`}>
                    <Button variant="ghost" size="sm" className="shrink-0">
                      Ver Detalle
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
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
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            setCurrentPage(page)
                          }}
                          isActive={currentPage === page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )
                  }
                  return null
                })}
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
