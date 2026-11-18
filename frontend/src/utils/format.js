export const brl = (n) =>
  (n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// '2026-11-18' -> '18/11/2026'
export const fd = (s) => (s ? s.split('-').reverse().join('/') : '—')

// Data de hoje (ou deslocada em n dias) no formato AAAA-MM-DD, no fuso local
export const hoje = (n = 0) => {
  const x = new Date()
  x.setDate(x.getDate() + n)
  return x.toLocaleDateString('sv-SE')
}

// Dias entre hoje e uma data (negativo = já passou)
export const diffDias = (iso) =>
  Math.round((new Date(iso) - new Date(hoje())) / 864e5)
