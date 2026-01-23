import { Link, useNavigate } from "react-router-dom"
import {
  FileText,
  LayoutDashboard,
  Settings,
  MessageCircle,
  Users,
  LogOut,
  AlertCircle,
  ClipboardList,
  Briefcase,
  Clock,
  CheckCircle,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const getNavigationItems = () => {
    if (user?.rol === "Administrador") {
      return [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "PQRSF - Bandeja General", href: "/pqrsf", icon: FileText },
        { name: "Seguimiento", href: "/seguimiento", icon: Clock },
        { name: "En Apelación", href: "/en-apelacion", icon: AlertCircle },
        { name: "Cerradas", href: "/cerradas", icon: CheckCircle },
        { name: "Chats", href: "/chats", icon: MessageCircle },
      ]
    } else if (user?.rol === "Usuario de Área Responsable") {
      return [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "PQRSF", href: "/pqrsf", icon: FileText },
        { name: "Análisis Pendientes", href: "/analisis-pendientes", icon: ClipboardList },
        { name: "Apelaciones", href: "/apelaciones", icon: AlertCircle },
      ]
    } else {
      return [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "PQRSF", href: "/pqrsf", icon: FileText },
      ]
    }
  }

  const getAdminItems = () => {
    if (user?.rol === "Administrador") {
      return [
        { name: "Responsables", href: "/Responsables", icon: Users }, // responsables son personas como Jerson, Alexa, jefes de areas
        { name: "areas", href: "/areas", icon: Briefcase }, // areas son áreas de campuslands
      ]
    } else if (user?.rol === "Usuario de Área Responsable") {
      return [{ name: "Perfil", href: "/profile", icon: Settings }]
    } else {
      return [{ name: "Perfil", href: "/profile", icon: Settings }]
    }
  }

  const navigation = getNavigationItems()
  const admin = getAdminItems()

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border h-screen flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="bg-primary rounded-xl p-2">
            <FileText className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">Campuslands</span>
        </Link>
      </div>

      <nav className="px-4 space-y-8 flex-1 overflow-y-auto">
        <div>
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="flex items-center gap-3 px-3 py-2.5 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg transition-colors"
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </div>

        {admin.length > 0 && (
          <div>
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase mb-2">
              {user?.rol === "Usuario de Área Responsable" ? "Configuración" : "Administración"}
            </h3>
            {admin.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center gap-3 px-3 py-2.5 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg transition-colors"
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-sidebar-border space-y-2">
        <div className="flex items-center gap-3 px-3 py-2">
          <img src="/images/image.png" alt={user?.nombre || "User"} className="h-10 w-10 rounded-full" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{user?.nombre || "Usuario"}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.rol || "Sin rol"}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 text-sidebar-foreground hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors w-full"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  )
}
