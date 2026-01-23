import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { AuthUser } from "@/types"
import { authService, type AuthSessionResponse } from "@/services/auth.service"
import { HttpError } from "@/lib/api"

interface AuthContextType {
  user: AuthUser | null
  login: (correo: string, password: string, remember: boolean) => Promise<{ ok: boolean; message?: string }>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const mapAuthUser = (payload?: AuthSessionResponse | null): AuthUser | null => {
    const rawUser =
      payload?.user ||
      (payload as any)?.data?.user ||
      (payload as any)?.session?.user ||
      (payload as any)?.data?.session?.user
    if (!rawUser) return null
    const roleId = rawUser.roleId ?? rawUser.role_id
    const rol = roleId === 2 ? "Administrador" : "Usuario de Área Responsable"
    return {
      id: String(rawUser.id),
      nombre: rawUser.name || rawUser.email || "Usuario",
      correo: rawUser.email || "",
      rol,
    }
  }

  const coerceMessage = (value: unknown): string | null => {
    if (typeof value === "string" && value.trim()) return value
    if (!value || typeof value !== "object") return null
    const record = value as Record<string, unknown>
    if (typeof record.message === "string" && record.message.trim()) return record.message
    if (typeof record.error === "string" && record.error.trim()) return record.error
    if (typeof record.errors === "string" && record.errors.trim()) return record.errors
    return null
  }

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof HttpError) {
      const data = error.data
      return (
        coerceMessage(data) ||
        coerceMessage(error.message) ||
        "No se pudo completar la solicitud."
      )
    }
    if (error instanceof Error) return error.message
    return "No se pudo completar la solicitud."
  }

  useEffect(() => {
    const hydrate = async () => {
      const rememberedUser = localStorage.getItem("auth_user")
      const sessionUser = sessionStorage.getItem("auth_user")

      if (rememberedUser) {
        setUser(JSON.parse(rememberedUser))
      } else if (sessionUser) {
        setUser(JSON.parse(sessionUser))
      }

      try {
        const shouldRefresh = Boolean(
          localStorage.getItem("auth_remember") || sessionStorage.getItem("auth_session"),
        )
        if (shouldRefresh) {
          const session = await authService.me()
          const authUser = mapAuthUser(session)
          if (authUser) {
            setUser(authUser)
            const remember = localStorage.getItem("auth_remember") === "true"
            if (remember) {
              localStorage.setItem("auth_user", JSON.stringify(authUser))
            } else {
              sessionStorage.setItem("auth_user", JSON.stringify(authUser))
            }
          }
        }
      } catch {
        // ignore session errors on startup
      } finally {
        setIsLoading(false)
      }
    }

    void hydrate()
  }, [])

  const login = async (
    correo: string,
    password: string,
    remember: boolean,
  ): Promise<{ ok: boolean; message?: string }> => {
    try {
      const response = await authService.login(correo, password)
      const authUser = mapAuthUser(response)

      if (!authUser) {
        setUser(null)
        localStorage.removeItem("auth_user")
        localStorage.removeItem("auth_remember")
        sessionStorage.removeItem("auth_user")
        sessionStorage.removeItem("auth_session")
        return { ok: false, message: "No se pudo obtener el usuario autenticado." }
      }

      setUser(authUser)
      if (remember) {
        localStorage.setItem("auth_user", JSON.stringify(authUser))
        localStorage.setItem("auth_remember", "true")
        sessionStorage.removeItem("auth_user")
        sessionStorage.removeItem("auth_session")
      } else {
        sessionStorage.setItem("auth_user", JSON.stringify(authUser))
        sessionStorage.setItem("auth_session", "true")
        localStorage.removeItem("auth_user")
        localStorage.removeItem("auth_remember")
      }

      if ((response as any)?.token) {
        localStorage.setItem("token", String((response as any).token))
      }

      return { ok: true }
    } catch (error) {
      let message = getErrorMessage(error)
      if (error instanceof HttpError) {
        const data = error.data as Record<string, unknown> | null | undefined
        const code = typeof data?.code === "string" ? data.code : ""
        const serverMessage = typeof data?.message === "string" ? data.message : ""

        if (code === "AUTH_CREDENTIALS_NOT_FOUND") {
          message = "El usuario no existe en la base de datos."
        } else if (code === "AUTH_INVALID_CREDENTIALS") {
          message = "La constraseña es incorrecta."
        } else if (serverMessage.toLowerCase().includes("no existe")) {
          message = "El usuario no existe en la base de datos."
        } else if (serverMessage.toLowerCase().includes("credencial")) {
          message = "La constraseña es incorrecta."
        } else if (error.status === 401) {
          message = "Correo o contraseña incorrectos."
        }

        console.error("[auth] login error", {
          status: error.status,
          message: error.message,
          data: error.data,
        })
      } else {
        console.error("[auth] login error", error)
      }
      setUser(null)
      localStorage.removeItem("auth_user")
      localStorage.removeItem("auth_remember")
      sessionStorage.removeItem("auth_user")
      sessionStorage.removeItem("auth_session")
      return { ok: false, message }
    }
  }

  const logout = () => {
    void authService.logout().catch((error) => {
      console.error("[auth] logout error", error)
    })
    setUser(null)
    localStorage.removeItem("auth_user")
    localStorage.removeItem("auth_remember")
    sessionStorage.removeItem("auth_user")
    sessionStorage.removeItem("auth_session")
    localStorage.removeItem("token")
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
