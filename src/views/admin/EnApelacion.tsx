import { useState } from "react"
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

export default function EnApelacion() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { isCollapsed } = useSidebar()
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroArea, setFiltroArea] = useState("todas")

  if (!user || user.rol !== "Administrador") {
    navigate("/dashboard")
    return null
  }

  const pqrsfsApeladas = [
    {
      radicado: "PQRSF-2023-051",
      tipo: "Queja",
      solicitante: "Ana López",
      area: "Área Responsable (Operativa)",
      motivoApelacion: "Los equipos siguen fallando después del supuesto mantenimiento",
      fechaApelacion: "Dic 20, 2023",
      respuestaOriginal: "Se realizó mantenimiento a los equipos",
      prioridad: "alta",
    },
    {
      radicado: "PQRSF-2023-078",
      tipo: "Reclamo",
      solicitante: "Pedro Sánchez",
      area: "Servicio al Cliente",
      motivoApelacion: "No estoy de acuerdo con la respuesta dada",
      fechaApelacion: "Dic 21, 2023",
      respuestaOriginal: "Su solicitud no cumple con los requisitos establecidos",
      prioridad: "media",
    },
    {
      radicado: "PQRSF-2023-089",
      tipo: "Petición",
      solicitante: "Laura Ramírez",
      area: "Área Responsable (Operativa)",
      motivoApelacion: "Solicito revisión adicional del caso",
      fechaApelacion: "Dic 22, 2023",
      respuestaOriginal: "La petición fue rechazada por falta de documentación",
      prioridad: "baja",
    },
  ]

  const filteredPQRSF = pqrsfsApeladas.filter((p) => {
    const matchSearch =
      p.radicado.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.solicitante.toLowerCase().includes(searchTerm.toLowerCase())
    const matchArea = filtroArea === "todas" || p.area === filtroArea
    return matchSearch && matchArea
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
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">PQRSF En Apelación</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Casos devueltos a las áreas para reanálisis</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3 mb-6">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <h3 className="text-sm font-medium text-muted-foreground">Total en Apelación</h3>
              </div>
              <p className="text-3xl font-bold text-foreground">{pqrsfsApeladas.length}</p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <h3 className="text-sm font-medium text-muted-foreground">Prioridad Alta</h3>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {pqrsfsApeladas.filter((p) => p.prioridad === "alta").length}
              </p>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <h3 className="text-sm font-medium text-muted-foreground">Prioridad Media</h3>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {pqrsfsApeladas.filter((p) => p.prioridad === "media").length}
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
              <Select value={filtroArea} onValueChange={setFiltroArea}>
                <SelectTrigger className="w-full sm:w-[250px]">
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
        </Card>

        <div className="space-y-4">
          {filteredPQRSF.map((pqrsf) => (
            <Card key={pqrsf.radicado} className="hover:shadow-md transition-shadow border-l-4 border-l-red-500">
              <CardContent className="p-6">
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

                  <div className="flex flex-col gap-2 lg:min-w-[180px]">
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
      </main>
    </div>
  )
}
