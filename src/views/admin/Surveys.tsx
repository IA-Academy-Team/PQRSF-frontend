import { useEffect, useMemo, useState } from "react"
import { Search, Star, ArrowUpRight } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { useAuth } from "@/contexts/auth-context"
import { useSidebar } from "@/contexts/sidebar-context"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { surveyService } from "@/services/survey.service"
import type { PQRSFSurveyDetailed } from "@/types/database"

const computeAverage = (survey: PQRSFSurveyDetailed) => {
  const values = [
    survey.q1Clarity,
    survey.q2Timeliness,
    survey.q3Quality,
    survey.q4Attention,
    survey.q5Overall,
  ].filter((value): value is number => typeof value === "number")
  if (values.length === 0) return null
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

const QUESTION_LABELS = [
  { key: "q1Clarity", label: "Claridad del proceso" },
  { key: "q2Timeliness", label: "Tiempo de respuesta" },
  { key: "q3Quality", label: "Calidad de la respuesta" },
  { key: "q4Attention", label: "Trato y atencion" },
  { key: "q5Overall", label: "Satisfaccion general" },
] as const

const formatScore = (value: number | null) => {
  if (typeof value !== "number") return "Sin respuesta"
  return `${value} / 5`
}

export default function Surveys() {
  const { user } = useAuth()
  const { isCollapsed } = useSidebar()
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [items, setItems] = useState<PQRSFSurveyDetailed[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const itemsPerPage = 9
  const showSidebar = Boolean(user)

  useEffect(() => {
    let active = true
    const loadSurveys = async () => {
      setIsLoading(true)
      setError("")
      try {
        const data = await surveyService.listAdmin()
        if (!active) return
        setItems(data)
      } catch (err) {
        if (!active) return
        console.error("[surveys] load error", err)
        setError("No se pudieron cargar las encuestas.")
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void loadSurveys()
    return () => {
      active = false
    }
  }, [])

  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return items
    return items.filter((item) => {
      const ticket = item.ticketNumber.toLowerCase()
      const client = (item.clientName || "").toLowerCase()
      const area = (item.areaName || "").toLowerCase()
      return ticket.includes(term) || client.includes(term) || area.includes(term)
    })
  }, [items, searchTerm])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const totalItems = filteredItems.length
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
  const safePage = Math.min(Math.max(1, currentPage), totalPages)
  const startIndex = (safePage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems)
  const paginatedItems = filteredItems.slice(startIndex, endIndex)
  const overallAverage = useMemo(() => {
    const values = items.flatMap((survey) => [
      survey.q1Clarity,
      survey.q2Timeliness,
      survey.q3Quality,
      survey.q4Attention,
      survey.q5Overall,
    ]).filter((value): value is number => typeof value === "number")
    if (values.length === 0) return null
    return values.reduce((sum, value) => sum + value, 0) / values.length
  }, [items])

  return (
    <div className="flex min-h-screen bg-background">
      {showSidebar && <Sidebar />}

      <main
        className={cn(
          "flex-1 p-4 sm:p-6 lg:p-8 h-screen transition-all duration-300 flex flex-col",
          showSidebar ? (isCollapsed ? "lg:ml-24" : "lg:ml-64") : "",
        )}
      >
        <div className="mb-6 sm:mb-8 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Encuestas PQRSF</h1>
              <p className="text-sm text-muted-foreground">
                Consulta el nivel de satisfaccion reportado por los usuarios.
              </p>
            </div>
            <Button variant="outline" size="sm" className="gap-2 self-start sm:self-auto">
              <Star className="h-4 w-4 text-amber-500" />
              Promedio general: {overallAverage !== null ? overallAverage.toFixed(1) : "Sin datos"}
            </Button>
          </div>
        </div>

        <CardContent className="pb-6 px-0 mb-6 shrink-0">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por radicado, solicitante o area..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading && (
              <Card className="border-dashed sm:col-span-2 lg:col-span-3">
                <CardContent className="p-4 text-sm text-muted-foreground">Cargando encuestas...</CardContent>
              </Card>
            )}
            {!isLoading && paginatedItems.length === 0 && (
              <Card className="border-dashed sm:col-span-2 lg:col-span-3">
                <CardContent className="p-4 text-sm text-muted-foreground">No hay encuestas registradas.</CardContent>
              </Card>
            )}

            {paginatedItems.map((item) => {
              const average = computeAverage(item)
              const createdAt = item.createdAt ? new Date(item.createdAt) : null
              return (
                <Card key={item.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-primary">{item.ticketNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.clientName || "Anonimo"} • {item.areaName}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-semibold text-foreground">
                          {average !== null ? average.toFixed(1) : "Sin puntaje"}
                        </span>
                        <Dialog>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <ArrowUpRight className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                            </TooltipTrigger>
                            <TooltipContent>Ver detalle de puntajes</TooltipContent>
                          </Tooltip>
                          <DialogContent className="sm:max-w-xl">
                            <DialogHeader>
                              <DialogTitle>Detalle de encuesta</DialogTitle>
                              <DialogDescription>
                                {item.ticketNumber} • {item.clientName || "Anonimo"}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-3">
                              {QUESTION_LABELS.map((question) => {
                                const value = item[question.key]
                                return (
                                  <div
                                    key={question.key}
                                    className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm"
                                  >
                                    <span className="text-foreground">{question.label}</span>
                                    <span className="font-semibold text-foreground">{formatScore(value as number)}</span>
                                  </div>
                                )
                              })}
                            </div>
                            {item.comment && (
                              <div className="rounded-lg border border-border bg-muted/20 p-3 text-sm text-muted-foreground">
                                "{item.comment}"
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-muted-foreground">
                      <div>
                        <p className="font-semibold text-foreground">Tipo</p>
                        <p>{item.typeName}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Estado</p>
                        <p>{item.statusName}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Fecha</p>
                        <p>{createdAt ? createdAt.toLocaleDateString("es-CO") : "Sin fecha"}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Contacto</p>
                        <p>{item.clientEmail || "Sin correo"}</p>
                      </div>
                    </div>
                    {item.comment && (
                      <div className="rounded-lg border border-border bg-muted/20 p-3 text-sm text-muted-foreground">
                        "{item.comment}"
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-2" />
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {totalItems === 0
              ? "Mostrando 0 de 0 encuestas"
              : `Mostrando ${startIndex + 1} - ${endIndex} de ${totalItems} encuestas`}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={safePage <= 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={safePage >= totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
