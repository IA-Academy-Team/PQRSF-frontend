import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/auth-context'
import LoginPage from '@/views/LoginPage'
import Dashboard from '@/views/Dashboard'
import PQRSFList from '@/views/PQRSFList'
import PQRSFDetail from '@/views/PQRSFDetail'
import ForgotPassword from '@/views/ForgotPassword'
import ResetPassword from '@/views/ResetPassword'
import Register from '@/views/Register'
import AdminLogin from '@/views/AdminLogin'
import AnalisisPendientes from '@/views/AnalisisPendientes'
import Apelaciones from '@/views/Apelaciones'
import Cargos from '@/views/Cargos'
import Cerradas from '@/views/Cerradas'
import Chats from '@/views/Chats'
import EnApelacion from '@/views/EnApelacion'
import Seguimiento from '@/views/Seguimiento'
import Usuarios from '@/views/Usuarios'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
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
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
