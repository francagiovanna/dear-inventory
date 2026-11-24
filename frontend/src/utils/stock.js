import { diffDias, brl } from './format'
import { APROVAM_ACESSO } from '../config/menu'

// "Próximo do vencimento" (pendência 6.1 do documento: configurável no futuro)
export const DIAS_VENCIMENTO = 30

// RN-08: saldo = soma das entradas - soma das saídas
export const saldo = (movs, pid) =>
  movs.reduce((a, m) => (m.pid === pid ? a + (m.tipo === 'E' ? m.qtd : -m.qtd) : a), 0)

export const diasParaVencer = (p) => (p.val ? diffDias(p.val) : null)

// Retorna [texto, tipo da tag]
export function situacao(p, s) {
  const v = diasParaVencer(p)
  if (v !== null && v < 0) return ['Vencido', 'bad']
  if (s <= p.min) return ['Abaixo do mínimo', 'warn']
  if (v !== null && v <= DIAS_VENCIMENTO) return [`Vence em ${v}d`, 'warn']
  return ['Normal', 'ok']
}

// Ordem de gravidade dos avisos (menor = mais urgente).
const ORDEM = { vencido: 0, vencendo: 1, estoque: 2, conta: 3, acesso: 4 }
const dias = (n) => `${n} ${n === 1 ? 'dia' : 'dias'}`

// Quais tipos de aviso cada perfil enxerga.
// O dono vê tudo; os demais veem só o que é da sua área.
const VISIVEL = {
  admin: ['vencido', 'vencendo', 'estoque', 'conta', 'acesso'],
  gerente: ['vencido', 'vencendo', 'estoque'],
  financeiro: ['conta'],
}

// Texto de prazo: "Vence hoje", "Vence amanhã", "Vence em 5 dias" ou "Vencido há 3 dias".
const prazo = (n, feminino = false) => {
  if (n < 0) return `${feminino ? 'Vencida' : 'Vencido'} há ${dias(-n)}`
  if (n === 0) return 'Vence hoje'
  if (n === 1) return 'Vence amanhã'
  return `Vence em ${dias(n)}`
}

// RF-41, 42, 43: avisos de estoque, validade, contas e pedidos de acesso.
// Cada aviso traz:
//   tipo      'vencido' | 'vencendo' | 'estoque' | 'conta' | 'acesso'
//   titulo    nome do item (linha em negrito)
//   detalhe   motivo (linha cinza)
//   urgente   true quando deve aparecer em vermelho
//   to, acao  rota de destino e texto do botão
//   texto, cor  mantidos por compatibilidade
// A lista sai filtrada pelo perfil e ordenada por gravidade.
export function gerarAlertas(db, perfil) {
  const a = []
  if (APROVAM_ACESSO.includes(perfil)) {
    ;(db.solicitacoes || []).filter((s) => s.status === 'pendente').forEach((s) =>
      a.push({
        tipo: 'acesso',
        titulo: s.nome,
        detalhe: 'Solicitou acesso ao sistema',
        cor: 'var(--blue)',
        texto: `${s.nome} solicitou acesso ao sistema`,
        to: '/usuarios?aba=solicitacoes',
        acao: 'Analisar',
      }))
  }
  db.produtos.filter((p) => p.ativo).forEach((p) => {
    const s = saldo(db.movs, p.id)
    const v = diasParaVencer(p)
    if (s <= p.min) {
      a.push({
        tipo: 'estoque',
        titulo: p.nome,
        detalhe: s <= 0 ? `Sem estoque · mínimo ${p.min}` : `Restam ${s} ${p.un} · mínimo ${p.min}`,
        urgente: s <= 0,
        cor: 'var(--warn)',
        texto: `${p.nome}: só restam ${s} unidades`,
        to: '/estoque',
        acao: 'Ver no estoque',
      })
    }
    if (v !== null && v < 0) {
      a.push({
        tipo: 'vencido',
        titulo: p.nome,
        detalhe: prazo(v),
        cor: 'var(--bad)',
        texto: `${p.nome} está vencido`,
        to: '/estoque',
        acao: 'Ver no estoque',
      })
    } else if (v !== null && v <= DIAS_VENCIMENTO) {
      a.push({
        tipo: 'vencendo',
        titulo: p.nome,
        detalhe: prazo(v),
        cor: 'var(--bad)',
        texto: `${p.nome} vence em ${v} dias`,
        to: '/estoque',
        acao: 'Ver no estoque',
      })
    }
  })
  db.desp.filter((x) => !x.pago).forEach((x) => {
    const n = diffDias(x.venc)
    if (n <= 7) {
      const quando = n < 0 ? ' está vencida' : n === 0 ? ' vence hoje' : n === 1 ? ' vence amanhã' : ` vence em ${n} dias`
      a.push({
        tipo: 'conta',
        titulo: x.desc,
        detalhe: `${prazo(n, true)} · ${brl(x.valor)}`,
        urgente: n <= 0,
        cor: 'var(--blue)',
        texto: x.desc + quando,
        to: '/financeiro',
        acao: 'Ver contas',
      })
    }
  })
  // Só o que o perfil pode ver. Perfil desconhecido não vê nada.
  const pode = VISIVEL[perfil] || []
  // O sort do JS é estável: dentro do mesmo tipo, os urgentes sobem e o resto mantém a ordem.
  return a
    .filter((x) => pode.includes(x.tipo))
    .sort((x, y) => (ORDEM[x.tipo] - ORDEM[y.tipo]) || (Number(!!y.urgente) - Number(!!x.urgente)))
}

// RF-27: lucro = saídas - custo dos produtos vendidos - despesas
export function calcFinanceiro(db, de, ate) {
  const prod = (id) => db.produtos.find((p) => p.id === id)
  const saidas = db.movs.filter((m) => m.tipo === 'S' && m.data >= de && m.data <= ate)
  const vendas = saidas.reduce((a, m) => a + m.qtd * m.valor, 0)
  const custo = saidas.reduce((a, m) => a + m.qtd * (prod(m.pid)?.custo || 0), 0)
  const despesas = db.desp
    .filter((x) => x.venc >= de && x.venc <= ate)
    .reduce((a, x) => a + x.valor, 0)
  return { vendas, custo, despesas, lucro: vendas - custo - despesas }
}