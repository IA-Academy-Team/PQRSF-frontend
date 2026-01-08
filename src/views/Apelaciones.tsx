import { Search, Filter, Calendar, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sidebar } from "@/components/sidebar"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/auth-context"
import { useEffect } from "react"

export default function Apelaciones() {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()

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

  const apelaciones = [
    {
      id: "PQRSF-2023-010",
      solicitante: "María Pérez",
      tipo: "Petición",
      area: user.area || "Formación",
      fechaOriginal: "2023-12-10",
      fechaApelacion: "2023-12-18",
      descripcion: "Solicitud rechazada - Usuario apela decisión sobre certificado",
      motivoApelacion: "Considera que cumple con todos los requisitos documentados",
      analisisAnterior: "Rechazada por documentación incompleta",
      urgente: true,
    },
    {
      id: "PQRSF-2023-013",
      solicitante: "Pedro Gómez",
      tipo: "Queja",
      area: user.area || "Formación",
      fechaOriginal: "2023-12-12",
      fechaApelacion: "2023-12-19",
      descripcion: "Apelación sobre tiempo de respuesta en solicitud anterior",
      motivoApelacion: "La respuesta no abordó el problema principal planteado",
      analisisAnterior: "Cerrada como resuelta",
      urgente: false,
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
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 lg:ml-64 overflow-y-auto min-h-screen">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Apelaciones</h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            PQRSF que requieren reanálisis por apelación del usuario
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar por radicado o solicitante..." className="pl-10" />
              </div>

              <Select defaultValue="todos">
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los tipos</SelectItem>
                  <SelectItem value="peticion">Petición</SelectItem>
                  <SelectItem value="queja">Queja</SelectItem>
                  <SelectItem value="reclamo">Reclamo</SelectItem>
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
          <p className="text-sm text-muted-foreground">Mostrando {apelaciones.length} apelaciones activas</p>
        </div>

        <div className="space-y-4">
          {apelaciones.map((item) => (
            <Card
              key={item.id}
              className={`hover:shadow-lg transition-shadow ${item.urgente ? "border-2 border-red-300" : ""}`}
            >
              <CardContent className="p-4 sm:p-6">
                {item.urgente && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <p className="text-sm font-medium text-red-700">Apelación Urgente - Requiere atención inmediata</p>
                  </div>
                )}

                <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
                  <div className="flex-1 w-full">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                      <span className="font-mono text-sm font-semibold text-primary">{item.id}</span>
                      <span className={`text-xs font-medium px-3 py-1 rounded-full border ${getTypeColor(item.tipo)}`}>
                        {item.tipo}
                      </span>
                      <span className="text-xs font-medium px-3 py-1 rounded-full bg-red-100 text-red-700">
                        Apelada
                      </span>
                    </div>

                    <h3 className="font-semibold text-base sm:text-lg text-foreground mb-2">{item.descripcion}</h3>

                    <div className="space-y-2 mb-4">
                      <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Solicitante:</span> {item.solicitante}
                        </div>
                        <div>
                          <span className="font-medium">Radicación original:</span> {item.fechaOriginal}
                        </div>
                        <div>
                          <span className="font-medium">Fecha apelación:</span> {item.fechaApelacion}
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1">MOTIVO DE APELACIÓN</p>
                        <p className="text-sm">{item.motivoApelacion}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1">ANÁLISIS ANTERIOR</p>
                        <p className="text-sm">{item.analisisAnterior}</p>
                      </div>
                    </div>
                  </div>

                  <Link to={`/pqrsf/${item.id}`} className="w-full lg:w-auto">
                    <Button className="w-full lg:w-auto bg-red-600 hover:bg-red-700">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Reanalizar
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
