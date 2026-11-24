import { useId } from 'react'

// Ícone da logo: caixas no galpão, prancheta com checklist e relógio (estoque em tempo real).
// "cor" pinta o contorno da casa; no menu escuro passe uma cor clara.
export function DearMark({ size = 32, cor = 'currentColor', className = '' }) {
  const id = useId().replace(/:/g, '')
  const g = `g${id}`
  return (
    <svg
      className={className}
      width={size}
      height={size * 0.88}
      viewBox="0 0 108 95"
      fill="none"
      role="img"
      aria-label="DEAR Inventory"
    >
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#12B8FF" />
          <stop offset="1" stopColor="#0A5CFF" />
        </linearGradient>
      </defs>

      {/* casa (galpão) */}
      <path d="M16 62V32L50 11l36 19" stroke={cor} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" opacity=".85" />

      {/* caixas */}
      <rect x="31" y="30" width="23" height="19" rx="2.5" fill={`url(#${g})`} />
      <rect x="22" y="51" width="23" height="20" rx="2.5" fill={`url(#${g})`} />
      <rect x="47" y="51" width="23" height="20" rx="2.5" fill={`url(#${g})`} />

      {/* prancheta */}
      <rect x="68" y="29" width="30" height="42" rx="5" fill="#fff" stroke="#0B2A5B" strokeWidth="3.2" />
      <rect x="76" y="24.5" width="14" height="8" rx="2.5" fill="#0B2A5B" />
      <g stroke="#0B2A5B" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="m73 43 2.6 2.6L80 41" />
        <path d="m73 53 2.6 2.6L80 51" />
        <path d="M84 43h8M84 53h8" />
      </g>

      {/* relógio */}
      <circle cx="90" cy="68" r="15" fill="#fff" stroke={`url(#${g})`} strokeWidth="4.5" />
      <path d="M90 60v8l5 3" stroke="#0B2A5B" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />

      {/* traço azul sob o galpão */}
      <path
        d="M8 56C2 68 14 80 38 84c18 3 33 1 46-4-18 3-40 3-54-6C20 68 18 62 24 56 18 58 11 56 8 56Z"
        fill={`url(#${g})`}
      />

      {/* faíscas (tempo real) */}
      <g stroke={`url(#${g})`} strokeWidth="3.6" strokeLinecap="round">
        <path d="M76 12l4 -8" />
        <path d="M86 20l8 -6" />
        <path d="M91 31h8" />
      </g>
    </svg>
  )
}

// Logo completa (vertical): ícone + DEAR + Inventory.
// fundo="escuro" deixa o DEAR branco; fundo="claro" deixa em azul-marinho.
export default function DearLogo({ width = 240, fundo = 'claro', className = '' }) {
  const dear = fundo === 'escuro' ? '#FFFFFF' : '#0B2A5B'
  const casa = fundo === 'escuro' ? '#DCE7FF' : '#0B2A5B'
  const alt = width * 0.95
  return (
    <svg className={className} width={width} height={alt} viewBox="0 0 240 228" role="img" aria-label="DEAR Inventory">
      <g transform="translate(66 0) scale(1.1)">
        <DearMarkInner cor={casa} />
      </g>
      <text x="120" y="162" textAnchor="middle" fontFamily="'Plus Jakarta Sans', system-ui, sans-serif" fontWeight="800" fontSize="56" letterSpacing="2" fill={dear}>
        DEAR
      </text>
      <text x="120" y="208" textAnchor="middle" fontFamily="'Plus Jakarta Sans', system-ui, sans-serif" fontWeight="700" fontSize="38" fill="#1E88FF">
        Inventory
      </text>
    </svg>
  )
}

// Mesmo desenho do ícone, sem o <svg> externo, para encaixar dentro do lockup.
function DearMarkInner({ cor }) {
  const id = useId().replace(/:/g, '')
  const g = `g${id}`
  return (
    <>
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#12B8FF" />
          <stop offset="1" stopColor="#0A5CFF" />
        </linearGradient>
      </defs>
      <path d="M16 62V32L50 11l36 19" stroke={cor} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity=".85" />
      <rect x="31" y="30" width="23" height="19" rx="2.5" fill={`url(#${g})`} />
      <rect x="22" y="51" width="23" height="20" rx="2.5" fill={`url(#${g})`} />
      <rect x="47" y="51" width="23" height="20" rx="2.5" fill={`url(#${g})`} />
      <rect x="68" y="29" width="30" height="42" rx="5" fill="#fff" stroke="#0B2A5B" strokeWidth="3.2" />
      <rect x="76" y="24.5" width="14" height="8" rx="2.5" fill="#0B2A5B" />
      <g stroke="#0B2A5B" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="m73 43 2.6 2.6L80 41" />
        <path d="m73 53 2.6 2.6L80 51" />
        <path d="M84 43h8M84 53h8" />
      </g>
      <circle cx="90" cy="68" r="15" fill="#fff" stroke={`url(#${g})`} strokeWidth="4.5" />
      <path d="M90 60v8l5 3" stroke="#0B2A5B" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M8 56C2 68 14 80 38 84c18 3 33 1 46-4-18 3-40 3-54-6C20 68 18 62 24 56 18 58 11 56 8 56Z" fill={`url(#${g})`} />
      <g stroke={`url(#${g})`} strokeWidth="3.6" strokeLinecap="round" fill="none">
        <path d="M76 12l4 -8" />
        <path d="M86 20l8 -6" />
        <path d="M91 31h8" />
      </g>
    </>
  )
}