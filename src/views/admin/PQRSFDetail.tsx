import {
  ArrowLeft,
  User,
  Calendar,
  Building2,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
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
  type PQRSFStatusHistory,
} from "@/services/pqrsf.service"

import type {
  Document,
  Response as ResponseItem,
  PQRSFAnalysis,
  PQRSFReanalysis,
  TypeDocument,
} from "@/types/database"
import { notifyError, notifySuccess } from "@/lib/toast"

const DAY_MS = 1000 * 60 * 60 * 24

const formatDate = (value?: string | null) => {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })
}

const formatDateTime = (value?: string | null) => {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleString("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).replace(" a las ", ", ")
}

const getElapsedDays = (value?: string | null) => {
  if (!value) return 0
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 0
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / DAY_MS))
}

const isAnonymousPerson = (typePersonName?: string | null) => {
  if (!typePersonName) return false
  const normalized = typePersonName.toLowerCase()
  return normalized.includes("anónimo") || normalized.includes("anonimo")
}

const resolveDocumentOwner = (typeName?: string | null) => {
  if (!typeName) return "Cliente"
  const normalized = typeName.toLowerCase()
  if (normalized === "solicitud" || normalized === "evidencia") return "Cliente"
  return "Responsable"
}

export default function PQRSFDetail() {
  const { id } = useParams<{ id: string }>()
  const { user, isLoading } = useAuth()
  const { isCollapsed } = useSidebar()
  const navigate = useNavigate()
  const [detail, setDetail] = useState<PQRSFDetailItem | null>(null)
  const [analysisList, setAnalysisList] = useState<PQRSFAnalysis[]>([])
  const [reanalysis, setReanalysis] = useState<PQRSFReanalysis | null>(null)
  const [reanalysisHistory, setReanalysisHistory] = useState<PQRSFReanalysis[]>([])
  const [statusHistory, setStatusHistory] = useState<PQRSFStatusHistory[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [responses, setResponses] = useState<ResponseItem[]>([])
  const [analisis, setAnalisis] = useState("")
  const [respuesta, setRespuesta] = useState("")
  const [evidencias, setEvidencias] = useState<File[]>([])
  const [respuestaCliente, setRespuestaCliente] = useState("")
  const [responsibleId, setResponsibleId] = useState<number | null>(null)
  const [responseDocTypeId, setResponseDocTypeId] = useState<number | null>(null)
  const [typeDocuments, setTypeDocuments] = useState<TypeDocument[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
        setTypeDocuments(typeDocuments)

        try {
          const [reanalysisResponse, reanalysisHistoryResponse] = await Promise.all([
            pqrsfService.getReanalysis(resolvedId),
            pqrsfService.getReanalysisHistory(resolvedId),
          ])
          if (!active) return
          setReanalysis(reanalysisResponse)
          setReanalysisHistory(reanalysisHistoryResponse ?? [])
        } catch {
          if (!active) return
          setReanalysis(null)
          setReanalysisHistory([])
        }

        try {
          const statusHistoryResponse = await pqrsfService.getStatusHistory(resolvedId)
          if (!active) return
          setStatusHistory(statusHistoryResponse ?? [])
        } catch {
          if (!active) return
          setStatusHistory([])
        }

        const responseType = typeDocuments.find((item) => item.name.toLowerCase() === "análisis")
        setResponseDocTypeId(responseType?.id ?? typeDocuments[0]?.id ?? null)

        const latestAnalysis = analysisResponse[analysisResponse.length - 1]
        if (latestAnalysis?.answer) {
          setAnalisis(latestAnalysis.answer ?? "")
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

  useEffect(() => {
    if (responses.length > 0) {
      setRespuesta(responses[0]?.content ?? "")
    } else {
      setRespuesta("")
    }
  }, [responses])

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
      const lastAnalysis = analysisList[analysisList.length - 1]
      items.push({
        title: "Análisis registrado",
        date: lastAnalysis?.createdAt ?? detail.updatedAt,
        description: "Análisis técnico registrado por el área.",
        icon: User,
        iconClass: "text-blue-600",
        bgClass: "bg-blue-100",
      })
    }

    if (responses.length > 0) {
      const lastResponse = responses[responses.length - 1]
      items.push({
        title: "Respuesta enviada",
        date: lastResponse?.sentAt ?? detail.updatedAt,
        description: "Respuesta comunicada al solicitante.",
        icon: CheckCircle2,
        iconClass: "text-green-600",
        bgClass: "bg-green-100",
      })
    }

    if (statusHistory.length > 0) {
      statusHistory.forEach((entry) => {
        if (entry.statusId === 3) {
          items.push({
            title: "En reanálisis",
            date: entry.createdAt ?? detail.updatedAt ?? detail.createdAt,
            description: "La PQRSF fue enviada a reanálisis.",
            icon: AlertCircle,
            iconClass: "text-yellow-700",
            bgClass: "bg-yellow-100",
          })
        }
        if (entry.statusId === 5) {
          items.push({
            title: "Devuelto",
            date: entry.createdAt ?? detail.updatedAt ?? detail.createdAt,
            description: "El administrador devolvió la PQRSF al área responsable.",
            icon: AlertCircle,
            iconClass: "text-orange-700",
            bgClass: "bg-orange-100",
          })
        }
        if (entry.statusId === 4) {
          items.push({
            title: "PQRSF cerrada",
            date: entry.createdAt ?? detail.updatedAt ?? detail.createdAt,
            description: "La solicitud fue aprobada y cerrada.",
            icon: CheckCircle2,
            iconClass: "text-emerald-700",
            bgClass: "bg-emerald-100",
          })
        }
      })
    } else if (detail.statusId === 3) {
      items.push({
        title: "En reanálisis",
        date: detail.updatedAt ?? detail.createdAt,
        description: "La PQRSF fue enviada a reanálisis.",
        icon: AlertCircle,
        iconClass: "text-yellow-700",
        bgClass: "bg-yellow-100",
      })
    } else if (detail.statusId === 5) {
      items.push({
        title: "Devuelto",
        date: detail.updatedAt ?? detail.createdAt,
        description: "El administrador devolvió la PQRSF al área responsable.",
        icon: AlertCircle,
        iconClass: "text-orange-700",
        bgClass: "bg-orange-100",
      })
    } else if (detail.statusId === 4) {
      items.push({
        title: "PQRSF cerrada",
        date: detail.updatedAt ?? detail.createdAt,
        description: "La solicitud fue aprobada y cerrada.",
        icon: CheckCircle2,
        iconClass: "text-emerald-700",
        bgClass: "bg-emerald-100",
      })
    }

    return items
  }, [detail, analysisList, responses, reanalysisHistory, statusHistory])

  const reanalysisCutoff = useMemo(() => {
    if (!reanalysis?.createdAt) return null
    const date = new Date(reanalysis.createdAt)
    return Number.isNaN(date.getTime()) ? null : date
  }, [reanalysis])

  const analysisListForDisplay = useMemo(() => analysisList, [analysisList])

  const getAnalysisStage = (createdAt?: string | null) => {
    if (!createdAt) return "Análisis"
    if (!reanalysisCutoff) return "Análisis"
    const created = new Date(createdAt)
    if (Number.isNaN(created.getTime())) return "Análisis"
    return created.getTime() >= reanalysisCutoff.getTime() ? "Reanálisis" : "Análisis"
  }

  const hasAnalysisAfterCutoff = useMemo(() => {
    if (!reanalysisCutoff) return false
    return analysisListForDisplay.some((item) => {
      if (!item.createdAt) return false
      const created = new Date(item.createdAt)
      if (Number.isNaN(created.getTime())) return false
      return created.getTime() >= reanalysisCutoff.getTime()
    })
  }, [analysisListForDisplay, reanalysisCutoff])

  const responseDeadline = useMemo(() => {
    if (detail?.dueDate) return detail.dueDate
    if (!detail?.createdAt) return null
    const created = new Date(detail.createdAt)
    if (Number.isNaN(created.getTime())) return null
    created.setDate(created.getDate() + 15)
    return created.toISOString()
  }, [detail?.dueDate, detail?.createdAt])

  const getResponseStage = (sentAt?: string | null) => {
    if (!sentAt) return "Análisis"
    if (!reanalysisCutoff) return "Análisis"
    const sent = new Date(sentAt)
    if (Number.isNaN(sent.getTime())) return "Análisis"
    return sent.getTime() >= reanalysisCutoff.getTime() ? "Reanálisis" : "Análisis"
  }

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
    if (evidencias.length > 0 && !responseDocTypeId) {
      setError("No se pudo identificar el tipo de documento de respuesta.")
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      const latestAnalysis = analysisList[analysisList.length - 1] ?? null
      let analysis = latestAnalysis
      let createdAnalysis: PQRSFAnalysis | null = null
      if (detail.statusId === 3 || detail.statusId === 5) {
        createdAnalysis = await pqrsfService.createAnalysis({
          pqrsId: detail.id,
          responsibleId,
          answer: analisis || null,
          actionTaken: analisis || null,
        })
        analysis = createdAnalysis
      } else if (analysis) {
        analysis = await pqrsfService.updateAnalysis(analysis.id, {
          answer: analisis || null,
          actionTaken: analisis || null,
        })
      } else {
        createdAnalysis = await pqrsfService.createAnalysis({
          pqrsId: detail.id,
          responsibleId,
          answer: analisis || null,
          actionTaken: analisis || null,
        })
        analysis = createdAnalysis
      }

      if (detail.statusId === 3 && analysis) {
        try {
          const existingReanalysis = await pqrsfService.getReanalysis(detail.id)
          if (existingReanalysis?.id) {
            await pqrsfService.updateReanalysis(existingReanalysis.id, {
              answer: analisis || null,
              actionTaken: analisis || null,
              analysisId: analysis.id,
            })
          }
        } catch {
          await pqrsfService.createReanalysis({
            analysisId: analysis.id,
            responsibleId,
            answer: analisis || null,
            actionTaken: analisis || null,
          })
        }
      }

      let uploadedDocs: Document[] = []
      if (evidencias.length > 0 && responseDocTypeId) {
        uploadedDocs = await pqrsfService.uploadDocuments(detail.id, evidencias, responseDocTypeId)
      }

      const responsePayload = {
        content: respuestaCliente.trim(),
        channel: 3,
        pqrsId: detail.id,
        responsibleId,
        ...(uploadedDocs[0]?.id ? { documentId: uploadedDocs[0].id } : {}),
      }
      const createdResponse = await pqrsfService.createResponse(detail.id, responsePayload)

      try {
        await pqrsfService.getBotResponse(detail.id)
      } catch (err) {
        console.warn("[pqrsf-detail] bot-response error", err)
      }

      setResponses((prev) => [createdResponse, ...prev])
      setRespuesta(createdResponse.content ?? "")
      setRespuestaCliente("")
      if (uploadedDocs.length > 0) {
        setDocuments((prev) => [...uploadedDocs, ...prev])
      }
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
        navigate("/pqrsf?tab=cerradas")
      } else {
        await pqrsfService.appeal(detail.id)
        notifySuccess("PQRSF enviada a apelación.")
        navigate("/pqrsf?tab=apelacion")
      }
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

  const normalizedReanalysisAnswer = (reanalysis?.answer ?? "").trim().toLowerCase()
  const normalizedReanalysisAction = (reanalysis?.actionTaken ?? "").trim().toLowerCase()
  const shouldShowReanalysisAction =
    normalizedReanalysisAction.length > 0 && normalizedReanalysisAction !== normalizedReanalysisAnswer

  if (user.rol === "Usuario de Área Responsable") {
    const showAnonymous = isAnonymousPerson(detail.typePersonName)
    const displayClientName = showAnonymous ? "Anónimo" : detail.clientName || "Sin nombre"
    const displayStakeholder = showAnonymous ? "Anónimo" : detail.stakeholderName || "Sin rol"
    const isClosed = detail.statusId === 4
    const isReanalysis = detail.statusId === 3 || detail.statusId === 5
    const isReturned = detail.statusId === 5
    const hasResponse = responses.length > 0
    const hasReanalysisResponse = isReanalysis
      ? responses.some((item) => getResponseStage(item.sentAt) === "Reanálisis")
      : false
    const latestResponseAt = responses.length > 0 ? responses[responses.length - 1]?.sentAt : null
    const detailUpdatedAt = detail.updatedAt ? new Date(detail.updatedAt) : null
    const effectiveReanalysisCutoff = reanalysis
      ? (() => {
          if (reanalysisCutoff && detailUpdatedAt) {
            return reanalysisCutoff.getTime() >= detailUpdatedAt.getTime() ? reanalysisCutoff : detailUpdatedAt
          }
          return reanalysisCutoff ?? detailUpdatedAt
        })()
      : null
    const canRespond = !isClosed && (isReanalysis || !hasResponse)

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
                    <h3 className="font-semibold text-sm text-muted-foreground mb-4">DOCUMENTOS ADJUNTOS</h3>
                    <div className="space-y-2">
                      {documents.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Sin documentos adjuntos.</p>
                      ) : (
                        documents.map((doc) => {
                          const typeName = typeDocuments.find((item) => item.id === doc.typeDocumentId)?.name ?? "Documento"
                          const owner = resolveDocumentOwner(typeName)
                          return (
                            <button
                              key={doc.id}
                              type="button"
                              onClick={() => handleDownloadDocument(doc.id)}
                              className="w-full flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                            >
                              <FileText className="h-5 w-5 text-primary" />
                              <div className="flex-1 text-left">
                                <p className="font-medium text-sm">Documento #{doc.id}</p>
                                <p className="text-xs text-muted-foreground">{typeName} • {owner}</p>
                                <p className="text-xs text-muted-foreground">{doc.url}</p>
                              </div>
                            </button>
                          )
                        })
                      )}
                    </div>
                  </div>

                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Historial de analisis de responsable</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-2">Analisis tecnico</h3>
                    {analysisListForDisplay.length === 0 ? (
                      <p className="text-foreground leading-relaxed">Sin análisis registrado.</p>
                    ) : (
                      <div className="space-y-3">
                        {analysisListForDisplay.map((item, index) => (
                          <div key={`analysis-${item.id}-${index}`} className="rounded-lg border p-3 bg-muted/20">
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                              <span>{formatDate(item.createdAt) || "Sin fecha"}</span>
                              <span
                                className={
                                  getAnalysisStage(item.createdAt) === "Reanálisis"
                                    ? "px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700"
                                    : "px-2 py-0.5 rounded-full bg-blue-100 text-blue-700"
                                }
                              >
                                {getAnalysisStage(item.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-foreground">{item.answer || "Sin análisis"}</p>
                          </div>
                        ))}
                        {reanalysis && !hasAnalysisAfterCutoff && (
                          <div className="rounded-lg border p-3 bg-yellow-50">
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                              <span>{formatDate(reanalysis.createdAt) || "Sin fecha"}</span>
                              <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">Reanálisis</span>
                            </div>
                            <p className="text-sm text-foreground">{reanalysis.answer || "Sin análisis"}</p>
                            {shouldShowReanalysisAction ? (
                              <p className="text-sm text-foreground">{reanalysis.actionTaken}</p>
                            ) : null}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-2">Respuesta al cliente</h3>
                    {responses.length === 0 ? (
                      <p className="text-muted-foreground leading-relaxed">Sin respuesta registrada.</p>
                    ) : (
                      <div className="space-y-3">
                        {responses.map((item, index) => (
                          <div key={`respuesta-area-${item.id}-${index}`} className="rounded-lg border p-3">
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                              <span>{formatDate(item.sentAt) || "Sin fecha"}</span>
                              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                                {getResponseStage(item.sentAt)}
                              </span>
                            </div>
                            <p className="text-foreground leading-relaxed">{item.content || "Sin contenido"}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {detail.appeal && detail.appeal.trim().length > 0 ? (
                <Card className="border-amber-200 bg-amber-50/60">
                  <CardHeader className="flex flex-row items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    <CardTitle>Apelación del Cliente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground leading-relaxed">{detail.appeal}</p>
                  </CardContent>
                </Card>
              ) : null}

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
                  {!canRespond ? (
                    <>
                      {responses.length > 0 ? (
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-muted-foreground">Historial de respuestas</h4>
                          <div className="space-y-3">
                            {responses.map((item, index) => (
                              <div key={`historial-${item.id}-${index}`} className="rounded-lg border p-3 bg-muted/30">
                                <div className="text-xs text-muted-foreground mb-1">
                                  {formatDate(item.sentAt) || "Sin fecha"}
                                </div>
                                <p className="text-sm text-foreground">{item.content || "Sin contenido"}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-xs text-yellow-700">
                      {isClosed
                        ? "Esta PQRSF ya fue cerrada. Solo puedes visualizar la información."
                        : isReanalysis
                          ? "Ya enviaste la respuesta en reanálisis. Debes esperar a que el administrador autorice nuevamente."
                          : "Ya se envió una respuesta. Solo podrás responder nuevamente si la PQRSF entra en reanálisis."}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
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
                      <p className="font-semibold text-foreground">{displayClientName}</p>
                      <p className="text-sm text-muted-foreground">{displayStakeholder}</p>
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
                        Esta solicitud debe ser respondida antes del {formatDate(responseDeadline) || "por definir"}.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Historial de actividad</CardTitle>
                </CardHeader>
                <CardContent>
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
                          <p className="text-sm text-muted-foreground">{formatDateTime(item.date) || "Sin fecha"}</p>
                          <p className="text-sm mt-1">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const showAnonymous = isAnonymousPerson(detail.typePersonName)
  const displayClientName = showAnonymous ? "Anónimo" : detail.clientName || "Sin nombre"
  const displayStakeholder = showAnonymous ? "Anónimo" : detail.stakeholderName || "Sin rol"
  const isClosed = detail.statusId === 4
  const hasInitialResponse = responses.length > 0

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
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-4">DOCUMENTOS ADJUNTOS</h3>
                  <div className="space-y-2">
                    {documents.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Sin documentos adjuntos.</p>
                    ) : (
                      documents.map((doc) => (
                        (() => {
                          const typeName = typeDocuments.find((item) => item.id === doc.typeDocumentId)?.name ?? "Documento"
                          const owner = resolveDocumentOwner(typeName)
                          return (
                        <button
                          key={doc.id}
                          type="button"
                          onClick={() => handleDownloadDocument(doc.id)}
                          className="w-full flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <FileText className="h-5 w-5 text-primary" />
                          <div className="flex-1 text-left">
                            <p className="font-medium text-sm">Documento #{doc.id}</p>
                            <p className="text-xs text-muted-foreground">{typeName} • {owner}</p>
                            <p className="text-xs text-muted-foreground">{doc.url}</p>
                          </div>
                        </button>
                          )
                        })()
                      ))
                    )}
                  </div>
                </div>

              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Analisis de responsable</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-2">Analisis tecnico</h3>
                  {analysisListForDisplay.length === 0 && !reanalysis ? (
                    <p className="text-foreground leading-relaxed">Sin análisis registrado.</p>
                  ) : (
                    <div className="space-y-3">
                      {analysisListForDisplay.map((item, index) => (
                        <div key={`analysis-admin-${item.id}-${index}`} className="rounded-lg border p-3 bg-muted/20">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span>{formatDate(item.createdAt) || "Sin fecha"}</span>
                            <span
                              className={
                                getAnalysisStage(item.createdAt) === "Reanálisis"
                                  ? "px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700"
                                  : "px-2 py-0.5 rounded-full bg-blue-100 text-blue-700"
                              }
                            >
                              {getAnalysisStage(item.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-foreground">{item.answer || "Sin análisis"}</p>
                        </div>
                      ))}
                      {reanalysis && !hasAnalysisAfterCutoff && (
                        <div className="rounded-lg border p-3 bg-yellow-50">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span>{formatDate(reanalysis.createdAt) || "Sin fecha"}</span>
                            <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">Reanálisis</span>
                          </div>
                          <p className="text-sm text-foreground">{reanalysis.answer || "Sin análisis"}</p>
                          {shouldShowReanalysisAction ? (
                            <p className="text-sm text-foreground">{reanalysis.actionTaken}</p>
                          ) : null}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-2">Respuesta al cliente</h3>
                  {responses.length === 0 ? (
                    <p className="text-muted-foreground leading-relaxed">Sin respuesta registrada.</p>
                  ) : (
                    <div className="space-y-3">
                      {responses.map((item, index) => (
                        <div key={`respuesta-${item.id}-${index}`} className="rounded-lg border p-3">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span>{formatDate(item.sentAt) || "Sin fecha"}</span>
                            <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                              {getResponseStage(item.sentAt)}
                            </span>
                          </div>
                          <p className="text-foreground leading-relaxed">{item.content || "Sin contenido"}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            {detail.appeal && detail.appeal.trim().length > 0 ? (
              <Card className="border-amber-200 bg-amber-50/60">
                <CardHeader className="flex flex-row items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  <CardTitle>Apelación del Cliente</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground leading-relaxed">{detail.appeal}</p>
                </CardContent>
              </Card>
            ) : null}

            <Card>
              <CardHeader>
                <CardTitle>Decisión Administrativa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleAdminDecision("finalize")}
                    disabled={isSubmitting || isClosed || !hasInitialResponse}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Aprobar y Cerrar
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => handleAdminDecision("appeal")}
                    disabled={isSubmitting || isClosed || !hasInitialResponse}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Enviar a Reanálisis
                  </Button>
                </div>
                {!hasInitialResponse && (
                  <p className="text-xs text-muted-foreground">
                    El administrador solo puede actuar cuando el responsable haya enviado la primera respuesta.
                  </p>
                )}
                {isClosed && (
                  <p className="text-xs text-muted-foreground">
                    Esta PQRSF ya fue cerrada. Solo puedes visualizar la información.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información del Solicitante</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{displayClientName}</p>
                    <p className="text-xs text-muted-foreground">{displayStakeholder}</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Documento</p>
                    <p className="font-medium">{detail.clientDocument || "Sin documento"}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Fecha de radicación</p>
                    <p className="font-medium">{formatDate(detail.createdAt) || "Sin fecha"}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Área asignada</p>
                    <p className="font-medium">{detail.areaName}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Tiempo transcurrido</p>
                    <p className="font-medium text-orange-600">{getElapsedDays(detail.createdAt)} días</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Historial de actividad</CardTitle>
              </CardHeader>
              <CardContent>
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
                        <p className="text-sm text-muted-foreground">{formatDateTime(item.date) || "Sin fecha"}</p>
                        <p className="text-sm mt-1">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
