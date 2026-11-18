import { createContext, useContext, useEffect, useState } from 'react'
import { seed } from '../data/seed'
import { hoje } from '../utils/format'
import { saldo, diasParaVencer, DIAS_VENCIMENTO } from '../utils/stock'

const Ctx = createContext(null)
const CHAVE = 'dear-v1'
const novoId = () => Date.now() + Math.floor(Math.random() * 1000)

/*
  Camada de dados do protótipo (guarda tudo no localStorage).
  Cada função em "acoes" vai virar uma chamada de API no backend.
  As que retornam string = mensagem de erro; null = deu certo.
*/
export function StoreProvider({ children }) {
  const [db, setDb] = useState(() => {
    try {
      const s = localStorage.getItem(CHAVE)
      if (s) return JSON.parse(s)
    } catch { /* ignora */ }
    return seed()
  })

  useEffect(() => {
    try { localStorage.setItem(CHAVE, JSON.stringify(db)) } catch { /* ignora */ }
  }, [db])

  const acoes = {
    resetar: () => setDb(seed()),

    // RF-07, 09, 10
    salvarProduto(dados, id) {
      const codigo = dados.codigo.trim().toUpperCase()
      const nome = dados.nome.trim()
      if (!codigo || !nome || dados.custo === '' || dados.preco === '') return 'Preencha código, nome e preços.'
      if (db.produtos.some((p) => p.id !== id && (p.codigo === codigo || p.nome.toLowerCase() === nome.toLowerCase())))
        return 'Produto já cadastrado (mesmo código ou nome).'
      const reg = { codigo, nome, cat: dados.cat, un: dados.un || 'un', custo: +dados.custo, preco: +dados.preco, min: +dados.min, val: dados.val }
      setDb((d) => ({
        ...d,
        produtos: id
          ? d.produtos.map((p) => (p.id === id ? { ...p, ...reg } : p))
          : [...d.produtos, { id: novoId(), ativo: true, ...reg }],
      }))
      return null
    },
    alternarProduto: (id) =>
      setDb((d) => ({ ...d, produtos: d.produtos.map((p) => (p.id === id ? { ...p, ativo: !p.ativo } : p)) })),

    // RF-08
    addCategoria(nome) {
      const n = nome.trim()
      if (!n) return 'Informe o nome.'
      if (db.cats.some((c) => c.toLowerCase() === n.toLowerCase())) return 'Categoria já existe.'
      setDb((d) => ({ ...d, cats: [...d.cats, n] }))
      return null
    },

    // RF-14, 15, 16, 17, 22
    registrarMov({ tipo, produto, qtd, valor, user, liberadoPor }) {
      if (!(qtd > 0)) return 'Informe uma quantidade válida.'
      if (tipo === 'S') {
        const s = saldo(db.movs, produto.id)
        if (qtd > s) return `Saída bloqueada: restam apenas ${s} unidades de ${produto.nome}.`
        const v = diasParaVencer(produto)
        if (v !== null && v <= DIAS_VENCIMENTO && !liberadoPor)
          return 'Produto próximo da validade: é necessária a liberação do gerente.'
      }
      // No backend esta operação precisa ser atômica (RNF-05)
      setDb((d) => ({
        ...d,
        movs: [...d.movs, { id: novoId(), tipo, pid: produto.id, qtd, valor, data: hoje(), user, aut: liberadoPor || '' }],
      }))
      return null
    },

    // RF-25, 28
    addDespesa(x) {
      if (!x.desc.trim() || !(+x.valor > 0) || !x.venc) return 'Preencha descrição, valor e vencimento.'
      setDb((d) => ({ ...d, desp: [...d.desp, { id: novoId(), desc: x.desc.trim(), cat: x.cat, valor: +x.valor, venc: x.venc, pago: false }] }))
      return null
    },
    pagarDespesa: (id) =>
      setDb((d) => ({ ...d, desp: d.desp.map((x) => (x.id === id ? { ...x, pago: true } : x)) })),

    // RF-02, 03, 04
    addUsuario(u) {
      if (!u.nome.trim() || !u.login.trim() || !u.senha) return 'Preencha nome, login e senha.'
      if (db.users.some((x) => x.login === u.login.trim())) return 'Login já existe.'
      setDb((d) => ({ ...d, users: [...d.users, { id: novoId(), nome: u.nome.trim(), cargo: u.cargo.trim(), login: u.login.trim(), senha: u.senha, perfil: u.perfil, ativo: true }] }))
      return null
    },
    alternarUsuario: (id) =>
      setDb((d) => ({ ...d, users: d.users.map((u) => (u.id === id ? { ...u, ativo: !u.ativo } : u)) })),
  }

  return <Ctx.Provider value={{ db, ...acoes }}>{children}</Ctx.Provider>
}

export const useStore = () => useContext(Ctx)
