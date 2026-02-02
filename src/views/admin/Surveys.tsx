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
import { surveyService, getSurveyOverallAverage } from "@/services/survey.service"
import type { PQRSFSurveyDetailed } from "@/types/database"
import { PQRSFPagination } from "@/components/PQRSFPagination"

/** Encuestas por página solo en esta vista */
const ITEMS_PER_PAGE = 9

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
  const itemsPerPage = ITEMS_PER_PAGE
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
  const overallAverage = useMemo(() => getSurveyOverallAverage(items), [items])

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {showSidebar && <Sidebar />}

      <main
        className={cn(
          "flex-1 flex flex-col min-h-0 p-4 sm:p-6 lg:p-8 min-[1600px]:p-10 transition-all duration-300 overflow-hidden",
          showSidebar ? (isCollapsed ? "lg:ml-24" : "lg:ml-64") : "",
        )}
      >
        <div className="shrink-0 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl min-[1600px]:text-4xl font-bold text-foreground mb-1 sm:mb-2 min-[1600px]:mb-3">Encuestas PQRSF</h1>
              <p className="text-sm min-[1600px]:text-base text-muted-foreground">
                Consulta el nivel de satisfaccion reportado por los usuarios.
              </p>
            </div>
            <Button
              variant="outline"
              size="lg"
              className="gap-2 self-start sm:self-auto text-base sm:text-lg min-[1600px]:text-xl px-4 sm:px-6 py-3 sm:py-4 min-[1600px]:px-8 min-[1600px]:py-5"
            >
              <Star className="h-5 w-5 text-amber-500" />
              {overallAverage !== null ? overallAverage.toFixed(1) : "Sin datos"}
            </Button>
          </div>
        </div>

        <CardContent className="pb-4 sm:pb-6 px-0 mb-4 sm:mb-6 shrink-0">
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
          <div className="shrink-0 mb-4 rounded-lg border border-red-200 bg-red-50 p-4 min-[1600px]:p-5 text-sm min-[1600px]:text-base text-red-700">
            {error}
          </div>
        )}

        <div className="flex-1 min-h-0 overflow-hidden mb-2 flex flex-col">
          <div
            className={cn(
              "grid grid-cols-1 md:grid-cols-3 grid-rows-3 auto-rows-min min-h-0 flex-1 gap-2 md:gap-3 min-[1600px]:gap-5",
              "[@media(max-height:1079px)]:auto-rows-fr [@media(max-height:1079px)]:min-h-full",
            )}
            style={{ minHeight: 0 }}
          >
            {isLoading && (
              <Card className="col-span-full border-dashed min-h-0 overflow-hidden">
                <CardContent className="p-4 text-sm text-muted-foreground">Cargando encuestas...</CardContent>
              </Card>
            )}
            {!isLoading && paginatedItems.length === 0 && (
              <Card className="col-span-full border-dashed min-h-0 overflow-hidden">
                <CardContent className="p-4 text-sm text-muted-foreground">No hay encuestas registradas.</CardContent>
              </Card>
            )}

            {paginatedItems.map((item) => {
              const average = computeAverage(item)
              const createdAt = item.createdAt ? new Date(item.createdAt) : null
              return (
                <Card
                  key={item.id}
                    className={cn(
                      "h-full flex flex-col min-h-0 overflow-hidden hover:shadow-sm transition-shadow @container/survey-card",
                      "[@media(max-height:1079px)]:max-h-full [@media(min-height:1080px)]:max-h-[70vh]",
                    )}
                >
                  <CardContent className="p-[clamp(0.35rem,2cqw,1rem)] space-y-[clamp(0.2rem,1.2cqh,1rem)] flex-1 min-h-0 overflow-hidden flex flex-col">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-[clamp(0.2rem,1cqh,0.75rem)] shrink-0 min-h-0">
                      <div className="min-w-0">
                        <p className="font-semibold text-primary truncate text-[clamp(0.6rem,3.5cqw,0.875rem)]">{item.ticketNumber}</p>
                        <p className="text-muted-foreground truncate text-[clamp(0.55rem,3cqw,0.8125rem)]">
                          {item.clientName || "Anonimo"} • {item.areaName}
                        </p>
                      </div>
                      <div className="flex items-center gap-[clamp(0.2rem,1.2cqw,0.5rem)] shrink-0">
                        <Star className="h-[clamp(0.65rem,4cqh,1rem)] w-[clamp(0.65rem,4cqh,1rem)] text-amber-500 shrink-0" />
                        <span className="font-semibold text-foreground text-[clamp(0.6rem,3.5cqw,0.875rem)]">
                          {average !== null ? average.toFixed(1) : "Sin puntaje"}
                        </span>
                        <Dialog>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="size-[clamp(1.25rem,5cqh,2rem)] p-0 shrink-0">
                                  <ArrowUpRight className="h-[clamp(0.65rem,3.5cqh,1rem)] w-[clamp(0.65rem,3.5cqh,1rem)]" />
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
                            <div className="rounded-lg border border-border bg-muted/20 p-3 text-sm text-muted-foreground">
                              {item.comment?.trim() ? (
                                <p>"{item.comment.trim()}"</p>
                              ) : (
                                <p className="italic">El usuario no dejó comentario en esta encuesta.</p>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-[clamp(0.15rem,1cqh,0.5rem)] text-[clamp(0.5rem,2.5cqw,0.75rem)] text-muted-foreground shrink-0 min-h-0">
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground">Tipo</p>
                        <p className="truncate">{item.typeName}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground">Estado</p>
                        <p className="truncate">{item.statusName}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground">Fecha</p>
                        <p className="truncate">{createdAt ? createdAt.toLocaleDateString("es-CO") : "Sin fecha"}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground">Contacto</p>
                        <p className="truncate">{item.clientEmail || "Sin correo"}</p>
                      </div>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/20 p-[clamp(0.35rem,1.5cqw,0.75rem)] flex-1 min-h-13 overflow-y-auto flex flex-col">
                      {item.comment?.trim() ? (
                        <p className="text-muted-foreground text-[clamp(0.6rem,2.8cqw,0.875rem)] leading-snug wrap-break-word whitespace-pre-wrap">"{item.comment.trim()}"</p>
                      ) : (
                        <p className="text-muted-foreground italic text-[clamp(0.55rem,2.5cqw,0.8125rem)] leading-snug">El usuario no dejó comentario en esta encuesta.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        <div className="shrink-0 border-t border-border pt-4 mt-4 sm:mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {totalItems === 0
              ? "Mostrando 0 de 0 encuestas"
              : `Mostrando ${startIndex + 1} - ${endIndex} de ${totalItems} encuestas`}
          </p>
          <PQRSFPagination
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </main>
    </div>
  )
}
