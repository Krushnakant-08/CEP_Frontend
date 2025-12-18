import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import Login from './pages/login.jsx'
import Register from './pages/register.jsx'
import Dashboard from './pages/dashboard.jsx'
import Profile from './pages/profile.jsx'
import Orders from './pages/orders.jsx'
import Help from './pages/help.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/help" element={<Help />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
