import { useState } from "react"
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

export default function Cerradas() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { isCollapsed } = useSidebar()
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroTipo, setFiltroTipo] = useState("todos")
  const [filtroMes, setFiltroMes] = useState("todos")

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
  ]

  const filteredPQRSF = pqrsfsCerradas.filter((p) => {
    const matchSearch =
      p.radicado.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.solicitante.toLowerCase().includes(searchTerm.toLowerCase())
    const matchTipo = filtroTipo === "todos" || p.tipo === filtroTipo
    return matchSearch && matchTipo
  })

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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">PQRSF Cerradas</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Histórico completo de solicitudes finalizadas
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="text-sm font-medium text-muted-foreground">Total Cerradas</h3>
              </div>
              <p className="text-3xl font-bold text-foreground">{pqrsfsCerradas.length}</p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <h3 className="text-sm font-medium text-muted-foreground">Clientes Satisfechos</h3>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {pqrsfsCerradas.filter((p) => ["Satisfecho", "Muy Satisfecho"].includes(p.satisfaccionCliente)).length}
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <h3 className="text-sm font-medium text-muted-foreground">Tiempo Promedio</h3>
              </div>
              <p className="text-3xl font-bold text-foreground">18.6</p>
              <p className="text-xs text-muted-foreground">días</p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="h-5 w-5 text-orange-600" />
                <h3 className="text-sm font-medium text-muted-foreground">Este Mes</h3>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {pqrsfsCerradas.filter((p) => p.fechaCierre.includes("Dic")).length}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4 sm:p-6">
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
        </Card>

        <div className="space-y-4">
          {filteredPQRSF.map((pqrsf) => (
            <Card key={pqrsf.radicado} className="hover:shadow-md transition-shadow border-l-4 border-l-green-500">
              <CardContent className="p-6">
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
      </main>
    </div>
  )
}
