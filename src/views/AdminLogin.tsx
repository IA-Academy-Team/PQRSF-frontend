import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

export default function AdminLogin() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Side - Icon */}
        <div className="flex items-center justify-center bg-background p-8 lg:w-1/2">
          <div className="relative">
            <img
              src="/images/image.png"
              alt="Admin Login"
              className="drop-shadow-2xl w-40 h-40 sm:w-48 sm:h-48 lg:w-[200px] lg:h-[200px]"
            />
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex items-center justify-center bg-primary p-8 lg:w-1/2 lg:clip-diagonal">
          <div className="w-full max-w-md space-y-6">
            <div className="space-y-2 text-center text-primary-foreground">
              <h1 className="text-2xl sm:text-3xl font-bold">Admin Access</h1>
              <p className="text-primary-foreground/80 text-sm sm:text-base">Ingresa tus credenciales para continuar</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-primary-foreground">
                  Your email
                </Label>
                <Input id="email" type="email" placeholder="Enter your email" className="bg-white text-foreground" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-primary-foreground">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="bg-white text-foreground"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" className="border-primary-foreground bg-white" />
                  <label htmlFor="remember" className="text-sm text-primary-foreground cursor-pointer">
                    Remember me
                  </label>
                </div>
                <a href="#" className="text-sm text-primary-foreground/80 hover:text-primary-foreground underline">
                  Forgot password?
                </a>
              </div>

              <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
                SIGN IN
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
