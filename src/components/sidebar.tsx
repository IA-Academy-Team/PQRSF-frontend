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
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useSidebar } from "@/contexts/sidebar-context"
import { cn } from "@/lib/utils"

export function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { isCollapsed, toggleSidebar } = useSidebar()

  const getNavigationItems = () => {
    if (user?.rol === "Administrador") {
      return [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "PQRSF - Bandeja General", href: "/pqrsf", icon: FileText },
        { name: "Seguimiento", href: "/seguimiento", icon: Clock },
        { name: "En Apelación", href: "/en-apelacion", icon: AlertCircle },
        { name: "Cerradas", href: "/cerradas", icon: CheckCircle },
        { name: "Encuestas", href: "/encuestas", icon: ClipboardList },
        { name: "Chats", href: "/chats", icon: MessageCircle },
      ]
    } else if (user?.rol === "Usuario de Área Responsable") {
      return [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "PQRSF", href: "/pqrsf", icon: FileText },
        { name: "Análisis pendientes", href: "/analisis-pendientes", icon: ClipboardList },
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
        { name: "Responsables", href: "/responsables", icon: Users }, // responsables son personas como Jerson, Alexa, jefes de areas
        { name: "Areas", href: "/areas", icon: Briefcase }, // areas son áreas de campuslands
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
    <aside
      className={cn(
        "bg-sidebar border-r border-sidebar-border h-screen flex flex-col fixed left-0 top-0 z-50 transition-all duration-300",
        isCollapsed ? "w-24" : "w-64"
      )}
    >
      <div className="p-6 h-20 flex items-center shrink-0">
        <div className={cn("flex items-center gap-2 w-full", isCollapsed ? "justify-center" : "justify-between")}>
          <Link
            to="/dashboard"
            className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-3")}
            title={isCollapsed ? "Campuslands" : undefined}
          >
            <div className="bg-primary rounded-xl p-2 shrink-0">
              <FileText className="h-6 w-6 text-primary-foreground" />
            </div>
            {!isCollapsed && <span className="text-xl font-bold text-foreground">Campuslands</span>}
          </Link>
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground transition-colors shrink-0"
            title={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <hr />

      <nav className={cn("flex-1 overflow-y-auto flex flex-col mt-2", isCollapsed ? "px-2 gap-2" : "px-4 gap-2")}>
        <div className="flex flex-col gap-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg transition-colors",
                isCollapsed && "justify-center px-2"
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span className="font-medium">{item.name}</span>}
            </Link>
          ))}
        </div>

        {admin.length > 0 && (
          <div className="flex flex-col gap-2">
            {!isCollapsed && (
              <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase mb-2">
                {user?.rol === "Usuario de Área Responsable" ? "Configuración" : "Administración"}
              </h3>
            )}
            {admin.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg transition-colors",
                  isCollapsed && "justify-center px-2"
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span className="font-medium">{item.name}</span>}
              </Link>
            ))}
          </div>
        )}
      </nav>

      <div className={cn("border-t border-sidebar-border space-y-2", isCollapsed ? "p-2" : "p-4")}>
        <div className={cn("flex items-center gap-3 px-3 py-2", isCollapsed && "justify-center px-2")}>
          <img
            src="/images/CASCO + CAMPUS.svg"
            alt={user?.nombre || "User"}
            className="h-10 w-10 rounded-full shrink-0"
            title={isCollapsed ? `${user?.nombre || "Usuario"} - ${user?.rol || "Sin rol"}` : undefined}
          />
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.nombre || "Usuario"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.rol || "Sin rol"}</p>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 text-sidebar-foreground hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors w-full",
            isCollapsed && "justify-center px-2"
          )}
          title={isCollapsed ? "Cerrar Sesión" : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span className="font-medium">Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  )
}
