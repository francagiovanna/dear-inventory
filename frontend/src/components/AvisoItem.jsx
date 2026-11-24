import { Link } from 'react-router-dom'

// Ícones inline (não dependem do Icon.jsx). Cada tipo de aviso tem ícone, cor e etiqueta próprios.
const TIPOS = {
  vencido: { rotulo: 'Validade', icone: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18M10 14l4 4M14 14l-4 4" /></> },
  vencendo: { rotulo: 'Validade', icone: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></> },
  estoque: { rotulo: 'Estoque', icone: <><path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" /><path d="M3 8l9 5 9-5M12 13v8" /></> },
  conta: { rotulo: 'Conta', icone: <><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="3" /></> },
  acesso: { rotulo: 'Acesso', icone: <><circle cx="9" cy="8" r="4" /><path d="M2 21v-1a7 7 0 0 1 14 0v1M19 8v6M16 11h6" /></> },
}

// Uma linha de aviso. Usada no Painel, na página de Alertas e no sino.
// onClick (opcional) serve para o sino fechar o popup ao navegar.
export default function AvisoItem({ a, onClick }) {
  const t = TIPOS[a.tipo] || TIPOS.estoque
  const corpo = (
    <>
      <span className="av-ic">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{t.icone}</svg>
      </span>
      <span className="av-tx" title={`${a.titulo || a.texto}${a.detalhe ? ' — ' + a.detalhe : ''}`}>
        <b>{a.titulo || a.texto}</b>
        {a.detalhe && <small>{a.detalhe}</small>}
      </span>
      <span className="av-tag">{t.rotulo}</span>
    </>
  )
  const cls = `av t-${a.tipo}${a.urgente ? ' urgente' : ''}`
  return a.to ? <Link to={a.to} className={cls} onClick={onClick}>{corpo}</Link> : <div className={cls}>{corpo}</div>
}