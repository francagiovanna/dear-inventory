import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { MENU } from './config/menu'
import Layout from './components/Layout'
import Login from './pages/Login'
import Painel from './pages/Painel'
import Produtos from './pages/Produtos'
import Estoque from './pages/Estoque'
import Financeiro from './pages/Financeiro'
import Relatorios from './pages/Relatorios'
import Usuarios from './pages/Usuarios'

const PAGINAS = {
  '/': <Painel />,
  '/produtos': <Produtos />,
  '/estoque': <Estoque />,
  '/financeiro': <Financeiro />,
  '/relatorios': <Relatorios />,
  '/usuarios': <Usuarios />,
}

// Bloqueia rota sem login ou sem o perfil certo (RF-01, RF-05).
// ATENÇÃO: no sistema real, essa checagem também precisa existir no servidor (RNF-04).
function Protegida({ perfis, children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (perfis && !perfis.includes(user.perfil)) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Protegida><Layout /></Protegida>}>
        {MENU.map((m) => (
          <Route
            key={m.to}
            path={m.to}
            element={<Protegida perfis={m.perfis}>{PAGINAS[m.to]}</Protegida>}
          />
        ))}
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
