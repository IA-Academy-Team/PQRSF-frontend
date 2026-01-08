import type React from "react"
import { useState, useEffect } from "react"
import { Users, Plus, Edit, Trash2, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sidebar } from "@/components/sidebar"
import { useAuth } from "@/contexts/auth-context"
import { useNavigate } from "react-router-dom"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { User, UserRole, UserArea } from "@/types"

export default function Usuarios() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [usuarios, setUsuarios] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  useEffect(() => {
    if (user && user.rol !== "Administrador") {
      navigate("/dashboard")
    }
  }, [user, navigate])

  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: "1",
        nombre: "Administrador Principal",
        correo: "admin@campuslands.com",
        password: "admin123",
        rol: "Administrador",
        estado: "activo",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      },
      {
        id: "2",
        nombre: "Juan Pérez",
        correo: "area@campuslands.com",
        password: "area123",
        rol: "Usuario de Área Responsable",
        area: "Área Responsable (Operativa)",
        cargo: "Analista Senior",
        estado: "activo",
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-15"),
      },
    ]
    setUsuarios(mockUsers)
  }, [])

  const filteredUsuarios = usuarios.filter(
    (u) =>
      u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.correo.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreateOrUpdate = (formData: Partial<User>) => {
    if (editingUser) {
      setUsuarios(usuarios.map((u) => (u.id === editingUser.id ? { ...u, ...formData, updatedAt: new Date() } : u)))
    } else {
      const newUser: User = {
        id: Date.now().toString(),
        nombre: formData.nombre!,
        correo: formData.correo!,
        password: formData.password!,
        rol: formData.rol!,
        area: formData.area,
        cargo: formData.cargo,
        estado: "activo",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setUsuarios([...usuarios, newUser])
    }
    setIsDialogOpen(false)
    setEditingUser(null)
  }

  const handleToggleStatus = (id: string) => {
    setUsuarios(
      usuarios.map((u) => (u.id === id ? { ...u, estado: u.estado === "activo" ? "inactivo" : "activo" } : u)),
    )
  }

  if (!user || user.rol !== "Administrador") {
    return null
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 lg:ml-64 overflow-y-auto min-h-screen">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Gestión de Usuarios</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Crea, edita y gestiona usuarios con sus roles y cargos
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingUser(null)
                    setIsDialogOpen(true)
                  }}
                  className="w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Usuario
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <UserForm
                  user={editingUser}
                  onSubmit={handleCreateOrUpdate}
                  onCancel={() => {
                    setIsDialogOpen(false)
                    setEditingUser(null)
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
                placeholder="Buscar por nombre o correo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Lista de Usuarios ({filteredUsuarios.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="text-left p-4 font-semibold text-sm">Nombre</th>
                    <th className="text-left p-4 font-semibold text-sm">Correo</th>
                    <th className="text-left p-4 font-semibold text-sm">Rol</th>
                    <th className="text-left p-4 font-semibold text-sm">Área</th>
                    <th className="text-left p-4 font-semibold text-sm">Cargo</th>
                    <th className="text-left p-4 font-semibold text-sm">Estado</th>
                    <th className="text-right p-4 font-semibold text-sm">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsuarios.map((usuario) => (
                    <tr key={usuario.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="font-medium">{usuario.nombre}</div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{usuario.correo}</td>
                      <td className="p-4">
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                          {usuario.rol}
                        </span>
                      </td>
                      <td className="p-4 text-sm">{usuario.area || "N/A"}</td>
                      <td className="p-4 text-sm">
                        {usuario.cargo ? (
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                            {usuario.cargo}
                          </span>
                        ) : (
                          "Sin cargo"
                        )}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleStatus(usuario.id)}
                          className={`text-xs font-medium px-2 py-1 rounded-full ${
                            usuario.estado === "activo" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}
                        >
                          {usuario.estado}
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingUser(usuario)
                              setIsDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setUsuarios(usuarios.filter((u) => u.id !== usuario.id))}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

function UserForm({
  user,
  onSubmit,
  onCancel,
}: {
  user: User | null
  onSubmit: (data: Partial<User>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    nombre: user?.nombre || "",
    correo: user?.correo || "",
    password: user?.password || "",
    rol: (user?.rol || "Administrador") as UserRole,
    area: (user?.area || "Administración del Sistema") as UserArea,
    cargo: user?.cargo || "none",
  })

  const cargosDisponibles = ["Analista Senior", "Supervisor de Servicio", "Coordinador", "Asistente"]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const submitData = {
      ...formData,
      cargo: formData.cargo === "none" ? undefined : formData.cargo,
    }
    onSubmit(submitData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>{user ? "Editar Usuario" : "Crear Nuevo Usuario"}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre Completo</Label>
          <Input
            id="nombre"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="correo">Correo Electrónico</Label>
          <Input
            id="correo"
            type="email"
            value={formData.correo}
            onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required={!user}
            placeholder={user ? "Dejar en blanco para mantener" : ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rol">Rol</Label>
          <Select value={formData.rol} onValueChange={(value) => setFormData({ ...formData, rol: value as UserRole })}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccione un rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Administrador">Administrador</SelectItem>
              <SelectItem value="Usuario de Área Responsable">Usuario de Área Responsable</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {formData.rol !== "Administrador" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="area">Área</Label>
              <Select
                value={formData.area}
                onValueChange={(value) => setFormData({ ...formData, area: value as UserArea })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un área" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Administración del Sistema">Administración del Sistema</SelectItem>
                  <SelectItem value="Área Responsable (Operativa)">Área Responsable (Operativa)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cargo">Cargo (Opcional)</Label>
              <Select value={formData.cargo} onValueChange={(value) => setFormData({ ...formData, cargo: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un cargo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin cargo asignado</SelectItem>
                  {cargosDisponibles.map((cargo) => (
                    <SelectItem key={cargo} value={cargo}>
                      {cargo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">{user ? "Actualizar" : "Crear"} Usuario</Button>
      </DialogFooter>
    </form>
  )
}
