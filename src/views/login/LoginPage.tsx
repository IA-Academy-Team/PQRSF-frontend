import type React from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/contexts/auth-context"
import { useState, useMemo } from "react"
import { userService } from "@/services/user.service"
import { HttpError } from "@/lib/api"

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [correo, setCorreo] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [remember, setRemember] = useState(false)
  const [userCheck, setUserCheck] = useState<"idle" | "checking" | "exists" | "not-found" | "error">("idle")

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const normalizeMessage = (value: unknown): string => {
      if (typeof value === "string" && value.trim()) return value
      if (value && typeof value === "object") {
        const record = value as Record<string, unknown>
        if (typeof record.message === "string" && record.message.trim()) return record.message
        try {
          return JSON.stringify(value)
        } catch {
          return "Credenciales incorrectas"
        }
      }
      return "Credenciales incorrectas"
    }

    try {
      const result = await login(correo, password, remember)

      if (result.ok) {
        navigate("/dashboard")
      } else {
        setError(normalizeMessage(result.message))
        setIsLoading(false)
      }
    } catch (err) {
      console.error("[auth] login unexpected error", err)
      setError("No se pudo iniciar sesion. Intenta nuevamente.")
      setIsLoading(false)
    }
  }

  const handleCheckUser = async () => {
    const email = correo.trim()
    if (!email) {
      setUserCheck("idle")
      return
    }
    setUserCheck("checking")
    try {
      const user = await userService.getByEmail(email)
      setUserCheck(user ? "exists" : "not-found")
    } catch (err) {
      if (err instanceof HttpError && err.status === 404) {
        setUserCheck("not-found")
        return
      }
      console.error("[auth] user check error", err)
      setUserCheck("error")
    }
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
              alt="Admin Login"
              className="drop-shadow-2xl w-40 h-40 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-[320x] lg:h-80 xl:w-95 xl:h-95"
            />
          </div>
        </div>

        {/* Right Side - Login Form with diagonal clip */}
        <div className="flex items-center justify-center bg-primary p-6 sm:p-8 md:p-10 lg:p-12 lg:w-3/5 clip-diagonal min-h-[70vh] lg:min-h-screen">
          <div className="w-full max-w-md space-y-6 md:space-y-8 lg:ml-30">
            <div className="space-y-2 text-center text-primary-foreground">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Plataforma PQRSF</h1>
              <p className="text-primary-foreground/80 text-sm sm:text-base">Ingresa tus credenciales para continuar</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 md:space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-primary-foreground text-sm md:text-base">
                   email
                </Label>
                <Input
                  id="email"
                  type="email" 
                  placeholder="ingresa tu email"
                  className="bg-white text-foreground h-10 md:h-11"
                  value={correo}
                  onChange={(e) => {
                    setCorreo(e.target.value)
                    setUserCheck("idle")
                  }}
                  onBlur={handleCheckUser}
                  required
                />
                {userCheck === "checking" && (
                  <p className="text-xs text-primary-foreground/80">Verificando usuario...</p>
                )}
                {userCheck === "exists" && (
                  <p className="text-xs text-emerald-200">Usuario encontrado.</p>
                )}
                {userCheck === "not-found" && (
                  <p className="text-xs text-red-200">Este usuario no está registrado.</p>
                )}
                {userCheck === "error" && (
                  <p className="text-xs text-red-200">No pudimos validar el usuario.</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-primary-foreground text-sm md:text-base">
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  className="bg-white text-foreground h-10 md:h-11"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 md:px-4 md:py-3 rounded text-xs sm:text-sm">
                  {error}
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={remember}
                    onCheckedChange={(checked) => setRemember(Boolean(checked))}
                    className="border-primary-foreground bg-white"
                  />
                  <label htmlFor="remember" className="text-xs sm:text-sm text-primary-foreground cursor-pointer">
                    Recuerdame
                  </label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-xs sm:text-sm text-primary-foreground/80 hover:text-primary-foreground underline"
                >
                  Olvidaste tu contraseña?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold h-10 md:h-11 text-sm md:text-base"
              >
                {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
