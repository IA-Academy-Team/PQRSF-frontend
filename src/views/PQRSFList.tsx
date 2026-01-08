import { Search, Filter, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sidebar } from "@/components/sidebar"
import { Link } from "react-router-dom"

export default function PQRSFList() {
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
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pendiente":
        return "bg-orange-100 text-orange-700"
      case "En revisión":
        return "bg-blue-100 text-blue-700"
      case "Aprobado":
        return "bg-green-100 text-green-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

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

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 p-8 ml-64 overflow-y-auto h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Listado General de PQRSF</h1>
          <p className="text-muted-foreground">Busca y filtra todas las solicitudes registradas en el sistema</p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
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
        </Card>

        <div className="space-y-4">
          {pqrsfItems.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="font-mono text-sm font-semibold text-primary">{item.id}</span>
                      <span className={`text-xs font-medium px-3 py-1 rounded-full border ${getTypeColor(item.type)}`}>
                        {item.type}
                      </span>
                      <span className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>

                    <h3 className="font-semibold text-lg text-foreground mb-2">{item.description}</h3>

                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Usuario:</span> {item.user}
                      </div>
                      <div>
                        <span className="font-medium">Área:</span> {item.area}
                      </div>
                      <div>
                        <span className="font-medium">Fecha:</span> {item.date}
                      </div>
                    </div>
                  </div>

                  <Link to={`/pqrsf/${item.id}`}>
                    <Button>Ver Detalle</Button>
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
