import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Briefcase, Plus, Edit, Trash2, Search } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { useAuth } from "@/contexts/auth-context"
import { useSidebar } from "@/contexts/sidebar-context"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { notifyError, notifySuccess } from "@/lib/toast"
import { usePagination } from "@/hooks/usePagination"
import { PQRSFPagination } from "@/components/PQRSFPagination"
import { stakeholderService } from "@/services/stakeholder.service"
import type { StakeHolder } from "@/types/database"

type StakeholderFormValues = {
  name: string
}

const TABLE_HEAD_HEIGHT = 52
const ROW_HEIGHT = 56
const HEIGHT_BUFFER = 12
const ITEMS_PER_PAGE_MIN = 4

export default function Stakeholders() {
  const { user } = useAuth()
  const { isCollapsed } = useSidebar()
  const navigate = useNavigate()
  const tableContainerRef = useRef<HTMLDivElement>(null)

  const [stakeholders, setStakeholders] = useState<StakeHolder[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingStakeholder, setEditingStakeholder] = useState<StakeHolder | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    if (user && user.rol !== "Administrador") {
      navigate("/dashboard")
    }
  }, [user, navigate])

  useEffect(() => {
    const el = tableContainerRef.current
    if (!el) return

    const updateItemsPerPage = () => {
      const h = el.clientHeight
      if (h <= 0) return
      const available = h - TABLE_HEAD_HEIGHT - HEIGHT_BUFFER
      const rowsThatFit = Math.floor(available / ROW_HEIGHT)
      setItemsPerPage((prev) => {
        const next = Math.max(ITEMS_PER_PAGE_MIN, rowsThatFit)
        return next === prev ? prev : next
      })
    }

    updateItemsPerPage()
    const observer = new ResizeObserver(updateItemsPerPage)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let active = true
    const loadStakeholders = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await stakeholderService.getStateHolders()
        if (active) setStakeholders(data)
      } catch (err) {
        console.error("[admin-stakeholders] load error", err)
        if (active) setError("No pudimos cargar los stakeholders. Intenta nuevamente.")
      } finally {
        if (active) setIsLoading(false)
      }
    }
    loadStakeholders()
    return () => {
      active = false
    }
  }, [])

  const filteredStakeholders = stakeholders.filter((stakeholder) =>
    stakeholder.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const { currentPage, totalPages, paginatedItems, setCurrentPage } = usePagination({
    items: filteredStakeholders,
    itemsPerPage,
    dependencies: [searchTerm, itemsPerPage],
  })

  const handleCreateOrUpdate = async (formData: StakeholderFormValues) => {
    setIsSaving(true)
    setError(null)
    try {
      if (editingStakeholder) {
        const updated = await stakeholderService.updateStateHolder(editingStakeholder.id, { name: formData.name })
        setStakeholders((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
        notifySuccess("Stakeholder actualizado correctamente.")
      } else {
        const created = await stakeholderService.createStateHolder({ name: formData.name })
        setStakeholders((prev) => [...prev, created])
        notifySuccess("Stakeholder creado correctamente.")
      }
      setIsDialogOpen(false)
      setEditingStakeholder(null)
    } catch (err) {
      console.error("[admin-stakeholders] save error", err)
      setError("No pudimos guardar el stakeholder. Verifica los datos e intenta nuevamente.")
      notifyError("No pudimos guardar el stakeholder.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    setError(null)
    try {
      await stakeholderService.deleteStateHolder(id)
      setStakeholders((prev) => prev.filter((item) => item.id !== id))
      notifySuccess("Stakeholder eliminado correctamente.")
    } catch (err) {
      console.error("[admin-stakeholders] delete error", err)
      setError("No pudimos eliminar el stakeholder.")
      notifyError("No pudimos eliminar el stakeholder.")
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
          "flex-1 flex flex-col min-h-0 p-4 sm:p-6 lg:p-8 min-[1600px]:p-10 pt-14 md:pt-4 transition-all duration-300",
          "max-md:min-h-screen max-md:overflow-y-auto max-md:h-auto md:overflow-hidden",
          isCollapsed ? "lg:ml-24" : "lg:ml-64"
        )}
      >
        <div className="shrink-0 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl min-[1600px]:text-4xl font-bold text-foreground mb-1 sm:mb-2 min-[1600px]:mb-3">
                Gestión de Stakeholders
              </h1>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DialogTrigger asChild>
                    <Button
                      size="icon"
                      onClick={() => {
                        setEditingStakeholder(null)
                        setIsDialogOpen(true)
                      }}
                      className="shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Agregar nuevo stakeholder</p>
                </TooltipContent>
              </Tooltip>
              <DialogContent className="max-w-lg">
                <StakeholderForm
                  stakeholder={editingStakeholder}
                  isSaving={isSaving}
                  onSubmit={handleCreateOrUpdate}
                  onCancel={() => {
                    setIsDialogOpen(false)
                    setEditingStakeholder(null)
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
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>

        {error && <p className="shrink-0 mb-4 text-sm min-[1600px]:text-base text-destructive">{error}</p>}

        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <Card className="h-full flex flex-col min-h-0 overflow-hidden">
            <CardHeader className="shrink-0 py-3 sm:py-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg min-[1600px]:text-xl">
                <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 min-[1600px]:h-6 min-[1600px]:w-6" />
                Lista de Stakeholders ({filteredStakeholders.length})
              </CardTitle>
            </CardHeader>
            <CardContent ref={tableContainerRef} className="p-0 flex-1 min-h-0 overflow-hidden">
              <div className="overflow-x-auto min-h-0">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b sticky top-0 z-10">
                    <tr>
                      <th className="text-left p-3 sm:p-4 min-[1600px]:p-5 font-semibold text-xs sm:text-sm min-[1600px]:text-base">
                        Nombre
                      </th>
                      <th className="text-right p-3 sm:p-4 min-[1600px]:p-5 font-semibold text-xs sm:text-sm min-[1600px]:text-base">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td className="p-3 sm:p-4 min-[1600px]:p-5 text-sm min-[1600px]:text-base text-muted-foreground" colSpan={2}>
                          Cargando stakeholders...
                        </td>
                      </tr>
                    ) : paginatedItems.length === 0 ? (
                      <tr>
                        <td className="p-3 sm:p-4 min-[1600px]:p-5 text-sm min-[1600px]:text-base text-muted-foreground" colSpan={2}>
                          No hay stakeholders registrados.
                        </td>
                      </tr>
                    ) : (
                      paginatedItems.map((stakeholder) => (
                        <tr key={stakeholder.id} className="border-b hover:bg-muted/30 transition-colors">
                          <td className="p-3 sm:p-4 min-[1600px]:p-5">
                            <div className="font-medium text-sm sm:text-base min-[1600px]:text-lg">{stakeholder.name}</div>
                          </td>
                          <td className="p-3 sm:p-4 min-[1600px]:p-5">
                            <div className="flex items-center justify-end gap-2 min-[1600px]:gap-3">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingStakeholder(stakeholder)
                                  setIsDialogOpen(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDelete(stakeholder.id)}
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
              <PQRSFPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}

function StakeholderForm({
  stakeholder,
  isSaving,
  onSubmit,
  onCancel,
}: {
  stakeholder: StakeHolder | null
  isSaving: boolean
  onSubmit: (data: StakeholderFormValues) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(stakeholder?.name ?? "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ name: name.trim() })
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>{stakeholder ? "Editar Stakeholder" : "Crear nuevo stakeholder"}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="stakeholder-name">Nombre</Label>
          <Input
            id="stakeholder-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Guardando..." : stakeholder ? "Actualizar" : "Crear"} Stakeholder
        </Button>
      </DialogFooter>
    </form>
  )
}
