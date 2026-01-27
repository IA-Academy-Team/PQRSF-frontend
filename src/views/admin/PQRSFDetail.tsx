import {
  ArrowLeft,
  User,
  Calendar,
  Building2,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  Paperclip,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Sidebar } from "@/components/sidebar"
import { useSidebar } from "@/contexts/sidebar-context"
import { Link, useParams, useNavigate } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { areaService } from "@/services/area.service"
import { catalogService } from "@/services/catalog.service"
import {
  pqrsfService,
  type PQRSFDetailItem,
} from "@/services/pqrsf.service"
import type { Document, Response as ResponseItem, PQRSFAnalysis } from "@/types/database"
import { notifyError, notifySuccess } from "@/lib/toast"

const DAY_MS = 1000 * 60 * 60 * 24

const formatDate = (value?: string | null) => {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })
}

const getElapsedDays = (value?: string | null) => {
  if (!value) return 0
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 0
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / DAY_MS))
}

export default function PQRSFDetail() {
  const { id } = useParams<{ id: string }>()
  const { user, isLoading } = useAuth()
  const { isCollapsed } = useSidebar()
  const navigate = useNavigate()
  const [detail, setDetail] = useState<PQRSFDetailItem | null>(null)
  const [analysisList, setAnalysisList] = useState<PQRSFAnalysis[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [responses, setResponses] = useState<ResponseItem[]>([])
  const [analisis, setAnalisis] = useState("")
  const [evidencias, setEvidencias] = useState<File[]>([])
  const [respuestaCliente, setRespuestaCliente] = useState("")
  const [responsibleId, setResponsibleId] = useState<number | null>(null)
  const [responseDocTypeId, setResponseDocTypeId] = useState<number | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const canAdminDecide = detail?.statusId === 3

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/")
    }
  }, [user, isLoading, navigate])

  useEffect(() => {
    if (!user || !id) return

    let active = true
    const loadDetail = async () => {
      setIsLoadingData(true)
      setError(null)
      try {
        let resolvedId = Number(id)
        if (Number.isNaN(resolvedId)) {
          const pqrs = await pqrsfService.getByRadicado(id)
          resolvedId = pqrs.id
        }

        const [detailResponse, analysisResponse, documentsResponse, responsesResponse, typeDocuments] =
          await Promise.all([
            pqrsfService.getDetail(resolvedId),
            pqrsfService.getAnalysis(resolvedId),
            pqrsfService.getDocuments(resolvedId),
            pqrsfService.getResponses(resolvedId),
            catalogService.getTypeDocuments(),
          ])

        if (!active) return
        setDetail(detailResponse)
        setAnalysisList(analysisResponse)
        setDocuments(documentsResponse)
        setResponses(responsesResponse)

        const responseType = typeDocuments.find((item) => item.name.toLowerCase() === "respuesta")
        setResponseDocTypeId(responseType?.id ?? typeDocuments[0]?.id ?? null)

        if (analysisResponse[0]?.answer) {
          setAnalisis(analysisResponse[0].answer ?? "")
        }

        if (user.rol === "Usuario de Área Responsable") {
          const responsable = await areaService.getResponsibleByUser(Number(user.id))
          if (!active) return
          setResponsibleId(responsable.id)
        }
      } catch (err) {
        console.error("[pqrsf-detail] load error", err)
        if (active) {
          setError("No pudimos cargar la PQRSF solicitada.")
          setDetail(null)
        }
      } finally {
        if (active) setIsLoadingData(false)
      }
    }

    void loadDetail()

    return () => {
      active = false
    }
  }, [user, id])

  const timelineItems = useMemo(() => {
    if (!detail) return []
    const items = [
      {
        title: "PQRSF Radicada",
        date: detail.createdAt,
        description: `Solicitud radicada y asignada a ${detail.areaName}.`,
        icon: FileText,
        iconClass: "text-primary",
        bgClass: "bg-primary/10",
      },
    ]

    if (analysisList.length > 0) {
      items.push({
        title: "Análisis registrado",
        date: analysisList[0]?.createdAt ?? detail.updatedAt,
        description: "Análisis técnico registrado por el área.",
        icon: User,
        iconClass: "text-blue-600",
        bgClass: "bg-blue-100",
      })
    }

    if (responses.length > 0) {
      items.push({
        title: "Respuesta enviada",
        date: responses[0]?.sentAt ?? detail.updatedAt,
        description: "Respuesta comunicada al solicitante.",
        icon: CheckCircle2,
        iconClass: "text-green-600",
        bgClass: "bg-green-100",
      })
    }

    return items
  }, [detail, analysisList, responses])

  const handleDownloadDocument = async (documentId: number) => {
    try {
      const response = await pqrsfService.downloadDocument(documentId)
      if (response?.url) {
        window.open(response.url, "_blank", "noopener,noreferrer")
      }
    } catch (err) {
      console.error("[pqrsf-detail] download error", err)
      setError("No pudimos abrir el documento seleccionado.")
    }
  }

  const handleEnviarRespuestaCliente = async () => {
    if (!detail) return
    if (!respuestaCliente.trim()) {
      setError("Por favor ingresa una respuesta para el cliente.")
      return
    }
    if (!responsibleId) {
      setError("No se pudo identificar el responsable del área.")
      return
    }
    if (!responseDocTypeId) {
      setError("No se pudo identificar el tipo de documento de respuesta.")
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      const analysis = analysisList[0]
      if (analysis) {
        await pqrsfService.updateAnalysis(analysis.id, {
          answer: analisis || null,
          actionTaken: analisis || null,
        })
      } else {
        await pqrsfService.createAnalysis({
          pqrsId: detail.id,
          responsibleId,
          answer: analisis || null,
          actionTaken: analisis || null,
        })
      }

      const responseDoc = await pqrsfService.createDocument(detail.id, {
        url: `respuesta://pqrs/${detail.id}/${Date.now()}`,
        typeDocumentId: responseDocTypeId,
        pqrsId: detail.id,
      })

      const createdResponse = await pqrsfService.createResponse(detail.id, {
        content: respuestaCliente.trim(),
        channel: 3,
        documentId: responseDoc.id,
        pqrsId: detail.id,
        responsibleId,
      })

      setResponses((prev) => [createdResponse, ...prev])
      setDocuments((prev) => [responseDoc, ...prev])
      notifySuccess("Respuesta enviada al cliente.")
      navigate("/analisis-pendientes")
    } catch (err) {
      console.error("[pqrsf-detail] submit error", err)
      setError("No pudimos enviar la respuesta. Intenta nuevamente.")
      notifyError("No pudimos enviar la respuesta.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAdminDecision = async (action: "finalize" | "appeal") => {
    if (!detail) return
    setIsSubmitting(true)
    setError(null)
    try {
      if (action === "finalize") {
        await pqrsfService.finalize(detail.id)
        notifySuccess("PQRSF cerrada correctamente.")
      } else {
        await pqrsfService.appeal(detail.id)
        notifySuccess("PQRSF enviada a apelación.")
      }
      const updated = await pqrsfService.getDetail(detail.id)
      setDetail(updated)
    } catch (err) {
      console.error("[pqrsf-detail] admin action error", err)
      setError("No pudimos completar la acción seleccionada.")
      notifyError("No pudimos completar la acción.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!detail && isLoadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Cargando detalle...</p>
        </div>
      </div>
    )
  }

  if (!detail) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No se encontró la PQRSF.</p>
        </div>
      </div>
    )
  }

  if (user.rol === "Usuario de Área Responsable") {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />

        <main
          className={cn(
            "flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-h-screen transition-all duration-300",
            isCollapsed ? "lg:ml-24" : "lg:ml-64"
          )}
        >
          <div className="mb-6">
            <Link to="/analisis-pendientes">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Análisis Pendientes
              </Button>
            </Link>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="border-b bg-muted/30">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-lg font-bold text-primary">{detail.ticketNumber}</span>
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">{detail.typeName}</Badge>
                        <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">{detail.statusName}</Badge>
                      </div>
                      <CardTitle className="text-2xl">{detail.description}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-2">DESCRIPCIÓN DE LA SOLICITUD</h3>
                    <p className="text-foreground leading-relaxed">{detail.description}</p>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-sm text-muted-foreground mb-4">DOCUMENTOS ADJUNTOS</h3>
                    <div className="space-y-2">
                      {documents.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Sin documentos adjuntos.</p>
                      ) : (
                        documents.map((doc) => (
                          <button
                            key={doc.id}
                            type="button"
                            onClick={() => handleDownloadDocument(doc.id)}
                            className="w-full flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                          >
                            <FileText className="h-5 w-5 text-primary" />
                            <div className="flex-1 text-left">
                              <p className="font-medium text-sm">Documento #{doc.id}</p>
                              <p className="text-xs text-muted-foreground">{doc.url}</p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-sm text-muted-foreground mb-4">HISTORIAL DE ACTIVIDAD</h3>
                    <div className="space-y-4">
                      {timelineItems.map((item, index) => (
                        <div key={`${item.title}-${index}`} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`h-10 w-10 rounded-full ${item.bgClass} flex items-center justify-center`}>
                              <item.icon className={`h-5 w-5 ${item.iconClass}`} />
                            </div>
                            {index < timelineItems.length - 1 && <div className="w-px h-full bg-border mt-2" />}
                          </div>
                          <div className="pb-6">
                            <p className="font-semibold">{item.title}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(item.date) || "Sin fecha"}</p>
                            <p className="text-sm mt-1">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary">
                <CardHeader className="bg-primary/5">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    Análisis y Respuesta al Cliente
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">
                    Realiza el análisis técnico y redacta la respuesta que será enviada directamente al solicitante.
                  </p>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="analisis" className="text-base font-semibold">
                      Análisis Técnico Interno (Opcional)
                    </Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Documenta tu análisis técnico, antecedentes normativos y consideraciones internas.
                    </p>
                    <Textarea
                      id="analisis"
                      placeholder="Describe tu análisis técnico..."
                      className="min-h-37.5"
                      value={analisis}
                      onChange={(e) => setAnalisis(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2 border-t pt-6">
                    <Label htmlFor="respuestaCliente" className="text-base font-semibold text-primary">
                      Respuesta al Cliente *
                    </Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Redacta la respuesta oficial que será enviada directamente al solicitante.
                    </p>
                    <Textarea
                      id="respuestaCliente"
                      placeholder="Ejemplo: Estimado(a) solicitante..."
                      className="min-h-50 border-2 border-primary/30"
                      value={respuestaCliente}
                      onChange={(e) => setRespuestaCliente(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="evidencias" className="text-base font-semibold">
                      Adjuntar Evidencias (Opcional)
                    </Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Adjunta documentos o archivos que soporten tu respuesta.
                    </p>
                    <label className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-accent/50 cursor-pointer transition-colors block">
                      <Paperclip className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-medium mb-1">Click para adjuntar archivos</p>
                      <p className="text-xs text-muted-foreground">PDF, DOC, IMG hasta 10MB</p>
                      <input
                        id="evidencias"
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(event) => setEvidencias(Array.from(event.target.files ?? []))}
                      />
                    </label>
                    {evidencias.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {evidencias.map((file) => file.name).join(", ")}
                      </div>
                    )}
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-green-500 rounded-lg p-2 shrink-0">
                        <Send className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-foreground mb-1">Envío Directo al Cliente</p>
                        <p className="text-xs text-muted-foreground">
                          Al confirmar el envío, la respuesta será comunicada automáticamente al solicitante.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={handleEnviarRespuestaCliente}
                      disabled={!respuestaCliente.trim() || isSubmitting}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {isSubmitting ? "Enviando..." : "Enviar Respuesta al Cliente"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información del Solicitante</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b">
                    <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{detail.clientName || "Sin nombre"}</p>
                      <p className="text-sm text-muted-foreground">{detail.stakeholderName || "Sin rol"}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Documento</p>
                        <p className="font-medium">{detail.clientDocument || "N/A"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Fecha de radicación</p>
                        <p className="font-medium">{formatDate(detail.createdAt)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Área asignada</p>
                        <p className="font-medium">{detail.areaName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Tiempo transcurrido</p>
                        <p className="font-medium text-orange-600">{getElapsedDays(detail.createdAt)} días</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información Adicional</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Tipo de usuario</p>
                    <Badge variant="outline">{detail.typePersonName || "Sin definir"}</Badge>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Estado</p>
                    <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">{detail.statusName}</Badge>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Canal de recepción</p>
                    <p className="text-sm font-medium">Web / Chatbot</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Radicado</p>
                    <p className="text-sm font-mono font-semibold">{detail.ticketNumber}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50/50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-500 rounded-lg p-2">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground mb-1">Plazo de Respuesta</p>
                      <p className="text-xs text-muted-foreground">
                        Esta solicitud debe ser respondida antes del {formatDate(detail.dueDate) || "por definir"}.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main
        className={cn(
          "flex-1 p-8 overflow-y-auto min-h-screen transition-all duration-300",
          isCollapsed ? "lg:ml-24" : "lg:ml-64"
        )}
      >
        <div className="mb-6">
          <Link to="/pqrsf">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al listado
            </Button>
          </Link>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="border-b bg-muted/30">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-lg font-bold text-primary">{detail.ticketNumber}</span>
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">{detail.typeName}</Badge>
                    <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">{detail.statusName}</Badge>
                  </div>
                  <CardTitle className="text-2xl">{detail.description}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-foreground">{detail.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Decisión Administrativa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!canAdminDecide && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
                    Esta acción solo está disponible cuando la PQRSF está en reanálisis.
                  </div>
                )}
                <Textarea
                  placeholder="Comentarios o soporte de la decisión..."
                  className="min-h-30"
                  value={analisis}
                  onChange={(e) => setAnalisis(e.target.value)}
                />
                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleAdminDecision("finalize")}
                    disabled={isSubmitting || !canAdminDecide}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Aprobar y Cerrar
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => handleAdminDecision("appeal")}
                    disabled={isSubmitting || !canAdminDecide}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Enviar a Reanálisis
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información del Solicitante</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium">{detail.clientName || "Sin nombre"}</p>
                <p className="text-xs text-muted-foreground">{detail.clientEmail || "Sin correo"}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
