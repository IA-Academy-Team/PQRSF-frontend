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
import { Link, useParams, useNavigate } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { useEffect, useState } from "react"

export default function PQRSFDetail() {
  const { id } = useParams<{ id: string }>()
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()
  const [analisis, setAnalisis] = useState("")
  const [evidencias, setEvidencias] = useState<File[]>([])
  const [respuestaCliente, setRespuestaCliente] = useState("")

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/")
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

  const handleEnviarRespuestaCliente = () => {
    if (!respuestaCliente.trim()) {
      alert("Por favor ingresa una respuesta para el cliente")
      return
    }

    console.log("[v0] Enviando respuesta directa al cliente:", respuestaCliente)
    console.log("[v0] Análisis técnico:", analisis)
    console.log("[v0] Evidencias adjuntas:", evidencias)

    // Simula el envío de respuesta al cliente
    alert(
      `Respuesta enviada exitosamente al cliente.\n\n` +
        `La PQRSF ha sido marcada como "Respondida".\n` +
        `Se enviará notificación por correo y WhatsApp.`,
    )

    // Redirigir al listado de análisis pendientes
    navigate("/analisis-pendientes")
  }

  if (user.rol === "Usuario de Área Responsable") {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 lg:ml-64 overflow-y-auto min-h-screen">
          <div className="mb-6">
            <Link to="/analisis-pendientes">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Análisis Pendientes
              </Button>
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="border-b bg-muted/30">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-lg font-bold text-primary">{id}</span>
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Petición</Badge>
                        <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">En Análisis</Badge>
                      </div>
                      <CardTitle className="text-2xl">Solicitud de cambio de horario de clase</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-2">DESCRIPCIÓN DE LA SOLICITUD</h3>
                    <p className="text-foreground leading-relaxed">
                      Solicito respetuosamente un cambio en el horario de la clase de Desarrollo Web Avanzado.
                      Actualmente estoy inscrito en el grupo de las 2:00 PM y necesito cambiar al grupo de las 9:00 AM
                      debido a compromisos laborales que he adquirido recientemente.
                    </p>
                    <p className="text-foreground leading-relaxed mt-4">
                      He hablado con algunos compañeros del grupo matutino y están de acuerdo con el cambio. Adjunto
                      carta de mi empleador como soporte de la solicitud.
                    </p>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-sm text-muted-foreground mb-4">DOCUMENTOS ADJUNTOS</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors">
                        <FileText className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">carta-empleador.pdf</p>
                          <p className="text-xs text-muted-foreground">245 KB</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors">
                        <FileText className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">horario-laboral.pdf</p>
                          <p className="text-xs text-muted-foreground">180 KB</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-sm text-muted-foreground mb-4">HISTORIAL DE ACTIVIDAD</h3>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div className="w-px h-full bg-border mt-2" />
                        </div>
                        <div className="pb-6">
                          <p className="font-semibold">PQRSF Radicada</p>
                          <p className="text-sm text-muted-foreground">15 de diciembre, 2023 - 10:30 AM</p>
                          <p className="text-sm mt-1">
                            La solicitud ha sido registrada en el sistema y asignada al área de Formación.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="w-px h-full bg-border mt-2" />
                        </div>
                        <div className="pb-6">
                          <p className="font-semibold">Asignada a revisor</p>
                          <p className="text-sm text-muted-foreground">15 de diciembre, 2023 - 11:00 AM</p>
                          <p className="text-sm mt-1">María González - Coordinadora de Formación</p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                          <Clock className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-semibold">En espera de respuesta</p>
                          <p className="text-sm text-muted-foreground">Tiempo estimado: 10 días hábiles restantes</p>
                        </div>
                      </div>
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
                      Documenta tu análisis técnico, antecedentes normativos y consideraciones internas. Este campo es
                      para registro interno del área.
                    </p>
                    <Textarea
                      id="analisis"
                      placeholder="Ejemplo: Después de revisar la solicitud y la documentación adjunta, se verifica disponibilidad de cupos en el grupo matutino..."
                      className="min-h-[150px]"
                      value={analisis}
                      onChange={(e) => setAnalisis(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2 border-t pt-6">
                    <Label htmlFor="respuestaCliente" className="text-base font-semibold text-primary">
                      Respuesta al Cliente *
                    </Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Redacta la respuesta oficial que será enviada directamente al solicitante por correo y WhatsApp.
                      Esta será la respuesta final de la PQRSF.
                    </p>
                    <Textarea
                      id="respuestaCliente"
                      placeholder="Ejemplo: Estimado(a) solicitante, informamos que su petición ha sido aprobada. El cambio de horario quedará efectivo a partir del próximo lunes..."
                      className="min-h-[200px] border-2 border-primary/30"
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
                      Adjunta documentos o archivos que soporten tu respuesta (contratos, aprobaciones, certificados,
                      etc.).
                    </p>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-accent/50 cursor-pointer transition-colors">
                      <Paperclip className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-medium mb-1">Click para adjuntar archivos</p>
                      <p className="text-xs text-muted-foreground">PDF, DOC, IMG hasta 10MB</p>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-green-500 rounded-lg p-2 flex-shrink-0">
                        <Send className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-foreground mb-1">Envío Directo al Cliente</p>
                        <p className="text-xs text-muted-foreground">
                          Al confirmar el envío, la respuesta será comunicada automáticamente al solicitante por correo
                          electrónico y WhatsApp. El estado de la PQRSF cambiará a "Respondida" y se registrará en el
                          historial.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={handleEnviarRespuestaCliente}
                      disabled={!respuestaCliente.trim()}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Respuesta al Cliente
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
                      <p className="font-semibold text-foreground">Carlos Mendoza</p>
                      <p className="text-sm text-muted-foreground">Camper</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Código</p>
                        <p className="font-medium">CMP-2023-156</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Fecha de radicación</p>
                        <p className="font-medium">15 de diciembre, 2023</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Área asignada</p>
                        <p className="font-medium">{user.area}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Tiempo transcurrido</p>
                        <p className="font-medium text-orange-600">5 días</p>
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
                    <Badge variant="outline">Persona Natural</Badge>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Prioridad</p>
                    <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Media</Badge>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Canal de recepción</p>
                    <p className="text-sm font-medium">WhatsApp - Chatbot n8n</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Consecutivo</p>
                    <p className="text-sm font-mono font-semibold">#2023-001</p>
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
                        Esta solicitud debe ser respondida antes del 30 de diciembre, 2023 (10 días hábiles).
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

      <main className="flex-1 p-8 lg:ml-64 overflow-y-auto min-h-screen">
        <div className="mb-6">
          <Link to="/pqrsf">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al listado
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="border-b bg-muted/30">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-lg font-bold text-primary">{id}</span>
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Petición</Badge>
                  </div>
                  <CardTitle className="text-2xl">Solicitud de cambio de horario de clase</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-foreground">Contenido de la solicitud...</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Respuesta y Análisis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea placeholder="Análisis..." className="min-h-[120px]" />
                <div className="flex gap-3">
                  <Button className="flex-1 bg-green-600 hover:bg-green-700">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Aprobar
                  </Button>
                  <Button variant="outline" className="flex-1 bg-transparent">
                    <XCircle className="h-4 w-4 mr-2" />
                    Rechazar
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
                <p className="text-sm">Carlos Mendoza</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
