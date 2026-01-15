import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link } from "react-router-dom"
import { useState, useMemo } from "react"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  // Generar partículas de forma estable
  const particles = useMemo(() => {
    return Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      left: Math.random() * 120, // Extender hasta 120% para que algunas partículas se vean más a la derecha
      top: Math.random() * 100,
      delay: Math.random() * 15,
      duration: 12 + Math.random() * 8,
    }))
  }, [])

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
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Side - Icon with Particles */}
        <div className="flex items-center justify-center bg-background p-6 sm:p-8 md:p-10 lg:p-12 lg:w-1/2 min-h-[60vh] lg:min-h-screen relative overflow-visible clip-diagonal-left">
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
            
            {/* Logo */}
            <div className="relative z-10">
              <img
                src="/images/CASCO + CAMPUS.svg"
                alt="Recuperar Contraseña"
                className="drop-shadow-2xl w-40 h-40 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-[320x] lg:h-[320px] xl:w-[380px] xl:h-[380px]"
              />
            </div>
          </div>

          <div className="flex items-center justify-center bg-primary p-6 sm:p-8 md:p-10 lg:p-12 lg:w-3/5 clip-diagonal min-h-[60vh] lg:min-h-screen">
            <div className="w-full max-w-md space-y-6 text-center lg:ml-30">
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
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Side - Icon with Particles */}
        <div className="flex items-center justify-center bg-background p-6 sm:p-8 md:p-10 lg:p-12 lg:w-1/2 min-h-[60vh] lg:min-h-screen relative overflow-visible clip-diagonal-left">
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
          
          {/* Logo */}
          <div className="relative z-10">
            <img
              src="/images/CASCO + CAMPUS.svg"
              alt="Recuperar Contraseña"
              className="drop-shadow-2xl w-40 h-40 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-[320x] lg:h-[320px] xl:w-[380px] xl:h-[380px]"
            />
          </div>
        </div>

        <div className="flex items-center justify-center bg-primary p-6 sm:p-8 md:p-10 lg:p-12 lg:w-3/5 clip-diagonal min-h-[60vh] lg:min-h-screen">
          <div className="w-full max-w-md space-y-6 md:space-y-8 lg:ml-30">
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
