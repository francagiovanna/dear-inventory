import { createContext, useContext, useEffect, useState } from 'react'
import { seed } from '../data/seed'
import { hoje } from '../utils/format'
import { saldo, diasParaVencer, DIAS_VENCIMENTO } from '../utils/stock'
import { PERFIS } from '../config/menu'

const Ctx = createContext(null)
const CHAVE = 'dear-v1'
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const CATEGORIAS_DESPESA = ['Aluguel', 'Fornecedores', 'Impostos', 'Contas', 'Outros']
const MAX_NOME = 120
const MAX_DESCRICAO = 180
const MAX_CARGO = 80
const MAX_LOGIN = 254

const dataValida = (valor) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false
  const data = new Date(`${valor}T00:00:00`)
  return !Number.isNaN(data.getTime()) && data.toISOString().slice(0, 10) === valor
}

const numeroFinito = (valor) => valor !== '' && valor !== null && Number.isFinite(Number(valor))

function estruturaValida(valor) {
  return valor &&
    Array.isArray(valor.cats) &&
    Array.isArray(valor.produtos) &&
    Array.isArray(valor.movs) &&
    Array.isArray(valor.users) &&
    Array.isArray(valor.desp) &&
    (valor.solicitacoes === undefined || Array.isArray(valor.solicitacoes))
}

function carregarBanco() {
  try {
    const salvo = localStorage.getItem(CHAVE)
    if (salvo) {
      const dados = JSON.parse(salvo)
      if (estruturaValida(dados)) {
        return { ...dados, solicitacoes: dados.solicitacoes || [] }
      }
    }
  } catch {
    // Dados inválidos: inicia com a base de demonstração.
  }
  return { ...seed(), solicitacoes: [] }
}

function novoId(db) {
  const colecoes = ['produtos', 'movs', 'users', 'desp', 'solicitacoes']
  const ids = colecoes.flatMap((chave) => (db[chave] || []).map((item) => Number(item.id)).filter(Number.isFinite))
  return Math.max(0, ...ids) + 1
}

function usuarioAtivo(db, id) {
  return db.users.find((usuario) => usuario.id === id && usuario.ativo) || null
}

function exigeAdmin(db, actorId) {
  const ator = usuarioAtivo(db, actorId)
  return ator?.perfil === 'admin' ? ator : null
}

