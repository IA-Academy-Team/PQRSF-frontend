import { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { surveyService } from "@/services/survey.service"
import type { CreatePublicSurvey, SurveyPublicInfo } from "@/types/database"
import { HttpError } from "@/lib/api"
import { notifyError, notifySuccess } from "@/lib/toast"

const QUESTION_LABELS = [
  {
    key: "q1Clarity",
    title: "Claridad del proceso",
    text: "¿Qué tan clara te pareció la información proporcionada sobre el proceso de radicación y seguimiento de tu PQRSF?",
  },
  {
    key: "q2Timeliness",
    title: "Tiempo de respuesta",
    text: "¿Qué tan satisfecho(a) estás con el tiempo en que fue atendida y respondida tu PQRSF?",
  },
  {
    key: "q3Quality",
    title: "Calidad de la respuesta",
    text: "¿Qué tan útil y completa consideras la respuesta que recibiste a tu solicitud?",
  },
  {
    key: "q4Attention",
    title: "Trato y atención recibida",
    text: "¿Cómo calificarías la atención, respeto y disposición mostrada durante la gestión de tu PQRSF?",
  },
  {
    key: "q5Overall",
    title: "Satisfacción general",
    text: "En general, ¿qué tan satisfecho(a) estás con el proceso completo de gestión de tu PQRSF?",
  },
] as const

type QuestionKey = (typeof QUESTION_LABELS)[number]["key"]

const emptyForm: CreatePublicSurvey = {
  q1Clarity: undefined,
  q2Timeliness: undefined,
  q3Quality: undefined,
  q4Attention: undefined,
  q5Overall: undefined,
  comment: "",
}

export default function Survey() {
  const { ticketNumber } = useParams()
  const [info, setInfo] = useState<SurveyPublicInfo | null>(null)
  const [form, setForm] = useState<CreatePublicSurvey>(emptyForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    let active = true
    const loadSurvey = async () => {
      if (!ticketNumber) {
        setError("No se encontro el numero de radicado.")
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError("")
      try {
        const data = await surveyService.getPublic(ticketNumber)
        if (!active) return
        setInfo(data)
      } catch (err) {
        if (!active) return
        if (err instanceof HttpError) {
          const code = err.data?.error?.code ?? err.data?.code
          if (err.status === 404) {
            setError("No encontramos una PQRS con ese radicado.")
          } else if (code === "SURVEY_ALREADY_SUBMITTED") {
            setError("Esta encuesta ya fue respondida. Gracias por tu tiempo.")
          } else if (code === "SURVEY_NOT_AVAILABLE") {
            setError("La encuesta aun no esta disponible para este radicado.")
          } else {
            setError(err.message || "No se pudo cargar la encuesta.")
          }
        } else {
          setError("No se pudo cargar la encuesta.")
        }
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void loadSurvey()
    return () => {
      active = false
    }
  }, [ticketNumber])

  const handleScoreChange = (key: QuestionKey, value: string) => {
    const parsed = Number(value)
    setForm((prev) => ({ ...prev, [key]: Number.isFinite(parsed) ? parsed : undefined }))
  }

  const isComplete = useMemo(() => {
    return QUESTION_LABELS.every((question) => {
      const value = form[question.key]
      return typeof value === "number" && value >= 1 && value <= 5
    })
  }, [form])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!ticketNumber || !isComplete) return
    setIsSubmitting(true)
    setError("")
    try {
      await surveyService.submitPublic(ticketNumber, {
        ...form,
        comment: form.comment?.trim() ? form.comment?.trim() : null,
      })
      setSuccess("Gracias por responder la encuesta. Tu opinion es muy valiosa para nosotros.")
      notifySuccess("Encuesta enviada correctamente.")
    } catch (err) {
      if (err instanceof HttpError) {
        const code = err.data?.error?.code ?? err.data?.code
        if (code === "SURVEY_ALREADY_SUBMITTED") {
          setError("Esta encuesta ya fue respondida.")
        } else if (code === "SURVEY_NOT_AVAILABLE") {
          setError("La encuesta aun no esta disponible para este radicado.")
        } else {
          setError(err.message || "No se pudo enviar la encuesta.")
        }
      } else {
        setError("No se pudo enviar la encuesta.")
      }
      notifyError("No se pudo enviar la encuesta.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-3xl border border-border shadow-md">
        <CardContent className="p-6 sm:p-8 space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Encuesta PQRSF</h1>
            <p className="text-sm text-muted-foreground">
              Califica cada afirmacion en una escala de 1 a 5.
            </p>
          </div>

          {isLoading && (
            <div className="rounded-lg border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              Cargando encuesta...
            </div>
          )}

          {!isLoading && error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
          )}

          {!isLoading && success && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              {success}
            </div>
          )}

          {!isLoading && info && !success && !error && (
            <>
              <div className="rounded-lg border border-border bg-muted/20 p-4 text-sm">
                <p className="text-muted-foreground">
                  Radicado: <span className="font-medium text-foreground">{info.pqrs.ticketNumber}</span>
                </p>
                <p className="text-muted-foreground">
                  Tipo: <span className="font-medium text-foreground">{info.pqrs.typeName || "PQRSF"}</span>
                </p>
                <p className="text-muted-foreground">
                  Area: <span className="font-medium text-foreground">{info.pqrs.areaName || "Campuslands"}</span>
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {QUESTION_LABELS.map((question) => (
                  <div key={question.key} className="space-y-3">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">{question.title}</p>
                      <p className="text-sm text-muted-foreground">{question.text}</p>
                    </div>
                    <RadioGroup
                      value={form[question.key] ? String(form[question.key]) : ""}
                      onValueChange={(value) => handleScoreChange(question.key, value)}
                      className="grid grid-cols-5 gap-3"
                    >
                      {[1, 2, 3, 4, 5].map((score) => (
                        <label
                          key={`${question.key}-${score}`}
                          className="flex flex-col items-center gap-2 rounded-lg border border-border p-2 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
                        >
                          <RadioGroupItem value={String(score)} />
                          <span className="font-medium">{score}</span>
                        </label>
                      ))}
                    </RadioGroup>
                  </div>
                ))}

                <div className="space-y-2">
                  <Label htmlFor="comment">Comentario adicional (opcional)</Label>
                  <Textarea
                    id="comment"
                    value={form.comment ?? ""}
                    onChange={(event) => setForm((prev) => ({ ...prev, comment: event.target.value }))}
                    placeholder="Cuentanos tu experiencia..."
                    className="min-h-[120px]"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={!isComplete || isSubmitting}>
                  {isSubmitting ? "Enviando encuesta..." : "Enviar encuesta"}
                </Button>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
