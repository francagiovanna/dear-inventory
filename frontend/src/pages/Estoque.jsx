import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Abas from '../components/Abas'
import Paginacao, { usePaginacao } from '../components/Paginacao'
import Icon from '../components/Icon'
import { useStore } from '../context/StoreContext'
import { useAuth } from '../context/AuthContext'
import Modal from '../components/Modal'
import Tag from '../components/Tag'
import { brl, fd } from '../utils/format'
import { saldo, situacao, diasParaVencer, DIAS_VENCIMENTO } from '../utils/stock'

function MovModal({ tipo, onClose }) {
  const { db, registrarMov } = useStore()
  const { user } = useAuth()
  const ativos = db.produtos.filter((p) => p.ativo)
  const valorPadrao = (p) => (p ? (tipo === 'E' ? p.custo : p.preco) : '')

  const [pid, setPid] = useState(ativos[0]?.id)
  const [qtd, setQtd] = useState('')
  const [valor, setValor] = useState(valorPadrao(ativos[0]))
  const [liberar, setLiberar] = useState(false)
  const [erro, setErro] = useState('')

  const produto = db.produtos.find((p) => p.id === pid)
  if (!produto) return null

  const v = diasParaVencer(produto)
  const exigeLiberacao = tipo === 'S' && v !== null && v <= DIAS_VENCIMENTO
  const podeLiberar = ['admin', 'gerente'].includes(user.perfil)

  function trocar(e) {
    const id = Number(e.target.value)
    setPid(id)
    setValor(valorPadrao(db.produtos.find((p) => p.id === id)))
    setLiberar(false)
  }

  function salvar() {
    const e = registrarMov({
      tipo,
      produto,
      qtd: Number(qtd),
      valor: Number(valor),
      actorId: user.id,
      liberar,
    })

    if (e) setErro(e)
    else onClose()
  }

  return (
    <Modal
      titulo={tipo === 'E' ? 'Registrar entrada' : 'Registrar saída'}
      onClose={onClose}
      onSave={salvar}
      salvarLabel="Registrar"
      erro={erro}
    >
      <label>Produto</label>
      <select value={pid} onChange={trocar}>
        {ativos.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nome} (saldo {saldo(db.movs, p.id)})
          </option>
        ))}
      </select>

      <div className="row">
        <div>
          <label>Quantidade</label>
          <input
            type="number"
            min="0.01"
            step="any"
            value={qtd}
            onChange={(e) => setQtd(e.target.value)}
          />
        </div>

        <div>
          <label>{tipo === 'E' ? 'Custo unitário' : 'Valor unitário'}</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
          />
        </div>
      </div>

      {exigeLiberacao && (
        <div className="card" style={{ marginTop: 12, borderColor: 'var(--warn)' }}>
          <b>⚠ Produto {v < 0 ? 'vencido' : `vence em ${v} dias`}</b>
          <br />
          <span className="mut">A saída exige liberação do gerente.</span>

          {podeLiberar ? (
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
              <input
                type="checkbox"
                style={{ width: 'auto' }}
                checked={liberar}
                onChange={(e) => setLiberar(e.target.checked)}
              />
              Libero esta saída (autorização de {user.nome})
            </label>
          ) : (
            <p className="err">Seu perfil não pode liberar. Peça ao gerente.</p>
          )}
        </div>
      )}
    </Modal>
  )
}

