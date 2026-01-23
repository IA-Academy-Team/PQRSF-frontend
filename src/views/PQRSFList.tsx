import { Search, Filter, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sidebar } from "@/components/sidebar"
import { Link } from "react-router-dom"
import { useEffect, useMemo, useState } from "react"
import { pqrsfService, type PQRSFListItem, type PQRSFListQuery } from "@/services/pqrsf.service"

export default function PQRSFList() {
  const [items, setItems] = useState<PQRSFListItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [dateFilter, setDateFilter] = useState("")
  const [sortFilter, setSortFilter] = useState("recent")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Radicado":
        return "bg-orange-100 text-orange-700"
      case "Analisis":
        return "bg-blue-100 text-blue-700"
      case "Reanálisis":
        return "bg-red-100 text-red-700"
      case "Cerrado":
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

  useEffect(() => {
    let active = true
    const timeout = setTimeout(async () => {
      setIsLoading(true)
      setError("")
      try {
        const query: PQRSFListQuery = {
          q: searchTerm.trim() || undefined,
          sort: sortFilter as PQRSFListQuery["sort"],
        }
        if (statusFilter !== "todos") {
          query.pqrsStatusId = Number(statusFilter)
        }
        if (dateFilter) {
          query.fromDate = dateFilter
          query.toDate = dateFilter
        }

        const data = await pqrsfService.getAdminList(query)
        if (!active) return
        setItems(data)
      } catch (err) {
        if (!active) return
        console.error("[pqrsf] list error", err)
        setError("No se pudo cargar la bandeja de PQRSF.")
      } finally {
        if (active) setIsLoading(false)
      }
    }, 300)

    return () => {
      active = false
      clearTimeout(timeout)
    }
  }, [searchTerm, statusFilter, dateFilter, sortFilter])

  const formattedItems = useMemo(
    () =>
      items.map((item) => ({
        id: item.ticketNumber,
        user: item.clientName || "Anónimo",
        type: item.typeName,
        area: item.areaName,
        date: item.createdAt ? new Date(item.createdAt).toLocaleDateString("es-CO") : "Sin fecha",
        status: item.statusName,
        description: item.description || "Sin descripcion",
      })),
    [items],
  )

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
                <Input
                  placeholder="Buscar por nombre, ID o descripción..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="1">Radicado</SelectItem>
                  <SelectItem value="2">Analisis</SelectItem>
                  <SelectItem value="3">Reanálisis</SelectItem>
                  <SelectItem value="4">Cerrado</SelectItem>
                </SelectContent>
              </Select>

              <div className="relative w-full md:w-[200px]">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  className="pl-10"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>

              <Select value={sortFilter} onValueChange={setSortFilter}>
                <SelectTrigger className="w-full md:w-[220px]">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Fecha (Más reciente)</SelectItem>
                  <SelectItem value="oldest">Fecha (Más antiguo)</SelectItem>
                  <SelectItem value="ticket">ID</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {isLoading && (
            <Card className="border-dashed">
              <CardContent className="p-6 text-sm text-muted-foreground">Cargando bandeja...</CardContent>
            </Card>
          )}
          {!isLoading && formattedItems.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="p-6 text-sm text-muted-foreground">No hay PQRSF para mostrar.</CardContent>
            </Card>
          )}
          {formattedItems.map((item) => (
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
