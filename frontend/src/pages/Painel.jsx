import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { useAuth } from '../context/AuthContext'
import Icon from '../components/Icon'
import Tag from '../components/Tag'
import AvisoItem from '../components/AvisoItem'
import { saldo, diasParaVencer, gerarAlertas, situacao, DIAS_VENCIMENTO } from '../utils/stock'
import { hoje, brl } from '../utils/format'

// Janela (em dias) usada nos mini-gráficos e na variação dos cartões
const HIST = 30

// Ícones inline (mesmo padrão do AvisoItem, não dependem do Icon.jsx)
const PATHS = {
  box: <><path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" /><path d="M3 8l9 5 9-5M12 13v8" /></>,
  dollar: <><path d="M12 2v20" /><path d="M17 6.5C16 5 14.2 4.5 12 4.5c-2.8 0-4.5 1.3-4.5 3.2 0 4.6 9.5 2.2 9.5 7 0 2-1.9 3.3-5 3.3-2.3 0-4.2-.7-5.2-2.2" /></>,
  alert: <><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /><path d="M12 9v4M12 17h.01" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  trend: <path d="M3 17l6-6 4 4 8-8M15 7h6v6" />,
  bell: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" /></>,
}

function Ico({ n, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[n]}
    </svg>
  )
}

const r = (n) => +n.toFixed(1)

// Curva suave que passa por todos os pontos, sem ultrapassar os valores
const curva = (pts) =>
  pts.reduce((d, [x, y], i) => {
    if (i === 0) return `M${x},${y}`
    const [px, py] = pts[i - 1]
    const mx = r((px + x) / 2)
    return `${d} C${mx},${py} ${mx},${y} ${x},${y}`
  }, '')

// Escala do eixo Y: 4 divisões com passo "redondo" (1, 2, 5, 10...)
function escala(max) {
  const bruto = Math.max(max, 4) / 4
  const pot = 10 ** Math.floor(Math.log10(bruto))
  const f = [1, 2, 5, 10].find((k) => k * pot >= bruto)
  return { passo: f * pot, topo: f * pot * 4 }
}

// Variação entre o primeiro e o último ponto da série.
// bomSobe: true quando subir é bom (itens, valor); false quando subir é ruim (alertas).
function variacao(serie, bomSobe, contagem) {
  const a = serie[0]
  const b = serie[serie.length - 1]
  if (a === b) return { seta: '→', txt: '0%', tom: 'flat' }
  const sobe = b > a
  const pct = a === 0 ? null : ((b - a) / Math.abs(a)) * 100
  let txt
  if (pct !== null) txt = `${sobe ? '+' : ''}${Math.round(pct)}%`
  else txt = contagem ? `${sobe ? '+' : ''}${Math.round(b - a)}` : 'novo'
  const tom = sobe === bomSobe ? 'ok' : bomSobe ? 'bad' : 'warn'
  return { seta: sobe ? '↑' : '↓', txt, tom }
}

function Spark({ dados, cor, id }) {
  const W = 110
  const H = 46
  const max = Math.max(...dados)
  const min = Math.min(...dados)
  const amp = max - min
  // Série constante: linha reta no meio, em vez de colada na borda de baixo
  const pts = dados.map((v, i) => [
    r((i / (dados.length - 1)) * W),
    amp === 0 ? H / 2 : r(H - 5 - ((v - min) / amp) * (H - 14)),
  ])
  const linha = curva(pts)
  return (
    <svg className="spark" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: cor, stopOpacity: 0.25 }} />
          <stop offset="1" style={{ stopColor: cor, stopOpacity: 0 }} />
        </linearGradient>
      </defs>
      <path d={`${linha} L${W},${H} L0,${H} Z`} fill={`url(#${id})`} />
      <path d={linha} fill="none" style={{ stroke: cor }} strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

