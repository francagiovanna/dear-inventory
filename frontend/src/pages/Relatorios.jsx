import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Abas from '../components/Abas'
import Paginacao, { usePaginacao } from '../components/Paginacao'
import Icon from '../components/Icon'
import { useStore } from '../context/StoreContext'
import { useAuth } from '../context/AuthContext'
import Tag from '../components/Tag'
import { brl, fd, hoje } from '../utils/format'
import { saldo, situacao, calcFinanceiro } from '../utils/stock'

const NOMES = { vendas: 'Vendas', estoque: 'Estoque', financeiro: 'Financeiro', entradas: 'Entradas' }

export default function Relatorios() {
  const { db } = useStore()
  const { user } = useAuth()
  const abas = user.perfil === 'gerente' ? ['vendas', 'estoque', 'entradas'] : ['vendas', 'estoque', 'financeiro', 'entradas']
  const [aba, setAba] = useState('vendas')
  const [de, setDe] = useState(hoje(-30))
  const [ate, setAte] = useState(hoje())
  const [cat, setCat] = useState('')

  const prod = (id) => db.produtos.find((p) => p.id === id)
  const filtra = (m) => m.data >= de && m.data <= ate && (!cat || prod(m.pid)?.cat === cat)

  function tabela() {
    if (aba === 'vendas' || aba === 'entradas') {
      const tipo = aba === 'vendas' ? 'S' : 'E'
      const l = db.movs.filter((m) => m.tipo === tipo && filtra(m))
      return (
        <table>
          <thead><tr><th>Data</th><th>Produto</th><th>Categoria</th><th>Qtd</th><th>Valor unit.</th><th>Total</th><th>Usuário</th></tr></thead>
          <tbody>
            {l.map((m) => (
              <tr key={m.id}>
                <td>{fd(m.data)}</td><td>{prod(m.pid)?.nome}</td><td>{prod(m.pid)?.cat}</td>
                <td>{m.qtd}</td><td>{brl(m.valor)}</td><td>{brl(m.qtd * m.valor)}</td><td>{m.user}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr><td colSpan={3}>Total</td><td>{l.reduce((a, m) => a + m.qtd, 0)}</td><td></td><td>{brl(l.reduce((a, m) => a + m.qtd * m.valor, 0))}</td><td></td></tr>
          </tfoot>
        </table>
      )
    }
    if (aba === 'estoque') {
      const l = db.produtos.filter((p) => !cat || p.cat === cat)
      return (
        <table>
          <thead><tr><th>Produto</th><th>Categoria</th><th>Saldo</th><th>Valor em estoque</th><th>Situação</th></tr></thead>
          <tbody>
            {l.map((p) => {
              const s = saldo(db.movs, p.id)
              const [txt, tipo] = situacao(p, s)
              return <tr key={p.id}><td>{p.nome}</td><td>{p.cat}</td><td>{s}</td><td>{brl(s * p.custo)}</td><td><Tag tipo={tipo}>{txt}</Tag></td></tr>
            })}
          </tbody>
          <tfoot><tr><td colSpan={3}>Total</td><td>{brl(l.reduce((a, p) => a + saldo(db.movs, p.id) * p.custo, 0))}</td><td></td></tr></tfoot>
        </table>
      )
    }
    const r = calcFinanceiro(db, de, ate)
    return (
      <table>
        <thead><tr><th>Item</th><th>Valor</th></tr></thead>
        <tbody>
          <tr><td>Vendas</td><td>{brl(r.vendas)}</td></tr>
          <tr><td>Custo dos produtos vendidos</td><td>− {brl(r.custo)}</td></tr>
          <tr><td>Despesas</td><td>− {brl(r.despesas)}</td></tr>
        </tbody>
        <tfoot><tr><td>Lucro</td><td>{brl(r.lucro)}</td></tr></tfoot>
      </table>
    )
  }

  return (
    <>
      <PageHeader titulo="Relatórios" trilha="Gestão" />

      <div className="filtros card">
        <div><label>De</label><input type="date" value={de} onChange={(e) => setDe(e.target.value)} /></div>
        <div><label>Até</label><input type="date" value={ate} onChange={(e) => setAte(e.target.value)} /></div>
        <div>
          <label>Categoria</label>
          <select value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="">Todas</option>
            {db.cats.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="panel">
        <Abas abas={abas.map((a) => ({ id: a, label: NOMES[a] }))} atual={aba} onChange={setAba} />
        <div className="tw">{tabela()}</div>
      </div>
    </>
  )
}
