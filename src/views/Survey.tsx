import { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Star, ChevronLeft, ChevronRight } from "lucide-react"
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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Generar partículas de forma estable
  const particles = useMemo(() => {
    return Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      left: Math.random() * 120,
      top: Math.random() * 100,
      delay: Math.random() * 15,
      duration: 12 + Math.random() * 8,
    }))
  }, [])

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

  const handleScoreChange = (key: QuestionKey, value: number) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    
    // Avanzar automáticamente a la siguiente pregunta después de un breve delay
    const currentIndex = QUESTION_LABELS.findIndex((q) => q.key === key)
    if (currentIndex < QUESTION_LABELS.length - 1) {
      // Avanzar a la siguiente pregunta
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentQuestionIndex(currentIndex + 1)
        setIsTransitioning(false)
      }, 500) // Delay para permitir que el usuario vea su selección
    } else {
      // Si es la última pregunta, avanzar al paso de comentarios
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentQuestionIndex(QUESTION_LABELS.length)
        setIsTransitioning(false)
      }, 500)
    }
  }

  const progress = useMemo(() => {
    const answered = QUESTION_LABELS.filter((question) => {
      const value = form[question.key]
      return typeof value === "number" && value >= 1 && value <= 5
    }).length
    return Math.round((answered / QUESTION_LABELS.length) * 100)
  }, [form])

  const showComments = currentQuestionIndex >= QUESTION_LABELS.length

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev - 1)
        setIsTransitioning(false)
      }, 300)
    }
  }

  const handleNext = () => {
    if (currentQuestionIndex < QUESTION_LABELS.length - 1) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev + 1)
        setIsTransitioning(false)
      }, 300)
    } else if (currentQuestionIndex === QUESTION_LABELS.length - 1) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev + 1)
        setIsTransitioning(false)
      }, 300)
    }
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
    <div className="relative min-h-screen bg-background flex items-center justify-center px-4 py-[30px] overflow-hidden">
      {/* Particles Background */}
      <div className="particles-container absolute inset-0 w-full h-full">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Contenedor central fijo */}
      <Card className="relative z-10 w-full max-w-xl border border-border/50 shadow-[0_20px_60px_rgba(0,0,0,0.25),0_8px_30px_rgba(0,0,0,0.15)] rounded-xl bg-card/95 backdrop-blur-md flex flex-col">
        <CardHeader className="text-center pb-3 pt-4 shrink-0">
          <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">Encuesta PQRSF</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Tu opinión es muy importante para nosotros
          </p>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-3 flex flex-col">
          {isLoading && (
            <div className="rounded-lg border border-dashed border-border bg-muted/40 p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando encuesta...</p>
            </div>
          )}

          {!isLoading && error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 text-center">
              {error}
            </div>
          )}

          {!isLoading && success && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-center">
              <p className="text-emerald-700 font-medium">{success}</p>
            </div>
          )}

          {!isLoading && info && !success && !error && (
            <div className="flex flex-col">
              <div className="rounded-lg border border-border bg-muted/20 p-2 sm:p-3 text-xs mb-3 shrink-0">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <p className="text-muted-foreground truncate">
                    Radicado: <span className="font-medium text-foreground">{info.pqrs.ticketNumber}</span>
                  </p>
                  <p className="text-muted-foreground truncate">
                    Tipo: <span className="font-medium text-foreground">{info.pqrs.typeName || "PQRSF"}</span>
                  </p>
                  <p className="text-muted-foreground truncate">
                    Área: <span className="font-medium text-foreground">{info.pqrs.areaName || "Campuslands"}</span>
                  </p>
                </div>
              </div>

              {/* Barra de progreso y navegación */}
              <div className="mb-4 shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {showComments
                      ? "Paso final"
                      : `Pregunta ${currentQuestionIndex + 1} de ${QUESTION_LABELS.length}`}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground">{progress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden shadow-inner">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-700 ease-out shadow-sm"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                {/* Botones de navegación - solo en preguntas */}
                {!showComments && currentQuestionIndex > 0 && (
                  <div className="flex items-center justify-center mt-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handlePrevious}
                      disabled={currentQuestionIndex === 0 || isSubmitting || isTransitioning}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground h-7 px-2"
                    >
                      <ChevronLeft className="h-3 w-3" />
                      Anterior
                    </Button>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="relative flex flex-col">
                {/* Contenedor del carrusel centrado verticalmente */}
                <div className="relative overflow-hidden min-h-[400px] flex items-center justify-center py-4">
                  {/* Preguntas */}
                  {QUESTION_LABELS.map((question, index) => {
                    const isActive = index === currentQuestionIndex
                    const isPrev = index < currentQuestionIndex

                    return (
                      <div
                        key={question.key}
                        className={`absolute inset-0 transition-all duration-600 ease-in-out ${
                          isActive
                            ? "opacity-100 translate-x-0 z-10 scale-100"
                            : isPrev
                            ? "opacity-0 -translate-x-full z-0 scale-95"
                            : "opacity-0 translate-x-full z-0 scale-95"
                        } ${isTransitioning ? "pointer-events-none" : ""}`}
                        style={{
                          transition: "opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                      >
                        <RatingQuestion
                          title={question.text}
                          questionKey={question.key}
                          selectedValue={form[question.key]}
                          onValueChange={(value) => handleScoreChange(question.key, value)}
                          disabled={isSubmitting || !isActive}
                        />
                      </div>
                    )
                  })}

                  {/* Sección de comentarios - Paso final */}
                  <div
                    className={`absolute inset-0 transition-all duration-600 ease-in-out ${
                      showComments
                        ? "opacity-100 translate-x-0 z-10 scale-100"
                        : "opacity-0 translate-x-full z-0 scale-95"
                    } ${isTransitioning ? "pointer-events-none" : ""}`}
                    style={{
                      transition: "opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    <div className="w-full mx-auto bg-gradient-to-br from-background via-background to-primary/5 rounded-2xl p-5 sm:p-6 border border-border/50 backdrop-blur-sm shadow-lg flex flex-col items-center justify-center">
                      {/* Encabezado del paso final */}
                      <div className="text-center mb-3 shrink-0">
                        <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-primary/10 mb-2">
                          <span className="text-xl">💬</span>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-foreground mb-1.5">
                          ¿Deseas compartir alguna opinión adicional?
                        </h3>
                        <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                          Este espacio es completamente opcional. Si tienes algún comentario, sugerencia o observación que quieras compartir, este es el momento perfecto.
                        </p>
                      </div>


                      {/* Campo de comentarios */}
                      <div className="space-y-1.5 w-full max-w-md mt-[5px]">
                        <Label htmlFor="comment" className="text-xs font-semibold text-foreground">
                          Comentario opcional
                        </Label>
                        <Textarea
                          id="comment"
                          value={form.comment ?? ""}
                          onChange={(event) => setForm((prev) => ({ ...prev, comment: event.target.value }))}
                          placeholder="Escribe aquí tus comentarios, sugerencias o cualquier observación que consideres relevante..."
                          className="text-xs resize-none bg-background/50 border-border/50 focus-visible:ring-2 focus-visible:ring-primary/20 min-h-[100px]"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botón de envío - solo visible en el paso final */}
                {showComments && (
                  <div className="mt-3 shrink-0 animate-in fade-in slide-in-from-bottom-4 duration-700 flex justify-center">
                    <Button
                      type="submit"
                      className="w-full max-w-md py-2.5 text-xs font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                      disabled={!isComplete || isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></span>
                          Enviando encuesta...
                        </span>
                      ) : (
                        "Enviar encuesta"
                      )}
                    </Button>
                  </div>
                )}
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface RatingQuestionProps {
  title: string
  questionKey: QuestionKey
  selectedValue: number | null | undefined
  onValueChange: (value: number) => void
  disabled?: boolean
}

function RatingQuestion({ title, questionKey, selectedValue, onValueChange, disabled = false }: RatingQuestionProps) {
  const [hovered, setHovered] = useState(0)
  const selected = selectedValue ?? 0

  const handleRating = (value: number) => {
    if (disabled) return
    onValueChange(value)
  }

  const labels = ["Muy en desacuerdo", "En desacuerdo", "Neutral", "De acuerdo", "Muy de acuerdo"]

  return (
    <div className="w-full flex items-center justify-center">
      {/* Contenedor central centrado */}
      <div className="w-full max-w-lg mx-auto bg-gradient-to-br from-background via-background to-primary/5 rounded-2xl p-6 sm:p-8 border border-border/50 backdrop-blur-sm shadow-lg flex flex-col items-center justify-center">
        {/* Pregunta principal - texto claro y centrado en la parte superior */}
        <div className="mb-8 shrink-0">
          <p className="font-semibold text-foreground text-lg sm:text-xl md:text-2xl leading-relaxed text-center">
            {title}
          </p>
        </div>

        {/* Sistema de calificación por estrellas - llenado progresivo */}
        <div className="flex justify-center items-center gap-3 sm:gap-4 mb-6 shrink-0">
          {[1, 2, 3, 4, 5].map((star) => {
            // Las estrellas se llenan progresivamente de izquierda a derecha
            const isActive = selected >= star || hovered >= star
            const isHovered = hovered >= star && hovered > 0

            return (
              <button
                key={star}
                type="button"
                className={`relative focus:outline-none transition-all duration-300 ease-out ${
                  disabled
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer hover:scale-125 active:scale-95 focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 rounded-lg"
                }`}
                onClick={() => handleRating(star)}
                onMouseEnter={() => !disabled && setHovered(star)}
                onMouseLeave={() => !disabled && setHovered(0)}
                disabled={disabled}
                aria-label={`Calificar ${star} de 5`}
              >
                <span className="relative inline-flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center">
                  {/* Estrella base - gris claro */}
                  <Star
                    className={`h-12 w-12 sm:h-16 sm:w-16 transition-all duration-300 ${
                      isActive
                        ? "text-muted-foreground/20 fill-muted-foreground/10"
                        : "text-muted-foreground/40 fill-muted-foreground/20"
                    }`}
                    strokeWidth={2}
                  />
                  {/* Estrella activa - dorado/ámbar con animación suave */}
                  {isActive && (
                    <Star
                      className={`absolute left-0 top-0 h-12 w-12 sm:h-16 sm:w-16 transition-all duration-300 ${
                        disabled
                          ? "text-muted-foreground/30 fill-muted-foreground/20"
                          : isHovered
                          ? "text-amber-500 fill-amber-500 drop-shadow-lg scale-110"
                          : "text-amber-400 fill-amber-400 drop-shadow-md"
                      }`}
                      strokeWidth={2}
                    />
                  )}
                </span>
                {/* Número debajo de la estrella */}
                <span
                  className={`block mt-2 text-sm font-bold transition-all duration-300 text-center ${
                    isActive && !disabled ? "text-foreground scale-110" : "text-muted-foreground"
                  }`}
                >
                  {star}
                </span>
              </button>
            )
          })}
        </div>

        {/* Texto descriptivo dinámico - retroalimentación visual inmediata */}
        <div className="text-center min-h-14 flex items-center justify-center shrink-0">
          {(selected > 0 || hovered > 0) && !disabled && (
            <div className="transition-all duration-300 animate-in fade-in slide-in-from-top-2">
              <p className="text-base sm:text-lg font-medium text-foreground">{labels[(hovered || selected) - 1]}</p>
              {selected > 0 && (
                <p className="text-sm text-muted-foreground mt-1">Calificación: {selected} de 5</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
