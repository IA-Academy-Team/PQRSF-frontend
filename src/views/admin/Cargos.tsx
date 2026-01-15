import type React from "react"
import { useState, useEffect } from "react"
import { Briefcase, Plus, Edit, Trash2, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Sidebar } from "@/components/sidebar"
import { useAuth } from "@/contexts/auth-context"
import { useSidebar } from "@/contexts/sidebar-context"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import type { Cargo } from "@/types"

export default function Cargos() {
  const { user } = useAuth()
  const { isCollapsed } = useSidebar()
  const navigate = useNavigate()
  const [cargos, setCargos] = useState<Cargo[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCargo, setEditingCargo] = useState<Cargo | null>(null)

  useEffect(() => {
    if (user && user.rol !== "Administrador") {
      navigate("/dashboard")
    }
  }, [user, navigate])

  useEffect(() => {
    const mockCargos: Cargo[] = [
      {
        id: "1",
        nombre: "Analista Senior",
        descripcion: "Analista con acceso completo a respuestas y análisis",
        menuOptions: ["Dashboard", "PQRSF", "Análisis Pendientes", "Apelaciones"],
        actions: ["ver", "crear", "editar", "responder"],
        estado: "activo",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      },
      {
        id: "2",
        nombre: "Supervisor de Servicio",
        descripcion: "Supervisor con acceso a chat y seguimiento",
        menuOptions: ["Dashboard", "PQRSF", "Chats", "Seguimiento"],
        actions: ["ver", "crear", "chatear"],
        estado: "activo",
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-15"),
      },
    ]
    setCargos(mockCargos)
  }, [])

  const menuOptionsAvailable = [
    "Dashboard",
    "PQRSF",
    "Análisis Pendientes",
    "Apelaciones",
    "Seguimiento",
    "En Apelación",
    "Cerradas",
    "Chats",
  ]

  const actionsAvailable = ["ver", "crear", "editar", "eliminar", "responder", "cerrar", "apelar", "chatear"]

  const filteredCargos = cargos.filter(
    (c) =>
      c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.descripcion.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreateOrUpdate = (formData: Partial<Cargo>) => {
    if (editingCargo) {
      setCargos(cargos.map((c) => (c.id === editingCargo.id ? { ...c, ...formData, updatedAt: new Date() } : c)))
    } else {
      const newCargo: Cargo = {
        id: Date.now().toString(),
        nombre: formData.nombre!,
        descripcion: formData.descripcion!,
        menuOptions: formData.menuOptions!,
        actions: formData.actions!,
        estado: "activo",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setCargos([...cargos, newCargo])
    }
    setIsDialogOpen(false)
    setEditingCargo(null)
  }

  const handleToggleStatus = (id: string) => {
    setCargos(cargos.map((c) => (c.id === id ? { ...c, estado: c.estado === "activo" ? "inactivo" : "activo" } : c)))
  }

  if (!user || user.rol !== "Administrador") {
    return null
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main
        className={cn(
          "flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-h-screen transition-all duration-300",
          isCollapsed ? "lg:ml-24" : "lg:ml-64"
        )}
      >
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Gestión de Cargos</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Define perfiles funcionales con permisos específicos
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingCargo(null)
                    setIsDialogOpen(true)
                  }}
                  className="w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Cargo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <CargoForm
                  cargo={editingCargo}
                  menuOptions={menuOptionsAvailable}
                  actions={actionsAvailable}
                  onSubmit={handleCreateOrUpdate}
                  onCancel={() => {
                    setIsDialogOpen(false)
                    setEditingCargo(null)
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
          {filteredCargos.map((cargo) => (
            <Card key={cargo.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 rounded-lg p-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{cargo.nombre}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{cargo.descripcion}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleStatus(cargo.id)}
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      cargo.estado === "activo" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {cargo.estado}
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">OPCIONES DE MENÚ</p>
                    <div className="flex flex-wrap gap-2">
                      {cargo.menuOptions.map((option) => (
                        <span key={option} className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                          {option}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">ACCIONES PERMITIDAS</p>
                    <div className="flex flex-wrap gap-2">
                      {cargo.actions.map((action) => (
                        <span key={action} className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                          {action}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingCargo(cargo)
                        setIsDialogOpen(true)
                      }}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                      onClick={() => setCargos(cargos.filter((c) => c.id !== cargo.id))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}

function CargoForm({
  cargo,
  menuOptions,
  actions,
  onSubmit,
  onCancel,
}: {
  cargo: Cargo | null
  menuOptions: string[]
  actions: string[]
  onSubmit: (data: Partial<Cargo>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    nombre: cargo?.nombre || "",
    descripcion: cargo?.descripcion || "",
    menuOptions: cargo?.menuOptions || [],
    actions: cargo?.actions || [],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const toggleMenuOption = (option: string) => {
    setFormData({
      ...formData,
      menuOptions: formData.menuOptions.includes(option)
        ? formData.menuOptions.filter((o) => o !== option)
        : [...formData.menuOptions, option],
    })
  }

  const toggleAction = (action: string) => {
    setFormData({
      ...formData,
      actions: formData.actions.includes(action)
        ? formData.actions.filter((a) => a !== action)
        : [...formData.actions, action],
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>{cargo ? "Editar Cargo" : "Crear Nuevo Cargo"}</DialogTitle>
      </DialogHeader>
      <div className="space-y-6 py-4">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre del Cargo</Label>
          <Input
            id="nombre"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="descripcion">Descripción</Label>
          <Textarea
            id="descripcion"
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            rows={3}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Opciones de Menú Disponibles</Label>
          <div className="grid grid-cols-2 gap-3 p-4 border rounded-lg">
            {menuOptions.map((option) => (
              <div key={option} className="flex items-center gap-2">
                <Checkbox
                  id={`menu-${option}`}
                  checked={formData.menuOptions.includes(option)}
                  onCheckedChange={() => toggleMenuOption(option)}
                />
                <label htmlFor={`menu-${option}`} className="text-sm cursor-pointer">
                  {option}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Acciones Permitidas</Label>
          <div className="grid grid-cols-2 gap-3 p-4 border rounded-lg">
            {actions.map((action) => (
              <div key={action} className="flex items-center gap-2">
                <Checkbox
                  id={`action-${action}`}
                  checked={formData.actions.includes(action)}
                  onCheckedChange={() => toggleAction(action)}
                />
                <label htmlFor={`action-${action}`} className="text-sm cursor-pointer">
                  {action}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">{cargo ? "Actualizar" : "Crear"} Cargo</Button>
      </DialogFooter>
    </form>
  )
}
