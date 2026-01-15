import { Search, Filter, Calendar, ClipboardList } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sidebar } from "@/components/sidebar"
import { useSidebar } from "@/contexts/sidebar-context"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/auth-context"
import { useEffect } from "react"
import { cn } from "@/lib/utils"

export default function AnalisisPendientes() {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()
  const { isCollapsed } = useSidebar()

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/")
    }
    if (!isLoading && user?.rol !== "Usuario de Área Responsable") {
      navigate("/dashboard")
    }
  }, [user, isLoading, navigate])

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  const pqrsfPendientes = [
    {
      id: "PQRSF-2023-001",
      solicitante: "Carlos Mendoza",
      tipo: "Petición",
      area: user.area || "Formación",
      fecha: "2023-12-15",
      prioridad: "Media",
      descripcion: "Solicitud de cambio de horario de clase",
      diasTranscurridos: 5,
    },
    {
      id: "PQRSF-2023-005",
      solicitante: "Ana García",
      tipo: "Queja",
      area: user.area || "Formación",
      fecha: "2023-12-16",
      prioridad: "Alta",
      descripcion: "Falta de equipos en sala de cómputo",
      diasTranscurridos: 4,
    },
    {
      id: "PQRSF-2023-008",
      solicitante: "Luis Rodríguez",
      tipo: "Sugerencia",
      area: user.area || "Formación",
      fecha: "2023-12-17",
      prioridad: "Baja",
      descripcion: "Mejoras en material didáctico",
      diasTranscurridos: 3,
    },
    {
      id: "PQRSF-2023-012",
      solicitante: "Sandra López",
      tipo: "Petición",
      area: user.area || "Formación",
      fecha: "2023-12-18",
      prioridad: "Media",
      descripcion: "Solicitud de certificado de notas",
      diasTranscurridos: 2,
    },
  ]

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Petición":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "Queja":
        return "bg-red-50 text-red-700 border-red-200"
      case "Reclamo":
        return "bg-orange-50 text-orange-700 border-orange-200"
      case "Sugerencia":
        return "bg-green-50 text-green-700 border-green-200"
      case "Felicitación":
        return "bg-purple-50 text-purple-700 border-purple-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Alta":
        return "bg-red-100 text-red-700"
      case "Media":
        return "bg-yellow-100 text-yellow-700"
      case "Baja":
        return "bg-green-100 text-green-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main
        className={cn(
          "flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-h-screen transition-all duration-300",
          isCollapsed ? "lg:ml-24" : "lg:ml-64"
        )}
      >
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ClipboardList className="h-8 w-8 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">PQRSF Pendientes de Respuesta</h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            PQRSF asignadas a {user.area} que requieren respuesta directa al cliente
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar por radicado, solicitante o descripción..." className="pl-10" />
              </div>

              <Select defaultValue="todos">
                <SelectTrigger className="w-full sm:w-[200px]">
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

              <div className="relative w-full sm:w-[200px]">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="date" className="pl-10" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Mostrando {pqrsfPendientes.length} solicitudes pendientes de respuesta
          </p>
        </div>

        <div className="space-y-4">
          {pqrsfPendientes.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
                  <div className="flex-1 w-full">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                      <span className="font-mono text-sm font-semibold text-primary">{item.id}</span>
                      <span className={`text-xs font-medium px-3 py-1 rounded-full border ${getTypeColor(item.tipo)}`}>
                        {item.tipo}
                      </span>
                      <span
                        className={`text-xs font-medium px-3 py-1 rounded-full ${getPriorityColor(item.prioridad)}`}
                      >
                        Prioridad {item.prioridad}
                      </span>
                      <span className="text-xs font-medium px-3 py-1 rounded-full bg-orange-100 text-orange-700">
                        Pendiente de Respuesta
                      </span>
                    </div>

                    <h3 className="font-semibold text-base sm:text-lg text-foreground mb-2">{item.descripcion}</h3>

                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Solicitante:</span> {item.solicitante}
                      </div>
                      <div>
                        <span className="font-medium">Área:</span> {item.area}
                      </div>
                      <div>
                        <span className="font-medium">Radicado:</span> {item.fecha}
                      </div>
                      <div>
                        <span className="font-medium">Tiempo:</span>{" "}
                        <span className="text-orange-600">{item.diasTranscurridos} días transcurridos</span>
                      </div>
                    </div>
                  </div>

                  <Link to={`/pqrsf/${item.id}`} className="w-full lg:w-auto">
                    <Button className="w-full lg:w-auto">
                      <ClipboardList className="h-4 w-4 mr-2" />
                      Responder al Cliente
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