function Grafico({ dias, ent, sai }) {
  const n = dias.length
  const W = 640, H = 250, L = 38, R = 14, T = 14, B = 30
  const base = H - B
  const { passo, topo } = escala(Math.max(...ent, ...sai))
  const x = (i) => r(L + (i * (W - L - R)) / (n - 1))
  const y = (v) => r(T + (1 - v / topo) * (H - T - B))
  const pe = ent.map((v, i) => [x(i), y(v)])
  const ps = sai.map((v, i) => [x(i), y(v)])
  const marca = n <= 7 ? 1 : n <= 30 ? 5 : 15
  const mostra = (i) => (n - 1 - i) % marca === 0
  const larg = (W - L - R) / (n - 1)
  const rotulo = (d) => `${d.slice(8)}/${d.slice(5, 7)}`

  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Gráfico de entradas e saídas">
      <defs>
        <linearGradient id="g-ent" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--ln-in)', stopOpacity: 0.18 }} />
          <stop offset="1" style={{ stopColor: 'var(--ln-in)', stopOpacity: 0 }} />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3, 4].map((k) => (
        <g key={k}>
          <line className="gl" x1={L} x2={W - R} y1={y(k * passo)} y2={y(k * passo)} />
          <text x={L - 8} y={y(k * passo) + 4} textAnchor="end">{k * passo}</text>
        </g>
      ))}
      <path d={`${curva(pe)} L${pe[n - 1][0]},${base} L${pe[0][0]},${base} Z`} fill="url(#g-ent)" />
      <path d={curva(ps)} fill="none" style={{ stroke: 'var(--ln-out)' }} strokeWidth="2.5" strokeLinecap="round" />
      <path d={curva(pe)} fill="none" style={{ stroke: 'var(--ln-in)' }} strokeWidth="2.5" strokeLinecap="round" />
      {n <= 7 && pe.map(([cx, cy], i) => <circle key={'e' + i} cx={cx} cy={cy} r="4" style={{ fill: 'var(--ln-in)' }} />)}
      {n <= 7 && ps.map(([cx, cy], i) => <circle key={'s' + i} cx={cx} cy={cy} r="4" style={{ fill: 'var(--ln-out)' }} />)}
      {dias.map((d, i) => (
        <rect key={d} x={x(i) - larg / 2} y={T} width={larg} height={base - T} fill="transparent">
          <title>{`${rotulo(d)} · Entradas: ${ent[i]} · Saídas: ${sai[i]}`}</title>
        </rect>
      ))}
      {dias.map((d, i) => mostra(i) && <text key={'t' + d} x={x(i)} y={H - 8} textAnchor="middle">{rotulo(d)}</text>)}
    </svg>
  )
}

