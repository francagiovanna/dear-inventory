import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Icon from '../components/Icon'
import { useStore } from '../context/StoreContext'
import { useAuth } from '../context/AuthContext'
import { PERFIS } from '../config/menu'
import Modal from '../components/Modal'
import Tag from '../components/Tag'

const br = (d) => (d ? d.split('-').reverse().join('/') : '')
const SITUACAO = { pendente: ['Pendente', 'warn'], aprovada: ['Aprovada', 'ok'], recusada: ['Recusada', 'bad'] }

function UsuarioModal({ onClose }) {
  const { addUsuario } = useStore()
  const [f, setF] = useState({ nome: '', cargo: '', login: '', senha: '', perfil: 'gerente' })
  const [erro, setErro] = useState('')
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  function salvar() {
    const e = addUsuario(f)
    if (e) setErro(e)
    else onClose()
  }

  return (
    <Modal titulo="Novo usuário" onClose={onClose} onSave={salvar} erro={erro}>
      <label>Nome</label><input value={f.nome} onChange={set('nome')} />
      <label>Cargo</label><input value={f.cargo} onChange={set('cargo')} />
      <div className="row">
        <div><label>Login (usuário ou e-mail)</label><input value={f.login} onChange={set('login')} /></div>
        <div><label>Senha</label><input type="password" value={f.senha} onChange={set('senha')} /></div>
      </div>
      <label>Perfil</label>
      <select value={f.perfil} onChange={set('perfil')}>
        {Object.entries(PERFIS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </select>
    </Modal>
  )
}

// Aprovar = criar a conta a partir do pedido: o dono define login, senha inicial e perfil.
function AprovarModal({ sol, onClose }) {
  const { aprovarSolicitacao } = useStore()
  const [f, setF] = useState({ login: sol.email, senha: '', perfil: '' })
  const [erro, setErro] = useState('')
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  function salvar() {
    const e = aprovarSolicitacao(sol.id, f)
    if (e) setErro(e)
    else onClose()
  }

  return (
    <Modal titulo="Aprovar solicitação" salvarLabel="Criar conta" onClose={onClose} onSave={salvar} erro={erro}>
      <p className="mut" style={{ margin: '14px 0 0' }}>
        <b style={{ color: 'var(--txt)' }}>{sol.nome}</b>{sol.cargo ? ` · ${sol.cargo}` : ''}<br />{sol.email}
      </p>
      <label>Login</label><input value={f.login} onChange={set('login')} />
      <label>Senha inicial (informe ao usuário)</label><input value={f.senha} onChange={set('senha')} />
      <label>Perfil de acesso</label>
      <select value={f.perfil} onChange={set('perfil')}>
        <option value="">Selecione…</option>
        {Object.entries(PERFIS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </select>
    </Modal>
  )
}

export default function Usuarios() {
  const { db, alternarUsuario, recusarSolicitacao } = useStore()
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()
  const aba = params.get('aba') === 'solicitacoes' ? 'solicitacoes' : 'usuarios'
  const [novo, setNovo] = useState(false)
  const [analisando, setAnalisando] = useState(null)

  // pendentes primeiro, e dentro de cada grupo as mais recentes antes
  const sols = [...(db.solicitacoes || [])].sort((a, b) => {
    const pa = a.status === 'pendente', pb = b.status === 'pendente'
    return pa === pb ? b.id - a.id : pa ? -1 : 1
  })
  const pendentes = sols.filter((s) => s.status === 'pendente').length

  return (
    <>
      <PageHeader titulo="Usuários" trilha="Administração">
        <button className="btn" onClick={() => setNovo(true)}><Icon nome="plus" size={16} /> Incluir usuário</button>
      </PageHeader>

      <div className="panel">
        <div className="abas">
          <button className={'aba' + (aba === 'usuarios' ? ' on' : '')} onClick={() => setParams({})}>
            Usuários <span className="cnt">{db.users.length}</span>
          </button>
          <button className={'aba' + (aba === 'solicitacoes' ? ' on' : '')} onClick={() => setParams({ aba: 'solicitacoes' })}>
            Solicitações <span className="cnt">{pendentes}</span>
          </button>
        </div>

        <div className="tw">
          {aba === 'usuarios' ? (
            <table>
              <thead><tr><th>Nome</th><th>Cargo</th><th>Login</th><th>Perfil</th><th>Situação</th><th></th></tr></thead>
              <tbody>
                {db.users.map((u) => (
                  <tr key={u.id}>
                    <td><b>{u.nome}</b></td><td>{u.cargo}</td><td>{u.login}</td><td>{PERFIS[u.perfil]}</td>
                    <td><Tag tipo={u.ativo ? 'ok' : 'bad'}>{u.ativo ? 'Ativo' : 'Inativo'}</Tag></td>
                    <td className="acoes">
                      {u.id !== user.id && (
                        <button className="icon-btn dk" title={u.ativo ? 'Desativar' : 'Ativar'} onClick={() => alternarUsuario(u.id)}><Icon nome="power" size={16} /></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table>
              <thead><tr><th>Nome</th><th>E-mail</th><th>Cargo ou setor</th><th>Data</th><th>Situação</th><th></th></tr></thead>
              <tbody>
                {sols.length === 0 && <tr><td colSpan={6} className="mut">Nenhuma solicitação de acesso até agora.</td></tr>}
                {sols.map((s) => {
                  const [txt, tipo] = SITUACAO[s.status] || SITUACAO.pendente
                  return (
                    <tr key={s.id}>
                      <td><b>{s.nome}</b></td><td>{s.email}</td><td>{s.cargo || '—'}</td><td>{br(s.data)}</td>
                      <td><Tag tipo={tipo}>{txt}</Tag></td>
                      <td className="acoes">
                        {s.status === 'pendente' && (
                          <>
                            <button className="btn sm" onClick={() => setAnalisando(s)}>Aprovar</button>
                            <button
                              className="btn sec sm" style={{ marginLeft: 6 }}
                              onClick={() => window.confirm(`Recusar a solicitação de ${s.nome}?`) && recusarSolicitacao(s.id)}
                            >Recusar</button>
                          </>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {novo && <UsuarioModal onClose={() => setNovo(false)} />}
      {analisando && <AprovarModal sol={analisando} onClose={() => setAnalisando(null)} />}
    </>
  )
}