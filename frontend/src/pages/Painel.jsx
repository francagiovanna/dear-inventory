import { Link } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/PageHeader'
import Icon from '../components/Icon'
import Tag from '../components/Tag'
import { saldo, diasParaVencer, gerarAlertas, situacao, DIAS_VENCIMENTO } from '../utils/stock'
import { hoje, brl } from '../utils/format'

export default function Painel() {
  const { db } = useStore()
  const { user } = useAuth()
  const perfil = user.perfil
  const ativos = db.produtos.filter((p) => p.ativo)
  const alertas = gerarAlertas(db, perfil)

  const dias = [...Array(7)].map((_, i) => hoje(i - 6))
  const soma = (data, tipo) => db.movs.filter((m) => m.data === data && m.tipo === tipo).reduce((a, m) => a + m.qtd, 0)
  const ent = dias.map((d) => soma(d, 'E'))
  const sai = dias.map((d) => soma(d, 'S'))
  const max = Math.max(1, ...ent, ...sai)

  const linhas = ativos.map((p) => ({ p, s: saldo(db.movs, p.id) }))
  const total = linhas.reduce((a, l) => a + l.s, 0)
  const valor = linhas.reduce((a, l) => a + l.s * l.p.custo, 0)
  const repor = linhas.filter((l) => l.s <= l.p.min)
  const vencendo = ativos.filter((p) => { const v = diasParaVencer(p); return v !== null && v <= DIAS_VENCIMENTO }).length

  const atalhos = [
    perfil !== 'financeiro' && { to: '/estoque?novo=E', icone: 'down', label: 'Registrar entrada' },
    perfil !== 'financeiro' && { to: '/estoque?novo=S', icone: 'up', label: 'Registrar saída' },
    perfil !== 'financeiro' && { to: '/produtos?novo=1', icone: 'box', label: 'Novo produto' },
    perfil !== 'gerente' && { to: '/financeiro?novo=1', icone: 'dollar', label: 'Nova despesa' },
  ].filter(Boolean)

  const cards = [
    { icone: 'layers', cor: '', valor: total.toLocaleString('pt-BR'), label: 'Itens em estoque', sub: `em ${ativos.length} produtos ativos` },
    { icone: 'dollar', cor: 'ok', valor: brl(valor), label: 'Valor em estoque', sub: 'calculado pelo custo atual' },
    { icone: 'bell', cor: 'warn', valor: repor.length, label: 'Abaixo do mínimo', sub: 'precisam de reposição' },
    { icone: 'tag', cor: 'bad', valor: vencendo, label: 'Vencendo', sub: `validade em até ${DIAS_VENCIMENTO} dias` },
  ]

  const dataExtenso = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
  const primeiroNome = user.nome.split(' ')[0]

  return (
    <>
      <PageHeader titulo="Painel" trilha="Principal" />
      <p className="hello">Olá, {primeiroNome}. Hoje é {dataExtenso}.</p>

      <div className="atalhos">
        {atalhos.map((a, i) => (
          <Link key={a.to} to={a.to} className={'atalho' + (i === 0 ? ' pri' : '')}><Icon nome={a.icone} /> {a.label}</Link>
        ))}
      </div>

      <div className="kpis">
        {cards.map((c) => (
          <div className={'kpi ' + c.cor} key={c.label}>
            <div className="k-top"><Icon nome={c.icone} size={18} /> {c.label}</div>
            <b>{c.valor}</b>
            <small>{c.sub}</small>
          </div>
        ))}
      </div>

      <div className="grid g2">
        <div className="panel pad">
          <b>Entradas e saídas dos últimos 7 dias</b>
          <div className="legenda">
            <span><i style={{ background: 'var(--c-in)' }} />Entradas</span>
            <span><i style={{ background: 'var(--c-out)' }} />Saídas</span>
          </div>
          <div className="bars">
            {dias.map((d, i) => (
              <div className="bc" key={d}>
                <div className="bp">
                  <i title={`Entradas: ${ent[i]}`} style={{ height: `${(ent[i] / max) * 100}%`, background: 'var(--c-in)' }}>
                    {ent[i] > 0 && <em>{ent[i]}</em>}
                  </i>
                  <i title={`Saídas: ${sai[i]}`} style={{ height: `${(sai[i] / max) * 100}%`, background: 'var(--c-out)' }}>
                    {sai[i] > 0 && <em>{sai[i]}</em>}
                  </i>
                </div>
                <small>{d.slice(8)}/{d.slice(5, 7)}</small>
              </div>
            ))}
          </div>
        </div>

        <div className="panel pad">
          <b>Avisos</b>
          {alertas.length === 0 && <p className="mut">Tudo em ordem.</p>}
          {alertas.slice(0, 6).map((a, i) => (
            <div className="al" key={i}><span className="dot" style={{ background: a.cor }} />{a.texto}</div>
          ))}
        </div>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="panel-h"><b>Produtos para repor</b><Link to="/estoque">Ver estoque</Link></div>
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
    </>
  )
}