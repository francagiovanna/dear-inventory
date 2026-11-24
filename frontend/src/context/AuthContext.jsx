import { createContext, useContext, useState } from 'react'
import { useStore } from './StoreContext'

const Ctx = createContext(null)

export function AuthProvider({ children }) {
  const { db } = useStore()
  const [userId, setUserId] = useState(null)
  const user = db.users.find((u) => u.id === userId && u.ativo) || null

  // O login não diferencia maiúsculas de minúsculas (contas novas usam o e-mail como login).
  function entrar(login, senha) {
    const l = login.trim().toLowerCase()
    const u = db.users.find((x) => x.login.toLowerCase() === l && x.senha === senha && x.ativo)
    if (!u) return false
    setUserId(u.id)
    return true
  }

  const sair = () => setUserId(null)

  return <Ctx.Provider value={{ user, entrar, sair }}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)