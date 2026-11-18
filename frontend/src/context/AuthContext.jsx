import { createContext, useContext, useState } from 'react'
import { useStore } from './StoreContext'

const Ctx = createContext(null)

export function AuthProvider({ children }) {
  const { db } = useStore()
  const [userId, setUserId] = useState(null)
  const user = db.users.find((u) => u.id === userId && u.ativo) || null

  function entrar(login, senha) {
    const u = db.users.find((x) => x.login === login.trim() && x.senha === senha && x.ativo)
    if (!u) return false
    setUserId(u.id)
    return true
  }

  const sair = () => setUserId(null)

  return <Ctx.Provider value={{ user, entrar, sair }}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
