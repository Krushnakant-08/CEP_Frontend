import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/login.jsx'
import XeroxLogin from './pages/xeroxLogin.jsx'
import XeroxRegister from './pages/xeroxRegister.jsx'
import XeroxDashboard from './pages/xeroxDashboard.jsx'
import Register from './pages/register.jsx'
import Dashboard from './pages/dashboard.jsx'
import Profile from './pages/profile.jsx'
import Orders from './pages/orders.jsx'
import Help from './pages/help.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/xerox-login" element={<XeroxLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/xerox-register" element={<XeroxRegister />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/xerox-dashboard" element={<ProtectedRoute><XeroxDashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