export default function Estoque() {
  const { db } = useStore()
  const { user } = useAuth()
  const [sp] = useSearchParams()
  const [q, setQ] = useState('')
  const [aba, setAba] = useState('todos')

  const [modal, setModal] = useState(
    ['E', 'S'].includes(sp.get('novo')) && user.perfil !== 'financeiro'
      ? sp.get('novo')
      : null
  )

  const podeMovimentar = user.perfil !== 'financeiro'

  const nome = (id) => db.produtos.find((p) => p.id === id)?.nome || '?'
  const termo = q.toLowerCase()

  const linhas = db.produtos
    .filter((p) => p.ativo && (p.nome + p.codigo + p.cat).toLowerCase().includes(termo))
    .map((p) => {
      const s = saldo(db.movs, p.id)
      return {
        p,
        s,
        sit: situacao(p, s),
        v: diasParaVencer(p),
      }
    })

  const grupos = {
    todos: linhas,
    minimo: linhas.filter((l) => l.s <= l.p.min),
    vencendo: linhas.filter((l) => l.v !== null && l.v <= DIAS_VENCIMENTO),
  }

  const hist = [...db.movs]
    .reverse()
    .filter((m) => nome(m.pid).toLowerCase().includes(termo))

  const lista = aba === 'historico' ? hist : grupos[aba]
  const pg = usePaginacao(lista)

  const abas = [
    { id: 'todos', label: 'Posição atual', n: grupos.todos.length },
    { id: 'minimo', label: 'Abaixo do mínimo', n: grupos.minimo.length },
    { id: 'vencendo', label: 'Vencendo', n: grupos.vencendo.length },
    { id: 'historico', label: 'Histórico de movimentações', n: hist.length },
  ]

  return (
    <>
      <PageHeader titulo="Estoque" trilha="Operação">
        {podeMovimentar && (
          <>
            <button className="btn sec" onClick={() => setModal('S')}>
              <Icon nome="up" size={16} /> Registrar saída
            </button>

            <button className="btn" onClick={() => setModal('E')}>
              <Icon nome="down" size={16} /> Registrar entrada
            </button>
          </>
        )}
      </PageHeader>

      <div className="filtros card">
        <div>
          <label>Buscar</label>
          <input
            placeholder="Produto, código ou categoria"
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              pg.ir(1)
            }}
          />
        </div>

        <button className="btn sec" onClick={() => setQ('')}>
          Limpar
        </button>
      </div>

      <div className="panel">
        <Abas
          abas={abas}
          atual={aba}
          onChange={(a) => {
            setAba(a)
            pg.ir(1)
          }}
        />

        <div className="tw">
          {aba === 'historico' ? (
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Tipo</th>
                  <th>Produto</th>
                  <th>Qtd</th>
                  <th>Valor unit.</th>
                  <th>Responsável</th>
                  <th>Liberação</th>
                </tr>
              </thead>

              <tbody>
                {pg.itens.map((m) => (
                  <tr key={m.id}>
                    <td>{fd(m.data)}</td>
                    <td>
                      <Tag tipo={m.tipo === 'E' ? 'ok' : 'warn'}>
                        {m.tipo === 'E' ? 'Entrada' : 'Saída'}
                      </Tag>
                    </td>
                    <td>{nome(m.pid)}</td>
                    <td>{m.qtd}</td>
                    <td>{brl(m.valor)}</td>
                    <td>{m.user}</td>
                    <td>{m.aut || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Categoria</th>
                  <th>Saldo</th>
                  <th>Mínimo</th>
                  <th>Valor em estoque</th>
                  <th>Validade</th>
                  <th>Situação</th>
                </tr>
              </thead>

              <tbody>
                {pg.itens.map(({ p, s, sit }) => (
                  <tr key={p.id}>
                    <td><b>{p.nome}</b></td>
                    <td>{p.cat}</td>
                    <td><b>{s}</b> {p.un}</td>
                    <td>{p.min}</td>
                    <td>{brl(s * p.custo)}</td>
                    <td>{fd(p.val)}</td>
                    <td><Tag tipo={sit[1]}>{sit[0]}</Tag></td>
                  </tr>
                ))}

                {pg.total === 0 && (
                  <tr>
                    <td colSpan={7} className="mut">Nada por aqui.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <Paginacao pg={pg} />
      </div>

      {modal && (
        <MovModal
          tipo={modal}
          onClose={() => setModal(null)}
        />
      )}
    </>
  )
}