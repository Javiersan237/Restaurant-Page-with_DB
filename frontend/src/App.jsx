import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import { AuthProvider } from './context/AuthContext'

// Páginas públicas
import HomePage from './pages/HomePage'
import MenuPage from './pages/MenuPage'
import ReservarPage from './pages/ReservarPage'
import ConfirmacionPage from './pages/ConfirmacionPage'
import NotFoundPage from './pages/NotFoundPage'

// Páginas de autenticación
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AdminLoginPage from './pages/AdminLoginPage'

// Páginas protegidas
import MiCuentaPage from './pages/MiCuentaPage'
import AdminPage from './pages/AdminPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Rutas públicas */}
            <Route index element={<HomePage />} />
            <Route path="menu" element={<MenuPage />} />
            <Route
              path="reservar"
              element={
                <ProtectedRoute rolRequerido="cliente">
                  <ReservarPage />
                </ProtectedRoute>
              }
            />
            <Route path="confirmacion/:id" element={<ConfirmacionPage />} />

            {/* Rutas de autenticación */}
            <Route path="login" element={<LoginPage />} />
            <Route path="registro" element={<RegisterPage />} />
            <Route path="admin/login" element={<AdminLoginPage />} />

            {/* Rutas protegidas de cliente */}
            <Route
              path="mi-cuenta"
              element={
                <ProtectedRoute rolRequerido="cliente">
                  <MiCuentaPage />
                </ProtectedRoute>
              }
            />

            {/* Rutas protegidas de admin */}
            <Route
              path="admin"
              element={
                <AdminRoute>
                  <AdminPage />
                </AdminRoute>
              }
            />

            {/* Ruta 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App