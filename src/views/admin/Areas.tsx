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
import { areaService } from "@/services/area.service"
import type { Area } from "@/types/database"
import { notifyError, notifySuccess } from "@/lib/toast"

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
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Gestión de Áreas</h1>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingArea(null)
                    setIsDialogOpen(true)
                  }}
                  className="w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Área
                </Button>
              </DialogTrigger>
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

          <CardContent className="pb-6 px-0 mb-6">
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

        {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando áreas...</p>
          ) : filteredAreas.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay áreas registradas.</p>
          ) : (
            filteredAreas.map((area) => (
              <Card key={area.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 rounded-lg p-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{area.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">Código: {area.code ?? "Sin código"}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {area.description?.trim() || "Sin descripción"}
                  </p>
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingArea(area)
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
                      onClick={() => handleDelete(area.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            ))
          )}
        </div>
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
