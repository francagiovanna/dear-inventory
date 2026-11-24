import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { StoreProvider } from './context/StoreContext'
import { AuthProvider } from './context/AuthContext'
import './styles.css'

// Tema claro por padrão; a escolha do usuário fica salva no navegador
try {
  document.documentElement.dataset.theme = localStorage.getItem('dear-tema') || 'light'
} catch {
  document.documentElement.dataset.theme = 'light'
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <StoreProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </StoreProvider>
    </BrowserRouter>
  </React.StrictMode>
)