import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/auth-context'
import { SidebarProvider } from '@/contexts/sidebar-context'
// Login views
import LoginPage from '@/views/login/LoginPage'
import Register from '@/views/login/Register'
import ForgotPassword from '@/views/login/ForgotPassword'
import ResetPassword from '@/views/ResetPassword'
// Admin views
import Dashboard from '@/views/admin/Dashboard'
import PQRSFList from '@/views/admin/PQRSFList'
import PQRSFDetail from '@/views/admin/PQRSFDetail'
import Seguimiento from '@/views/admin/Seguimiento'
import EnApelacion from '@/views/admin/EnApelacion'
import Cerradas from '@/views/admin/Cerradas'
import Chats from '@/views/admin/Chats'
import Usuarios from '@/views/admin/responsables'
import Cargos from '@/views/admin/cargos'
// Area Responsable views
import AnalisisPendientes from '@/views/areaResponsable/AnalisisPendientes'
import Apelaciones from '@/views/areaResponsable/Apelaciones'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SidebarProvider>
          <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pqrsf" element={<PQRSFList />} />
          <Route path="/pqrsf/:id" element={<PQRSFDetail />} />
          <Route path="/analisis-pendientes" element={<AnalisisPendientes />} />
          <Route path="/apelaciones" element={<Apelaciones />} />
          <Route path="/cargos" element={<Cargos />} />
          <Route path="/cerradas" element={<Cerradas />} />
          <Route path="/chats" element={<Chats />} />
          <Route path="/en-apelacion" element={<EnApelacion />} />
          <Route path="/seguimiento" element={<Seguimiento />} />
          <Route path="/responsables" element={<Usuarios />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SidebarProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
