import type React from "react"
import { useState, useEffect } from "react"
import { Users, Plus, Edit, Trash2, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sidebar } from "@/components/sidebar"
import { useAuth } from "@/contexts/auth-context"
import { useSidebar } from "@/contexts/sidebar-context"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HttpError } from "@/lib/api"
import { notifyError, notifySuccess } from "@/lib/toast"
import { areaService, type ResponsibleSummary } from "@/services/area.service"
import { authService } from "@/services/auth.service"
import { userService } from "@/services/user.service"
import type { Area, DBUser } from "@/types/database"

type ResponsableFormValues = {
  name: string
  email: string
  password: string
  phoneNumber: string
  areaId: number | null
}

const isAllowedResponsibleEmail = (email: string) => {
  const normalized = email.trim().toLowerCase()
  return (
    normalized.endsWith("@campuslands.com") ||
    normalized.endsWith("@fundacioncampuslands.com")
  )
}

export default function Usuarios() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { isCollapsed } = useSidebar()
  const [responsables, setResponsables] = useState<ResponsibleSummary[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingResponsable, setEditingResponsable] = useState<ResponsibleSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (user && user.rol !== "Administrador") {
      navigate("/dashboard")
    }
  }, [user, navigate])

  useEffect(() => {
    let active = true
    const loadData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const [responsablesData, areasData] = await Promise.all([
          areaService.getResponsiblesSummary(),
          areaService.getAll(),
        ])
        if (active) {
          setResponsables(responsablesData)
          setAreas(areasData)
        }
      } catch (err) {
        console.error("[admin-responsables] load error", err)
        if (active) {
          setError("No pudimos cargar los responsables. Intenta nuevamente.")
        }
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }
    loadData()
    return () => {
      active = false
    }
  }, [])

  const filteredResponsables = responsables.filter((responsable) => {
    const query = searchTerm.toLowerCase()
    return (
      (responsable.userName ?? "").toLowerCase().includes(query) ||
      (responsable.userEmail ?? "").toLowerCase().includes(query) ||
      (responsable.areaName ?? "").toLowerCase().includes(query)
    )
  })

  const handleCreateOrUpdate = async (formData: ResponsableFormValues) => {
    setIsSaving(true)
    setError(null)
    try {
      if (editingResponsable) {
        const updatedUser = await userService.update(editingResponsable.userId, {
          name: formData.name,
          email: formData.email,
          phoneNumber: formData.phoneNumber.trim() || null,
        })
        const updatedResponsable = await areaService.updateResponsible(editingResponsable.id, {
          areaId: formData.areaId ?? null,
        })
        const area = areas.find((item) => item.id === updatedResponsable.areaId) ?? null
        setResponsables((prev) =>
          prev.map((item) =>
            item.id === editingResponsable.id
              ? {
                  ...item,
                  userName: updatedUser.name ?? formData.name,
                  userEmail: updatedUser.email,
                  areaId: updatedResponsable.areaId ?? null,
                  areaName: area?.name ?? null,
                  areaCode: area?.code ?? null,
                }
              : item
          )
        )
      } else {
        if (!isAllowedResponsibleEmail(formData.email)) {
          const message =
            "El correo debe terminar en @campuslands.com o @fundacioncampuslands.com."
          setError(message)
          notifyError(message)
          return
        }

        let dbUser: DBUser | null = null
        try {
          dbUser = await userService.getByEmail(formData.email)
        } catch (err) {
          if (err instanceof HttpError && err.status === 404) {
            dbUser = null
          } else {
            throw err
          }
        }

        if (!dbUser) {
          await authService.register(
            formData.name,
            formData.email,
            formData.password,
            formData.phoneNumber
          )
          dbUser = await userService.getByEmail(formData.email)
        }
        if (!dbUser) {
          throw new Error("No se pudo crear el usuario del responsable.")
        }
        await userService.update(dbUser.id, {
          phoneNumber: formData.phoneNumber.trim() || null,
        })

        const createdResponsable = await areaService.createResponsible({
          userId: dbUser.id,
          areaId: formData.areaId ?? null,
        })
        const area = areas.find((item) => item.id === createdResponsable.areaId) ?? null
        setResponsables((prev) => [
          ...prev,
          {
            id: createdResponsable.id,
            userId: dbUser.id,
            areaId: createdResponsable.areaId ?? null,
            userName: dbUser.name ?? formData.name,
            userEmail: dbUser.email,
            userIsActive: dbUser.isActive ?? true,
            roleId: dbUser.roleId,
            areaName: area?.name ?? null,
            areaCode: area?.code ?? null,
            phoneNumber: formData.phoneNumber.trim() || null,
          },
        ])
      }
      notifySuccess(editingResponsable ? "Responsable actualizado correctamente." : "Responsable creado correctamente.")
      setIsDialogOpen(false)
      setEditingResponsable(null)
    } catch (err) {
      console.error("[admin-responsables] save error", err)
      notifyError("No pudimos guardar el responsable. Verifica los datos e intenta de nuevo.")
      setError("No pudimos guardar el responsable. Verifica los datos e intenta de nuevo.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleStatus = async (responsable: ResponsibleSummary) => {
    setError(null)
    try {
      const updated = await userService.updateStatus(responsable.userId)
      setResponsables((prev) =>
        prev.map((item) =>
          item.id === responsable.id ? { ...item, userIsActive: updated.isActive ?? item.userIsActive } : item
        )
      )
      notifySuccess("Estado del responsable actualizado.")
    } catch (err) {
      console.error("[admin-responsables] status error", err)
      notifyError("No pudimos actualizar el estado del responsable.")
      setError("No pudimos actualizar el estado del responsable.")
    }
  }

  const handleDelete = async (responsableId: number) => {
    setError(null)
    try {
      await areaService.deleteResponsible(responsableId)
      setResponsables((prev) => prev.filter((item) => item.id !== responsableId))
      notifySuccess("Responsable eliminado correctamente.")
    } catch (err) {
      console.error("[admin-responsables] delete error", err)
      notifyError("No pudimos eliminar el responsable.")
      setError("No pudimos eliminar el responsable.")
    }
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
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Gestión de Responsables</h1>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingResponsable(null)
                    setIsDialogOpen(true)
                  }}
                  className="w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Responsable
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <UserForm
                  responsable={editingResponsable}
                  areas={areas}
                  isSaving={isSaving}
                  onSubmit={handleCreateOrUpdate}
                  onCancel={() => {
                    setIsDialogOpen(false)
                    setEditingResponsable(null)
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <CardContent className="pb-6 px-0 mb-6">
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

        {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Lista de Responsables ({filteredResponsables.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="text-left p-4 font-semibold text-sm">Nombre</th>
                    <th className="text-left p-4 font-semibold text-sm">Correo</th>
                    <th className="text-left p-4 font-semibold text-sm">Área</th>
                    <th className="text-left p-4 font-semibold text-sm">Estado</th>
                    <th className="text-right p-4 font-semibold text-sm">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td className="p-4 text-sm text-muted-foreground" colSpan={5}>
                        Cargando responsables...
                      </td>
                    </tr>
                  ) : filteredResponsables.length === 0 ? (
                    <tr>
                      <td className="p-4 text-sm text-muted-foreground" colSpan={5}>
                        No hay responsables registrados.
                      </td>
                    </tr>
                  ) : (
                    filteredResponsables.map((responsable) => (
                      <tr key={responsable.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <div className="font-medium">{responsable.userName ?? "Sin nombre"}</div>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {responsable.userEmail ?? "Sin correo"}
                        </td>
                        <td className="p-4 text-sm">{responsable.areaName ?? "Sin área asignada"}</td>
                        <td className="p-4">
                          <button
                            onClick={() => handleToggleStatus(responsable)}
                            className={`text-xs font-medium px-2 py-1 rounded-full ${
                              responsable.userIsActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}
                          >
                            {responsable.userIsActive ? "activo" : "inactivo"}
                          </button>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingResponsable(responsable)
                                setIsDialogOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDelete(responsable.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
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
  responsable,
  areas,
  isSaving,
  onSubmit,
  onCancel,
}: {
  responsable: ResponsibleSummary | null
  areas: Area[]
  isSaving: boolean
  onSubmit: (data: ResponsableFormValues) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: responsable?.userName || "",
    email: responsable?.userEmail || "",
    password: "",
    areaId: responsable?.areaId ?? null,
    phoneNumber: responsable?.phoneNumber ?? "",
  })
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const name = formData.name.trim()
    const email = formData.email.trim()
    const password = formData.password
    const phoneNumber = formData.phoneNumber.trim()
    const areaId = formData.areaId

    if (!name) {
      const message = "El nombre completo es obligatorio."
      setFormError(message)
      notifyError(message)
      return
    }
    if (!email) {
      const message = "El correo electrónico es obligatorio."
      setFormError(message)
      notifyError(message)
      return
    }
    if (!responsable && !password.trim()) {
      const message = "La contraseña es obligatoria."
      setFormError(message)
      notifyError(message)
      return
    }
    if (!responsable && password.trim().length < 8) {
      const message = "La contraseña debe tener al menos 8 caracteres."
      setFormError(message)
      notifyError(message)
      return
    }
    if (!responsable && !phoneNumber) {
      const message = "El número de teléfono es obligatorio."
      setFormError(message)
      notifyError(message)
      return
    }
    if (!areaId) {
      const message = "Debe asignar un área."
      setFormError(message)
      notifyError(message)
      return
    }

    setFormError(null)
    onSubmit({
      name,
      email,
      password,
      phoneNumber,
      areaId,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>{responsable ? "Editar Responsable" : "Crear nuevo responsable"}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        {formError && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {formError}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre Completo</Label>
          <Input
            id="nombre"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Numero de telefono</Label>
          <Input
            id="phoneNumber"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            required={!responsable}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="correo">Correo Electrónico</Label>
          <Input
            id="correo"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        {!responsable && (
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="area">Área</Label>
          <Select
            value={formData.areaId ? String(formData.areaId) : "none"}
            onValueChange={(value) =>
              setFormData({ ...formData, areaId: value === "none" ? null : Number(value) })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione un área" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin área asignada</SelectItem>
              {areas.map((area) => (
                <SelectItem key={area.id} value={String(area.id)}>
                  {area.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Guardando..." : responsable ? "Actualizar" : "Crear"} Responsable
        </Button>
      </DialogFooter>
    </form>
  )
}
