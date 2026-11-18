import { diffDias } from './format'

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

// RF-41, 42, 43: avisos de estoque, validade e contas
export function gerarAlertas(db, perfil) {
  const a = []
  db.produtos.filter((p) => p.ativo).forEach((p) => {
    const s = saldo(db.movs, p.id)
    const v = diasParaVencer(p)
    if (s <= p.min) a.push({ cor: 'var(--warn)', texto: `${p.nome}: só restam ${s} unidades` })
    if (v !== null && v < 0) a.push({ cor: 'var(--bad)', texto: `${p.nome} está vencido` })
    else if (v !== null && v <= DIAS_VENCIMENTO)
      a.push({ cor: 'var(--bad)', texto: `${p.nome} vence em ${v} dias` })
  })
  if (perfil !== 'gerente') {
    db.desp.filter((x) => !x.pago).forEach((x) => {
      const n = diffDias(x.venc)
      if (n <= 7) {
        const quando = n < 0 ? ' está vencida' : n === 0 ? ' vence hoje' : n === 1 ? ' vence amanhã' : ` vence em ${n} dias`
        a.push({ cor: 'var(--blue)', texto: x.desc + quando })
      }
    })
  }
  return a
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
