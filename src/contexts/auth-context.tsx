import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { AuthUser } from "@/types"

interface AuthContextType {
  user: AuthUser | null
  login: (correo: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (correo: string, password: string): Promise<boolean> => {
    // For demo: admin@campuslands.com / admin123
    if (correo === "admin@campuslands.com" && password === "admin123") {
      const authUser: AuthUser = {
        id: "1",
        nombre: "Administrador Principal",
        correo: "admin@campuslands.com",
        rol: "Administrador",
      }
      setUser(authUser)
      localStorage.setItem("auth_user", JSON.stringify(authUser))
      return true
    }

    // For demo: area@campuslands.com / area123
    if (correo === "area@campuslands.com" && password === "area123") {
      const authUser: AuthUser = {
        id: "2",
        nombre: "Usuario Área Operativa",
        correo: "area@campuslands.com",
        rol: "Usuario de Área Responsable",
        area: "Área Responsable (Operativa)",
      }
      setUser(authUser)
      localStorage.setItem("auth_user", JSON.stringify(authUser))
      return true
    }

    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("auth_user")
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
