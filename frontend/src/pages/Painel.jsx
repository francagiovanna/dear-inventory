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
    { icone: 'layers', cor: 'blue', valor: total.toLocaleString('pt-BR'), label: 'itens em estoque' },
    { icone: 'dollar', cor: 'ok', valor: brl(valor), label: 'valor em estoque' },
    { icone: 'bell', cor: 'warn', valor: repor.length, label: 'abaixo do mínimo' },
    { icone: 'tag', cor: 'bad', valor: vencendo, label: `vencendo em ${DIAS_VENCIMENTO} dias` },
  ]

  return (
    <>
      <PageHeader titulo="Painel" trilha="Principal" />

      <div className="atalhos">
        {atalhos.map((a) => (
          <Link key={a.to} to={a.to} className="atalho"><Icon nome={a.icone} /> {a.label}</Link>
        ))}
      </div>

      <div className="kpis">
        {cards.map((c) => (
          <div className="kpi" key={c.label}>
            <div className={'ic ' + c.cor}><Icon nome={c.icone} size={22} /></div>
            <div><b>{c.valor}</b><span>{c.label}</span></div>
          </div>
        ))}
      </div>

      <div className="grid g2">
        <div className="panel pad">
          <b>Entradas e saídas dos últimos 7 dias</b>
          <div className="bars">
            {dias.map((d, i) => (
              <div className="bc" key={d}>
                <div className="bp">
                  <i title={`Entradas: ${ent[i]}`} style={{ height: `${(ent[i] / max) * 100}%`, background: 'var(--blue)' }} />
                  <i title={`Saídas: ${sai[i]}`} style={{ height: `${(sai[i] / max) * 100}%`, background: '#9db4f0' }} />
                </div>
                <small>{d.slice(8)}/{d.slice(5, 7)}</small>
              </div>
            ))}
          </div>
          <p className="mut" style={{ margin: '8px 0 0' }}>
            <span style={{ color: 'var(--blue)' }}>■</span> Entradas &nbsp;<span style={{ color: '#9db4f0' }}>■</span> Saídas
          </p>
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
            <thead><tr><th>Produto</th><th>Categoria</th><th>Saldo</th><th>Mínimo</th><th>Situação</th></tr></thead>
            <tbody>
              {repor.length === 0 && <tr><td colSpan={5} className="mut">Nenhum produto abaixo do mínimo.</td></tr>}
              {repor.map(({ p, s }) => {
                const [txt, tipo] = situacao(p, s)
                return <tr key={p.id}><td>{p.nome}</td><td>{p.cat}</td><td><b>{s}</b> {p.un}</td><td>{p.min}</td><td><Tag tipo={tipo}>{txt}</Tag></td></tr>
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
