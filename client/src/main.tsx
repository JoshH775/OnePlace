import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import './global.css'
import Home from './pages/Home'
import Login from './pages/Login'
import Layout from './components/Layout'
import { AuthProvider } from './components/AuthProvider'
import ProtectedRoute from './components/ProtectedRoute'
import Albums from './pages/Albums'
import Settings from './pages/Settings'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
    <Router>
      <Routes>
        <Route path='/' element={<ProtectedRoute element={<Layout />} />}>
          <Route path='/' element={<Home/>} />
          <Route path='/albums' element={<Albums />} />
          <Route path='/settings' element={<Settings />} />
        </Route>
        <Route path='/login' element={<Login />} />
      </Routes>
    </Router>
    </AuthProvider>

  </StrictMode>,
)
