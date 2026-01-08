import { User, Mail, Lock, UserCircle } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sidebar } from "@/components/sidebar"

export default function Register() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 lg:ml-64 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 sm:mb-8 flex flex-col gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Registrar Nuevo Usuario
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Complete el formulario para dar de alta a un nuevo miembro en el sistema.
              </p>
            </div>
          </div>

          <Card className="shadow-lg">
            <CardHeader className="bg-muted/30 border-b p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 rounded-lg p-2 sm:p-3">
                  <UserCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg lg:text-xl font-semibold">Información del Usuario</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Ingrese los datos personales y de acceso para el nuevo usuario.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <form className="space-y-5 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium">
                      Nombre de Usuario
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="username" placeholder="ej. Juan Perez" className="pl-10 h-10 md:h-11" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="codigo" className="text-sm font-medium">
                      Código de la Persona
                    </Label>
                    <div className="relative">
                      <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="codigo" placeholder="ej. EMP-2023-001" className="pl-10 h-10 md:h-11" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Correo Electrónico
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="ej. juan.perez@campuslands.com"
                      className="pl-10 h-10 md:h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo" className="text-sm font-medium">
                    Tipo de Persona
                  </Label>
                  <Select>
                    <SelectTrigger id="tipo" className="h-10 md:h-11">
                      <SelectValue placeholder="Seleccione un rol..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="camper">Camper</SelectItem>
                      <SelectItem value="trainer">Trainer</SelectItem>
                      <SelectItem value="admin">Administrativo</SelectItem>
                      <SelectItem value="empresa">Empresa</SelectItem>
                      <SelectItem value="padre">Padre de Familia</SelectItem>
                      <SelectItem value="aliado">Aliado Estratégico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Contraseña
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="password" type="password" placeholder="••••••••" className="pl-10 h-10 md:h-11" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-sm font-medium">
                      Confirmar Contraseña
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10 h-10 md:h-11"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
                  <Button type="button" variant="outline" className="flex-1 w-full h-10 md:h-11 bg-transparent">
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1 w-full h-10 md:h-11">
                    <User className="h-4 w-4 mr-2" />
                    Registrar Usuario
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