export default function Painel() {
  const { db } = useStore()
  const { user } = useAuth()
  const perfil = user.perfil
  const [periodo, setPeriodo] = useState(7)

  const ativos = db.produtos.filter((p) => p.ativo)
  const alertas = gerarAlertas(db, perfil)

  // Entradas e saídas por dia (para o gráfico)
  const porDia = {}
  db.movs.forEach((m) => { const k = m.data + m.tipo; porDia[k] = (porDia[k] || 0) + m.qtd })
  const dias = [...Array(periodo)].map((_, i) => hoje(i - (periodo - 1)))
  const ent = dias.map((d) => porDia[d + 'E'] || 0)
  const sai = dias.map((d) => porDia[d + 'S'] || 0)

  // Valores de hoje
  const linhas = ativos.map((p) => ({ p, s: saldo(db.movs, p.id) }))
  const total = linhas.reduce((a, l) => a + l.s, 0)
  const valor = linhas.reduce((a, l) => a + l.s * l.p.custo, 0)
  const repor = linhas.filter((l) => l.s <= l.p.min)
  const vencendo = ativos.filter((p) => { const v = diasParaVencer(p); return v !== null && v <= DIAS_VENCIMENTO }).length

  // Histórico dos últimos HIST dias, reconstruído a partir das movimentações.
  // Usa o custo atual do produto (o protótipo não guarda histórico de custo).
  const hist = [...Array(HIST)].map((_, i) => {
    const k = i - (HIST - 1)
    const d = hoje(k)
    let it = 0, vl = 0, mn = 0, vc = 0
    ativos.forEach((p) => {
      const s = db.movs.reduce((a, m) => (m.pid === p.id && m.data <= d ? a + (m.tipo === 'E' ? m.qtd : -m.qtd) : a), 0)
      it += s
      vl += s * p.custo
      if (s <= p.min) mn++
      const v = diasParaVencer(p)
      if (v !== null && v - k <= DIAS_VENCIMENTO) vc++
    })
    return { it, vl, mn, vc }
  })

  const cards = [
    { icone: 'box', ic: 'var(--blue)', sp: 'var(--blue)', valor: total.toLocaleString('pt-BR'), label: 'Itens em estoque', serie: hist.map((h) => h.it), bomSobe: true },
    { icone: 'dollar', ic: 'var(--ok)', sp: 'var(--ok)', valor: brl(valor), label: 'Valor em estoque', serie: hist.map((h) => h.vl), bomSobe: true },
    { icone: 'alert', ic: 'var(--orange)', sp: 'var(--bad)', valor: repor.length, label: 'Abaixo do mínimo', serie: hist.map((h) => h.mn), bomSobe: false, contagem: true },
    { icone: 'clock', ic: 'var(--violet)', sp: 'var(--orange)', valor: vencendo, label: 'Vencendo', serie: hist.map((h) => h.vc), bomSobe: false, contagem: true },
  ].map((c) => ({ ...c, v: variacao(c.serie, c.bomSobe, c.contagem) }))

  const atalhos = [
    perfil !== 'financeiro' && { to: '/estoque?novo=E', icone: 'down', label: 'Registrar entrada' },
    perfil !== 'financeiro' && { to: '/estoque?novo=S', icone: 'up', label: 'Registrar saída' },
    perfil !== 'financeiro' && { to: '/produtos?novo=1', icone: 'box', label: 'Novo produto' },
    perfil !== 'gerente' && { to: '/financeiro?novo=1', icone: 'dollar', label: 'Nova despesa' },
  ].filter(Boolean)

  const primeiroNome = user.nome.split(' ')[0]

  return (
    <div className="home">
      <div className="home-top">
        <div>
          <p className="home-oi">Olá, {primeiroNome}!</p>
          <h1 className="home-h">Que bom ter você de volta!</h1>
          <p className="home-sub">Aqui está um resumo do seu estoque hoje.</p>
        </div>
        <div className="atalhos">
          {atalhos.map((a, i) => (
            <Link key={a.to} to={a.to} className={'atalho' + (i === 0 ? ' pri' : '')}><Icon nome={a.icone} /> {a.label}</Link>
          ))}
        </div>
      </div>

      <div className="stats">
        {cards.map((c, i) => (
          <div className="stat" key={c.label}>
            <span className="stat-ic" style={{ '--c': c.ic }}><Ico n={c.icone} size={22} /></span>
            <div className="stat-tx">
              <small>{c.label}</small>
              <b>{c.valor}</b>
              <span className={'dl ' + c.v.tom} title={`Variação nos últimos ${HIST} dias`}>{c.v.seta} {c.v.txt}</span>
            </div>
            <Spark dados={c.serie} cor={c.sp} id={'sp' + i} />
          </div>
        ))}
      </div>

      <div className="grid g2">
        <div className="panel pad">
          <div className="chart-h">
            <span className="sec-t"><Ico n="trend" size={18} />Entradas e saídas dos últimos {periodo} dias</span>
            <div className="seg" role="tablist">
              {[7, 30, 90].map((n) => (
                <button key={n} className={periodo === n ? 'on' : ''} onClick={() => setPeriodo(n)}>{n} dias</button>
              ))}
            </div>
          </div>
          <div className="legenda">
            <span><i style={{ background: 'var(--ln-in)' }} />Entradas</span>
            <span><i style={{ background: 'var(--ln-out)' }} />Saídas</span>
          </div>
          <Grafico dias={dias} ent={ent} sai={sai} />
        </div>

        <div className="panel pad">
          <div className="av-head">
            <span className="sec-t"><Ico n="bell" size={18} />Avisos</span>
            {alertas.length > 0 && <Link className="av-all" to="/alertas">Ver todos →</Link>}
          </div>
          {alertas.length === 0 && <p className="mut">Tudo em ordem.</p>}
          <div className="av-list">
            {alertas.slice(0, 4).map((a, i) => <AvisoItem key={i} a={a} />)}
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="panel-h">
          <span className="sec-t"><Ico n="box" size={18} />Produtos para repor</span>
          <Link to="/estoque">Ver estoque →</Link>
        </div>
        <div className="tw">
          <table>
            <thead><tr><th>Produto</th><th>Categoria</th><th>Saldo</th><th>Nível</th><th>Mínimo</th><th>Situação</th></tr></thead>
            <tbody>
              {repor.length === 0 && <tr><td colSpan={6} className="mut">Nenhum produto abaixo do mínimo.</td></tr>}
              {repor.map(({ p, s }) => {
                const [txt, tipo] = situacao(p, s)
                const pct = p.min > 0 ? Math.min(100, (s / (p.min * 2)) * 100) : 100
                return (
                  <tr key={p.id}>
                    <td><b>{p.nome}</b></td>
                    <td>{p.cat}</td>
                    <td><b>{s}</b> {p.un}</td>
                    <td><div className="nivel" title={`Saldo ${s} · mínimo ${p.min}`}><i className={tipo} style={{ width: `${pct}%` }} /></div></td>
                    <td>{p.min}</td>
                    <td><Tag tipo={tipo}>{txt}</Tag></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}