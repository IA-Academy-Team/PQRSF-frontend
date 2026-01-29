import type React from "react"
import { useState, useEffect } from "react"
import { Briefcase, Plus, Edit, Trash2, Search } from "lucide-react"
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
import { areaService } from "@/services/area.service"
import type { Area } from "@/types/database"
import { notifyError, notifySuccess } from "@/lib/toast"
import { ITEMS_PER_PAGE } from "@/lib/pqrsf-utils"
import { usePagination } from "@/hooks/usePagination"
import { PQRSFPagination } from "@/components/PQRSFPagination"

export default function Areas() {
  const { user } = useAuth()
  const { isCollapsed } = useSidebar()
  const navigate = useNavigate()
  const [areas, setAreas] = useState<Area[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingArea, setEditingArea] = useState<Area | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user && user.rol !== "Administrador") {
      navigate("/dashboard")
    }
  }, [user, navigate])

  useEffect(() => {
    let active = true
    const loadAreas = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await areaService.getAll()
        if (active) {
          setAreas(data)
        }
      } catch (err) {
        console.error("[admin-areas] load error", err)
        if (active) {
          setError("No pudimos cargar las áreas. Intenta nuevamente.")
        }
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }
    loadAreas()
    return () => {
      active = false
    }
  }, [])

  const filteredAreas = areas.filter((area) => {
    const query = searchTerm.toLowerCase()
    return area.name.toLowerCase().includes(query) || (area.code ?? "").toLowerCase().includes(query)
  })

  const { currentPage, totalPages, paginatedItems, setCurrentPage } = usePagination({
    items: filteredAreas,
    itemsPerPage: ITEMS_PER_PAGE,
    dependencies: [searchTerm],
  })

  const handleCreateOrUpdate = async (formData: Partial<Area>) => {
    try {
        if (editingArea) {
        const nextCode = formData.code?.trim()
        const updated = await areaService.update(editingArea.id, {
          name: formData.name ?? editingArea.name,
          code: nextCode ? nextCode : null,
          description: formData.description?.trim() || null,
        })
        setAreas((prev) => prev.map((area) => (area.id === updated.id ? updated : area)))
        } else {
        const nextCode = formData.code?.trim()
        const created = await areaService.create({
          name: formData.name ?? "",
          code: nextCode ? nextCode : null,
          description: formData.description?.trim() || null,
        })
        setAreas((prev) => [...prev, created])
        }
        notifySuccess(editingArea ? "Área actualizada correctamente." : "Área creada correctamente.")
        setIsDialogOpen(false)
        setEditingArea(null)
      } catch (err) {
        console.error("[admin-areas] save error", err)
        notifyError("No pudimos guardar el área. Revisa los datos e intenta de nuevo.")
        setError("No pudimos guardar el área. Revisa los datos e intenta de nuevo.")
      }
  }

  const handleDelete = async (id: number) => {
    try {
      await areaService.delete(id)
      setAreas((prev) => prev.filter((area) => area.id !== id))
      notifySuccess("Área eliminada correctamente.")
    } catch (err) {
      console.error("[admin-areas] delete error", err)
      notifyError("No pudimos eliminar el área.")
      setError("No pudimos eliminar el área.")
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
              <h1 className="text-xl sm:text-2xl lg:text-3xl min-[1600px]:text-4xl font-bold text-foreground mb-1 sm:mb-2 min-[1600px]:mb-3">Gestión de Áreas</h1>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DialogTrigger asChild>
                    <Button
                      size="icon"
                      onClick={() => {
                        setEditingArea(null)
                        setIsDialogOpen(true)
                      }}
                      className="shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Agregar nueva área</p>
                </TooltipContent>
              </Tooltip>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <AreaForm
                  area={editingArea}
                  onSubmit={handleCreateOrUpdate}
                  onCancel={() => {
                    setIsDialogOpen(false)
                    setEditingArea(null)
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

          <CardContent className="shrink-0 pb-4 sm:pb-6 px-0 mb-4 sm:mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>

        {error && <p className="shrink-0 mb-4 text-sm min-[1600px]:text-base text-destructive">{error}</p>}

        <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <CardHeader className="shrink-0 py-3 sm:py-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg min-[1600px]:text-xl">
              <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 min-[1600px]:h-6 min-[1600px]:w-6" />
              Lista de Áreas ({filteredAreas.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 min-h-0 overflow-auto">
            <div className="overflow-x-auto min-h-0">
              <table className="w-full">
                <thead className="bg-muted/50 border-b sticky top-0 z-10">
                  <tr>
                    <th className="text-left p-3 sm:p-4 min-[1600px]:p-5 font-semibold text-xs sm:text-sm min-[1600px]:text-base">Nombre</th>
                    <th className="text-left p-3 sm:p-4 min-[1600px]:p-5 font-semibold text-xs sm:text-sm min-[1600px]:text-base">Código</th>
                    <th className="text-left p-3 sm:p-4 min-[1600px]:p-5 font-semibold text-xs sm:text-sm min-[1600px]:text-base">Descripción</th>
                    <th className="text-right p-3 sm:p-4 min-[1600px]:p-5 font-semibold text-xs sm:text-sm min-[1600px]:text-base">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td className="p-3 sm:p-4 min-[1600px]:p-5 text-sm min-[1600px]:text-base text-muted-foreground" colSpan={4}>
                        Cargando áreas...
                      </td>
                    </tr>
                  ) : paginatedItems.length === 0 ? (
                    <tr>
                      <td className="p-3 sm:p-4 min-[1600px]:p-5 text-sm min-[1600px]:text-base text-muted-foreground" colSpan={4}>
                        No hay áreas registradas.
                      </td>
                    </tr>
                  ) : (
                    paginatedItems.map((area) => (
                      <tr key={area.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-3 sm:p-4 min-[1600px]:p-5">
                          <div className="font-medium text-sm sm:text-base min-[1600px]:text-lg">{area.name}</div>
                        </td>
                        <td className="p-3 sm:p-4 min-[1600px]:p-5 text-xs sm:text-sm min-[1600px]:text-base text-muted-foreground">
                          {area.code ?? "Sin código"}
                        </td>
                        <td className="p-3 sm:p-4 min-[1600px]:p-5 text-xs sm:text-sm min-[1600px]:text-base text-muted-foreground max-w-xs truncate" title={area.description ?? undefined}>
                          {area.description?.trim() || "Sin descripción"}
                        </td>
                        <td className="p-3 sm:p-4 min-[1600px]:p-5">
                          <div className="flex items-center justify-end gap-2 min-[1600px]:gap-3">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingArea(area)
                                setIsDialogOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDelete(area.id)}
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
      </main>
    </div>
  )
}

function AreaForm({
  area,
  onSubmit,
  onCancel,
}: {
  area: Area | null
  onSubmit: (data: Partial<Area>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: area?.name || "",
    code: area?.code || "",
    description: area?.description || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>{area ? "Editar Área" : "Crear Nueva Área"}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre del Área</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="code">Código (opcional)</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Descripción (opcional)</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">{area ? "Actualizar" : "Crear"} Área</Button>
      </DialogFooter>
    </form>
  )
}
