import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Abas from '../components/Abas'
import Paginacao, { usePaginacao } from '../components/Paginacao'
import Icon from '../components/Icon'
import { useStore } from '../context/StoreContext'
import Modal from '../components/Modal'
import Tag from '../components/Tag'
import { brl, fd, hoje, diffDias } from '../utils/format'
import { calcFinanceiro } from '../utils/stock'

const CATEGORIAS = ['Aluguel', 'Fornecedores', 'Impostos', 'Contas', 'Outros']

function DespesaModal({ onClose }) {
  const { addDespesa } = useStore()
  const [f, setF] = useState({ desc: '', cat: CATEGORIAS[0], valor: '', venc: hoje(7) })
  const [erro, setErro] = useState('')
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  function salvar() {
    const e = addDespesa(f)
    if (e) setErro(e)
    else onClose()
  }

  return (
    <Modal titulo="Nova despesa" onClose={onClose} onSave={salvar} erro={erro}>
      <label>Descrição</label><input value={f.desc} onChange={set('desc')} />
      <label>Categoria</label>
      <select value={f.cat} onChange={set('cat')}>{CATEGORIAS.map((c) => <option key={c}>{c}</option>)}</select>
      <div className="row">
        <div><label>Valor</label><input type="number" step="0.01" value={f.valor} onChange={set('valor')} /></div>
        <div><label>Vencimento</label><input type="date" value={f.venc} onChange={set('venc')} /></div>
      </div>
    </Modal>
  )
}

export default function Financeiro() {
  const { db, pagarDespesa } = useStore()
  const [sp] = useSearchParams()
  const [aberto, setAberto] = useState(!!sp.get('novo'))
  const [aba, setAba] = useState('todas')
  const r = calcFinanceiro(db, hoje(-30), hoje())

  const ordenadas = [...db.desp].sort((a, b) => a.venc.localeCompare(b.venc))
  const grupos = {
    todas: ordenadas,
    pendentes: ordenadas.filter((x) => !x.pago && diffDias(x.venc) >= 0),
    vencidas: ordenadas.filter((x) => !x.pago && diffDias(x.venc) < 0),
    pagas: ordenadas.filter((x) => x.pago),
  }
  const pg = usePaginacao(grupos[aba])
  const abas = [
    { id: 'todas', label: 'Todas', n: grupos.todas.length },
    { id: 'pendentes', label: 'A vencer', n: grupos.pendentes.length },
    { id: 'vencidas', label: 'Vencidas', n: grupos.vencidas.length },
    { id: 'pagas', label: 'Pagas', n: grupos.pagas.length },
  ]

  return (
    <>
      <PageHeader titulo="Financeiro" trilha="Gestão">
        <button className="btn" onClick={() => setAberto(true)}><Icon nome="plus" size={16} /> Incluir despesa</button>
      </PageHeader>

      <div className="kpis">
        <div className="kpi"><div className="ic blue"><Icon nome="dollar" size={22} /></div><div><b>{brl(r.vendas)}</b><span>vendas (30 dias)</span></div></div>
        <div className="kpi"><div className="ic warn"><Icon nome="tag" size={22} /></div><div><b>{brl(r.custo + r.despesas)}</b><span>custo dos produtos + despesas</span></div></div>
        <div className="kpi"><div className={'ic ' + (r.lucro >= 0 ? 'ok' : 'bad')}><Icon nome="chart" size={22} /></div><div><b>{brl(r.lucro)}</b><span>lucro do período</span></div></div>
      </div>

      <div className="panel">
        <Abas abas={abas} atual={aba} onChange={(a) => { setAba(a); pg.ir(1) }} />
        <div className="tw">
          <table>
            <thead><tr><th>Descrição</th><th>Categoria</th><th>Valor</th><th>Vencimento</th><th>Situação</th><th></th></tr></thead>
            <tbody>
              {pg.itens.map((x) => {
                const n = diffDias(x.venc)
                const tipo = x.pago ? 'ok' : n < 0 ? 'bad' : n <= 7 ? 'warn' : ''
                return (
                  <tr key={x.id}>
                    <td><b>{x.desc}</b></td><td>{x.cat}</td><td>{brl(x.valor)}</td><td>{fd(x.venc)}</td>
                    <td><Tag tipo={tipo}>{x.pago ? 'Paga' : n < 0 ? 'Vencida' : 'A vencer'}</Tag></td>
                    <td>{!x.pago && <button className="btn sec sm" onClick={() => pagarDespesa(x.id)}><Icon nome="check" size={14} /> Marcar como paga</button>}</td>
                  </tr>
                )
              })}
              {pg.total === 0 && <tr><td colSpan={6} className="mut">Nenhuma despesa nesta lista.</td></tr>}
            </tbody>
          </table>
        </div>
        <Paginacao pg={pg} />
      </div>
      <p className="mut">Lucro = vendas − custo dos produtos vendidos − despesas.</p>

      {aberto && <DespesaModal onClose={() => setAberto(false)} />}
    </>
  )
}
