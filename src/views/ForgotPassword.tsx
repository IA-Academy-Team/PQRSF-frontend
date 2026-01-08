import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link } from "react-router-dom"
import { useState } from "react"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Simulación de envío de email
    setTimeout(() => {
      setSubmitted(true)
      setIsLoading(false)
    }, 1000)
  }

  if (submitted) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-background">
        <div className="flex flex-col md:flex-row min-h-screen">
          <div className="flex items-center justify-center bg-background p-6 sm:p-8 md:p-10 lg:p-12 md:w-1/2 min-h-[40vh] md:min-h-screen">
            <div className="relative">
              <img
                src="/images/image.png"
                alt="Recuperar Contraseña"
                className="drop-shadow-2xl w-40 h-40 sm:w-56 sm:h-56 md:w-64 md:h-64"
              />
            </div>
          </div>

          <div className="flex items-center justify-center bg-primary p-6 sm:p-8 md:p-10 lg:p-12 md:w-1/2 md:clip-diagonal min-h-[60vh] md:min-h-screen">
            <div className="w-full max-w-md space-y-6 text-center">
              <div className="space-y-2 text-primary-foreground">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">¡Revisa tu Email!</h1>
                <p className="text-primary-foreground/80 text-sm sm:text-base">
                  Hemos enviado un enlace para recuperar tu contraseña a:
                </p>
                <p className="font-semibold text-primary-foreground break-all">{email}</p>
              </div>

              <p className="text-sm text-primary-foreground/70">
                Por favor, revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
              </p>

              <Link to="/">
                <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold h-10 md:h-11">
                  Volver al Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      <div className="flex flex-col md:flex-row min-h-screen">
        <div className="flex items-center justify-center bg-background p-6 sm:p-8 md:p-10 lg:p-12 md:w-1/2 min-h-[40vh] md:min-h-screen">
          <div className="relative">
            <img
              src="/images/image.png"
              alt="Recuperar Contraseña"
              className="drop-shadow-2xl w-40 h-40 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-[280px] lg:h-[280px]"
            />
          </div>
        </div>

        <div className="flex items-center justify-center bg-primary p-6 sm:p-8 md:p-10 lg:p-12 md:w-1/2 md:clip-diagonal min-h-[60vh] md:min-h-screen">
          <div className="w-full max-w-md space-y-6 md:space-y-8">
            <div className="space-y-2 text-center text-primary-foreground">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Recuperar Contraseña</h1>
              <p className="text-primary-foreground/80 text-sm sm:text-base">
                Ingresa tu email para recibir instrucciones de recuperación
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-primary-foreground text-sm md:text-base">
                  Your email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="bg-white text-foreground h-10 md:h-11"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 md:px-4 md:py-3 rounded text-xs sm:text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold h-10 md:h-11 text-sm md:text-base"
              >
                {isLoading ? "Enviando..." : "ENVIAR INSTRUCCIONES"}
              </Button>
            </form>

            <div className="text-center">
              <Link to="/">
                <Button
                  variant="ghost"
                  className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
                >
                  ← Volver al Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
