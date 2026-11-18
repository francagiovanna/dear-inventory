import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Abas from '../components/Abas'
import Paginacao, { usePaginacao } from '../components/Paginacao'
import Icon from '../components/Icon'
import { useStore } from '../context/StoreContext'
import { useAuth } from '../context/AuthContext'
import { PERFIS } from '../config/menu'
import Modal from '../components/Modal'
import Tag from '../components/Tag'

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
        <div><label>Login</label><input value={f.login} onChange={set('login')} /></div>
        <div><label>Senha</label><input type="password" value={f.senha} onChange={set('senha')} /></div>
      </div>
      <label>Perfil</label>
      <select value={f.perfil} onChange={set('perfil')}>
        {Object.entries(PERFIS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </select>
    </Modal>
  )
}

export default function Usuarios() {
  const { db, alternarUsuario } = useStore()
  const { user } = useAuth()
  const [aberto, setAberto] = useState(false)

  return (
    <>
      <PageHeader titulo="Usuários" trilha="Administração">
        <button className="btn" onClick={() => setAberto(true)}><Icon nome="plus" size={16} /> Incluir usuário</button>
      </PageHeader>
      <div className="panel">
        <div className="tw">
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
        </div>
      </div>
      {aberto && <UsuarioModal onClose={() => setAberto(false)} />}
    </>
  )
}
