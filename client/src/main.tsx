import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import './global.css'
import Home from './pages/Home'
import Login from './pages/Login'
import Layout from './components/Layout'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path='/' element={<Layout />}>
          <Route index element={<Home />} />
          <Route path='login' element={<Login />} />
        </Route>
      </Routes>
    </Router>
  </StrictMode>,
)
