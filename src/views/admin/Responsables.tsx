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
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HttpError } from "@/lib/api"
import { notifyError, notifySuccess } from "@/lib/toast"
import { areaService, type ResponsibleSummary } from "@/services/area.service"
import { usePagination } from "@/hooks/usePagination"
import { PQRSFPagination } from "@/components/PQRSFPagination"
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
  const [areaFilterId, setAreaFilterId] = useState<string>("todas")
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
    const matchesSearch =
      (responsable.userName ?? "").toLowerCase().includes(query) ||
      (responsable.userEmail ?? "").toLowerCase().includes(query) ||
      (responsable.areaName ?? "").toLowerCase().includes(query)
    const matchesArea =
      areaFilterId === "todas" || responsable.areaId === Number(areaFilterId)
    return matchesSearch && matchesArea
  })

  const ITEMS_PER_PAGE = 10
  const { currentPage, totalPages, paginatedItems, setCurrentPage } = usePagination({
    items: filteredResponsables,
    itemsPerPage: ITEMS_PER_PAGE,
    dependencies: [searchTerm, areaFilterId],
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
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />

      <main
        className={cn(
          "flex-1 flex flex-col min-h-0 p-4 sm:p-6 lg:p-8 min-[1600px]:p-10 transition-all duration-300 overflow-hidden",
          isCollapsed ? "lg:ml-24" : "lg:ml-64"
        )}
      >
        <div className="shrink-0 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl min-[1600px]:text-4xl font-bold text-foreground mb-1 sm:mb-2 min-[1600px]:mb-3">Gestión de Responsables</h1>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DialogTrigger asChild>
                    <Button
                      size="icon"
                      onClick={() => {
                        setEditingResponsable(null)
                        setIsDialogOpen(true)
                      }}
                      className="shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Agregar nuevo responsable</p>
                </TooltipContent>
              </Tooltip>
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

        <CardContent className="shrink-0 pb-4 sm:pb-6 px-0 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o correo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={areaFilterId} onValueChange={setAreaFilterId}>
              <SelectTrigger className="w-full sm:w-56">
                <SelectValue placeholder="Filtrar por área" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las áreas</SelectItem>
                {areas.map((area) => (
                  <SelectItem key={area.id} value={String(area.id)}>
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>

        {error && <p className="shrink-0 mb-4 text-sm min-[1600px]:text-base text-destructive">{error}</p>}

        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <Card className="h-full flex flex-col min-h-0 overflow-hidden">
            <CardHeader className="shrink-0 py-3 sm:py-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg min-[1600px]:text-xl">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 min-[1600px]:h-6 min-[1600px]:w-6" />
                Lista de Responsables ({filteredResponsables.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 min-h-0 overflow-auto">
              <div className="overflow-x-auto min-h-0">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b sticky top-0 z-10">
                    <tr>
                      <th className="text-left p-3 sm:p-4 min-[1600px]:p-5 font-semibold text-xs sm:text-sm min-[1600px]:text-base">Nombre</th>
                      <th className="text-left p-3 sm:p-4 min-[1600px]:p-5 font-semibold text-xs sm:text-sm min-[1600px]:text-base">Correo</th>
                      <th className="text-left p-3 sm:p-4 min-[1600px]:p-5 font-semibold text-xs sm:text-sm min-[1600px]:text-base">Área</th>
                      <th className="text-left p-3 sm:p-4 min-[1600px]:p-5 font-semibold text-xs sm:text-sm min-[1600px]:text-base">Estado</th>
                      <th className="text-right p-3 sm:p-4 min-[1600px]:p-5 font-semibold text-xs sm:text-sm min-[1600px]:text-base">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td className="p-3 sm:p-4 min-[1600px]:p-5 text-sm min-[1600px]:text-base text-muted-foreground" colSpan={5}>
                          Cargando responsables...
                        </td>
                      </tr>
                    ) : paginatedItems.length === 0 ? (
                      <tr>
                        <td className="p-3 sm:p-4 min-[1600px]:p-5 text-sm min-[1600px]:text-base text-muted-foreground" colSpan={5}>
                          No hay responsables registrados.
                        </td>
                      </tr>
                    ) : (
                      paginatedItems.map((responsable) => (
                      <tr key={responsable.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-3 sm:p-4 min-[1600px]:p-5">
                          <div className="font-medium text-sm sm:text-base min-[1600px]:text-lg">{responsable.userName ?? "Sin nombre"}</div>
                        </td>
                        <td className="p-3 sm:p-4 min-[1600px]:p-5 text-xs sm:text-sm min-[1600px]:text-base text-muted-foreground">
                          {responsable.userEmail ?? "Sin correo"}
                        </td>
                        <td className="p-3 sm:p-4 min-[1600px]:p-5 text-xs sm:text-sm min-[1600px]:text-base">{responsable.areaName ?? "Sin área asignada"}</td>
                        <td className="p-3 sm:p-4 min-[1600px]:p-5">
                          <button
                            onClick={() => handleToggleStatus(responsable)}
                            className={`text-xs min-[1600px]:text-sm font-medium px-2 py-1 rounded-full ${
                              responsable.userIsActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}
                          >
                            {responsable.userIsActive ? "activo" : "inactivo"}
                          </button>
                        </td>
                        <td className="p-3 sm:p-4 min-[1600px]:p-5">
                          <div className="flex items-center justify-end gap-2 min-[1600px]:gap-3">
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
            <div className="shrink-0 border-t border-border p-3 sm:p-4">
              <PQRSFPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </Card>
        </div>
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
