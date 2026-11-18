import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { user, entrar } = useAuth()
  const navigate = useNavigate()
  const [login, setLogin] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')

  if (user) return <Navigate to="/" replace />

  function enviar(e) {
    e.preventDefault()
    if (entrar(login, senha)) navigate('/')
    else setErro('Login ou senha inválidos.')
  }

  return (
    <div className="split">
      <div className="split-l">
        <div className="brand big">DEAR <span>Inventory</span></div>
        <h2>Estoque em tempo real</h2>
        <p>Saber sempre o que entra e o que sai.</p>
      </div>
      <form className="split-r" onSubmit={enviar}>
        <h2 style={{ margin: 0 }}>Acessar o sistema</h2>
        <p className="mut">Os acessos são criados apenas pelo dono.</p>
        <label>Login</label>
        <input value={login} onChange={(e) => setLogin(e.target.value)} autoComplete="username" />
        <label>Senha</label>
        <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="current-password" />
        {erro && <div className="err">{erro}</div>}
        <button className="btn" style={{ width: '100%', marginTop: 16, padding: 11 }}>Entrar</button>
        <p className="mut" style={{ fontSize: 13, marginTop: 20 }}>Demonstração (senha 1234):</p>
        {['dono', 'gerente', 'financeiro'].map((l) => (
          <span key={l} className="tag chip" onClick={() => { setLogin(l); setSenha('1234') }}>{l}</span>
        ))}
      </form>
    </div>
  )
}