/*
  Camada local do protótipo. As validações daqui ajudam a manter os dados
  consistentes, mas não substituem autenticação/autorização no backend.
*/
export function StoreProvider({ children }) {
  const [db, setDb] = useState(carregarBanco)

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(db))
    } catch {
      // O armazenamento pode estar indisponível ou sem espaço.
    }
  }, [db])

  const acoes = {
    resetar: () => setDb({ ...seed(), solicitacoes: [] }),

    // RF-07, 09, 10
    salvarProduto(dados, id) {
      if (!dados || typeof dados !== 'object') return 'Dados do produto inválidos.'
      const codigo = String(dados.codigo || '').trim().toUpperCase()
      const nome = String(dados.nome || '').trim()
      const categoria = String(dados.cat || '').trim()
      const custo = Number(dados.custo)
      const preco = Number(dados.preco)
      const minimo = Number(dados.min)

      if (!codigo || !nome || dados.custo === '' || dados.preco === '') return 'Preencha código, nome e preços.'
      if (codigo.length > 40 || nome.length > MAX_NOME) return 'Código ou nome excede o limite permitido.'
      if (!db.cats.includes(categoria)) return 'Selecione uma categoria válida.'
      if (!numeroFinito(dados.custo) || !numeroFinito(dados.preco) || !numeroFinito(dados.min) ||
          !Number.isFinite(custo) || !Number.isFinite(preco) || !Number.isFinite(minimo) ||
          custo < 0 || preco <= 0 || minimo < 0) {
        return 'Informe valores válidos para custo, preço e estoque mínimo.'
      }
      if (dados.val && !dataValida(dados.val)) return 'Informe uma data de validade válida.'
      if (db.produtos.some((p) => p.id !== id && (p.codigo === codigo || p.nome.toLowerCase() === nome.toLowerCase()))) {
        return 'Produto já cadastrado (mesmo código ou nome).'
      }

      const reg = {
        codigo, nome, cat: categoria,
        un: String(dados.un || 'un').trim().slice(0, 12) || 'un',
        custo, preco, min: minimo, val: dados.val || '',
      }
      setDb((d) => ({
        ...d,
        produtos: id
          ? d.produtos.map((p) => (p.id === id ? { ...p, ...reg } : p))
          : [...d.produtos, { id: novoId(d), ativo: true, ...reg }],
      }))
      return null
    },

    alternarProduto: (id) =>
      setDb((d) => ({ ...d, produtos: d.produtos.map((p) => (p.id === id ? { ...p, ativo: !p.ativo } : p)) })),

    // RF-08
    addCategoria(nome) {
      const n = String(nome || '').trim()
      if (n.length < 2 || n.length > 50) return 'Informe uma categoria entre 2 e 50 caracteres.'
      if (db.cats.some((c) => c.toLowerCase() === n.toLowerCase())) return 'Categoria já existe.'
      setDb((d) => ({ ...d, cats: [...d.cats, n] }))
      return null
    },

    // RF-14, 15, 16, 17, 22
    registrarMov({ tipo, produto, qtd, valor, actorId, liberar }) {
      const ator = usuarioAtivo(db, actorId)
      if (!ator) return 'Sua sessão não é válida. Entre novamente.'
      if (ator.perfil === 'financeiro') return 'Seu perfil não tem permissão para movimentar o estoque.'
      if (!['E', 'S'].includes(tipo)) return 'Tipo de movimentação inválido.'
      if (!numeroFinito(qtd) || !Number.isFinite(Number(qtd)) || Number(qtd) <= 0) return 'Informe uma quantidade válida.'
      if (!numeroFinito(valor) || !Number.isFinite(Number(valor)) || Number(valor) < 0) return 'Informe um valor unitário válido.'

      const produtoAtual = db.produtos.find((p) => p.id === produto?.id && p.ativo)
      if (!produtoAtual) return 'Produto não encontrado ou inativo.'

      const quantidade = Number(qtd)
      const valorUnitario = Number(valor)
      let autorizadoPor = ''

      if (tipo === 'S') {
        const estoqueAtual = saldo(db.movs, produtoAtual.id)
        if (quantidade > estoqueAtual) {
          return `Saída bloqueada: restam apenas ${estoqueAtual} unidades de ${produtoAtual.nome}.`
        }
        const dias = diasParaVencer(produtoAtual)
        const exigeLiberacao = dias !== null && dias <= DIAS_VENCIMENTO
        if (exigeLiberacao && (!liberar || !['admin', 'gerente'].includes(ator.perfil))) {
          return 'Produto próximo da validade: é necessária a liberação do gerente.'
        }
        if (exigeLiberacao) autorizadoPor = ator.nome
      }

      // No backend, esta operação deve ser transacional/atômica (RNF-05).
      setDb((d) => ({
        ...d,
        movs: [...d.movs, {
          id: novoId(d), tipo, pid: produtoAtual.id, qtd: quantidade,
          valor: valorUnitario, data: hoje(), user: ator.nome, aut: autorizadoPor,
        }],
      }))
      return null
    },

    // RF-25, 28
    addDespesa(x) {
      if (!x || typeof x !== 'object') return 'Dados da despesa inválidos.'
      const desc = String(x.desc || '').trim()
      const cat = String(x.cat || '').trim()
      const valor = Number(x.valor)
      if (!desc || desc.length > MAX_DESCRICAO || !numeroFinito(x.valor) || !Number.isFinite(valor) || valor <= 0 || !dataValida(x.venc)) {
        return 'Preencha descrição, valor e vencimento corretamente.'
      }
      if (!CATEGORIAS_DESPESA.includes(cat)) return 'Selecione uma categoria de despesa válida.'
      setDb((d) => ({
        ...d,
        desp: [...d.desp, { id: novoId(d), desc, cat, valor, venc: x.venc, pago: false }],
      }))
      return null
    },

    pagarDespesa: (id) =>
      setDb((d) => ({ ...d, desp: d.desp.map((x) => (x.id === id ? { ...x, pago: true } : x)) })),

    // RF-02, 03, 04: somente administrador pode gerenciar contas.
    addUsuario(u, actorId) {
      if (!exigeAdmin(db, actorId)) return 'Você não tem permissão para cadastrar usuários.'
      const nome = String(u?.nome || '').trim()
      const cargo = String(u?.cargo || '').trim()
      const login = String(u?.login || '').trim()
      const senha = String(u?.senha || '')
      if (!nome || !login || !senha) return 'Preencha nome, login e senha.'
      if (nome.length > MAX_NOME || cargo.length > MAX_CARGO || login.length > MAX_LOGIN) return 'Um ou mais campos excedem o tamanho permitido.'
      if (senha.length < 8) return 'A senha deve ter pelo menos 8 caracteres.'
      if (!Object.hasOwn(PERFIS, u?.perfil)) return 'Escolha um perfil de acesso válido.'
      if (db.users.some((x) => x.login.toLowerCase() === login.toLowerCase())) return 'Login já existe.'
      setDb((d) => ({
        ...d,
        users: [...d.users, { id: novoId(d), nome, cargo, login, senha, perfil: u.perfil, ativo: true }],
      }))
      return null
    },

    alternarUsuario(id, actorId) {
      if (!exigeAdmin(db, actorId)) return 'Você não tem permissão para alterar usuários.'
      if (id === actorId) return 'Não é permitido desativar a própria conta.'
      if (!db.users.some((u) => u.id === id)) return 'Usuário não encontrado.'
      setDb((d) => ({ ...d, users: d.users.map((u) => (u.id === id ? { ...u, ativo: !u.ativo } : u)) }))
      return null
    },

    // Solicitação pública: resposta neutra para não confirmar a existência de uma conta.
    solicitarAcesso({ nome, email, cargo }) {
      const n = String(nome || '').trim()
      const mail = String(email || '').trim().toLowerCase()
      const setor = String(cargo || '').trim()
      if (n.length < 3 || n.length > MAX_NOME) return 'Informe um nome entre 3 e 120 caracteres.'
      if (!EMAIL.test(mail) || mail.length > MAX_LOGIN) return 'Informe um e-mail válido.'
      if (setor.length > MAX_CARGO) return 'O cargo ou setor deve ter até 80 caracteres.'

      const jaExiste = db.users.some((u) => u.login.toLowerCase() === mail)
      const jaPendente = (db.solicitacoes || []).some((s) => s.email === mail && s.status === 'pendente')
      if (jaExiste || jaPendente) {
        // Mantém a mesma resposta visual para não revelar se a conta já existe.
        return null
      }

      setDb((d) => ({
        ...d,
        solicitacoes: [...(d.solicitacoes || []), {
          id: novoId(d), nome: n, email: mail, cargo: setor, status: 'pendente', data: hoje(),
        }],
      }))
      return null
    },

    // Aprovar ou recusar solicitações: somente administrador pode executar.
    aprovarSolicitacao(id, { login, senha, perfil }, actorId) {
      if (!exigeAdmin(db, actorId)) return 'Você não tem permissão para aprovar solicitações.'
      const solicitacoes = db.solicitacoes || []
      const solicitacao = solicitacoes.find((x) => x.id === id && x.status === 'pendente')
      if (!solicitacao) return 'Solicitação não encontrada.'

      const l = String(login || '').trim()
      const password = String(senha || '')
      if (!l || !password) return 'Informe login e senha inicial.'
      if (l.length > MAX_LOGIN) return 'O login excede o tamanho permitido.'
      if (password.length < 8) return 'A senha deve ter pelo menos 8 caracteres.'
      if (!Object.hasOwn(PERFIS, perfil)) return 'Escolha um perfil de acesso válido.'
      if (db.users.some((u) => u.login.toLowerCase() === l.toLowerCase())) return 'Login já existe.'

      setDb((d) => ({
        ...d,
        users: [...d.users, {
          id: novoId(d), nome: solicitacao.nome, cargo: solicitacao.cargo,
          login: l, senha: password, perfil, ativo: true,
        }],
        solicitacoes: (d.solicitacoes || []).map((x) => (x.id === id ? { ...x, status: 'aprovada' } : x)),
      }))
      return null
    },

    recusarSolicitacao(id, actorId) {
      if (!exigeAdmin(db, actorId)) return 'Você não tem permissão para recusar solicitações.'
      if (!(db.solicitacoes || []).some((s) => s.id === id && s.status === 'pendente')) return 'Solicitação não encontrada.'
      setDb((d) => ({
        ...d,
        solicitacoes: (d.solicitacoes || []).map((x) => (x.id === id ? { ...x, status: 'recusada' } : x)),
      }))
      return null
    },
  }

  return <Ctx.Provider value={{ db, ...acoes }}>{children}</Ctx.Provider>
}

export const useStore = () => useContext(Ctx)