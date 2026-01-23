import type React from "react"
import { useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authService } from "@/services/auth.service"
import { HttpError } from "@/lib/api"

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const tokenFromUrl = searchParams.get("token") || ""
  const [token, setToken] = useState(tokenFromUrl)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!token.trim()) {
      setError("El token es obligatorio.")
      return
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.")
      return
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.")
      return
    }

    setIsLoading(true)
    try {
      await authService.resetPassword(token, password)
      setSubmitted(true)
    } catch (err) {
      const message =
        err instanceof HttpError
          ? err.data?.message || err.message
          : err instanceof Error
            ? err.message
            : "No se pudo restablecer la contraseña."
      console.error("[auth] reset-password error", err)
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-background">
        <div className="flex flex-col md:flex-row min-h-screen">
          <div className="flex items-center justify-center bg-background p-6 sm:p-8 md:p-10 lg:p-12 md:w-1/2 min-h-[40vh] md:min-h-screen">
            <div className="relative">
              <img
                src="/images/image.png"
                alt="Restablecer Contraseña"
                className="drop-shadow-2xl w-40 h-40 sm:w-56 sm:h-56 md:w-64 md:h-64"
              />
            </div>
          </div>

          <div className="flex items-center justify-center bg-primary p-6 sm:p-8 md:p-10 lg:p-12 md:w-1/2 md:clip-diagonal min-h-[60vh] md:min-h-screen">
            <div className="w-full max-w-md space-y-6 text-center">
              <div className="space-y-2 text-primary-foreground">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Contrasena actualizada</h1>
                <p className="text-primary-foreground/80 text-sm sm:text-base">
                  Ya puedes iniciar sesion con tu nueva contrasena.
                </p>
              </div>

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
              alt="Restablecer Contraseña"
              className="drop-shadow-2xl w-40 h-40 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-[280px] lg:h-[280px]"
            />
          </div>
        </div>

        <div className="flex items-center justify-center bg-primary p-6 sm:p-8 md:p-10 lg:p-12 md:w-1/2 md:clip-diagonal min-h-[60vh] md:min-h-screen">
          <div className="w-full max-w-md space-y-6 md:space-y-8">
            <div className="space-y-2 text-center text-primary-foreground">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Restablecer Contraseña</h1>
              <p className="text-primary-foreground/80 text-sm sm:text-base">
                Ingresa el token recibido y define tu nueva contrasena
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
              <div className="space-y-2">
                <Label htmlFor="token" className="text-primary-foreground text-sm md:text-base">
                  Token
                </Label>
                <Input
                  id="token"
                  type="text"
                  placeholder="Pega el token aqui"
                  className="bg-white text-foreground h-10 md:h-11"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-primary-foreground text-sm md:text-base">
                  Nueva contrasena
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimo 8 caracteres"
                  className="bg-white text-foreground h-10 md:h-11"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-primary-foreground text-sm md:text-base">
                  Confirmar contrasena
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repite tu contrasena"
                  className="bg-white text-foreground h-10 md:h-11"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                {isLoading ? "Actualizando..." : "ACTUALIZAR CONTRASENA"}
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
