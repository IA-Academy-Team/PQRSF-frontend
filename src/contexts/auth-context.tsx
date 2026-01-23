import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { AuthUser } from "@/types"
import { authService, type AuthSessionResponse } from "@/services/auth.service"
import { HttpError } from "@/lib/api"

interface AuthContextType {
  user: AuthUser | null
  login: (correo: string, password: string) => Promise<{ ok: boolean; message?: string }>
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

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof HttpError) {
      const data = error.data || {}
      return (
        data.message ||
        data.error ||
        data.errors ||
        error.message ||
        "No se pudo completar la solicitud."
      )
    }
    if (error instanceof Error) return error.message
    return "No se pudo completar la solicitud."
  }

  useEffect(() => {
    const hydrate = async () => {
      const storedUser = localStorage.getItem("auth_user")
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }

      try {
        const session = await authService.me()
        const authUser = mapAuthUser(session)
        if (authUser) {
          setUser(authUser)
          localStorage.setItem("auth_user", JSON.stringify(authUser))
        }
      } catch {
        // ignore session errors on startup
      } finally {
        setIsLoading(false)
      }
    }

    void hydrate()
  }, [])

  const login = async (correo: string, password: string): Promise<{ ok: boolean; message?: string }> => {
    try {
      const response = await authService.login(correo, password)
      const authUser = mapAuthUser(response)

      if (!authUser) {
        return { ok: false, message: "No se pudo obtener el usuario autenticado." }
      }

      setUser(authUser)
      localStorage.setItem("auth_user", JSON.stringify(authUser))

      if ((response as any)?.token) {
        localStorage.setItem("token", String((response as any).token))
      }

      return { ok: true }
    } catch (error) {
      const message = getErrorMessage(error)
      console.error("[auth] login error", error)
      return { ok: false, message }
    }
  }

  const logout = () => {
    void authService.logout().catch((error) => {
      console.error("[auth] logout error", error)
    })
    setUser(null)
    localStorage.removeItem("auth_user")
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
