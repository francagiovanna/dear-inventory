import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthLayout from '../components/AuthLayout'

// Ícones inline
const Svg = ({ children }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
)

export default function Login() {
  const { entrar } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [ver, setVer] = useState(false)
  const [erro, setErro] = useState('')
  const [ajuda, setAjuda] = useState(false)
  const [enviando, setEnviando] = useState(false)

  async function enviar(e) {
    e.preventDefault()
    setErro('')

    if (!email.trim() || !senha) {
      setErro('Informe e-mail e senha.')
      return
    }

    if (enviando) return
    setEnviando(true)

    try {
      const resultado = await entrar(email.trim(), senha)
      if (resultado !== true) {
        setErro('E-mail ou senha inválidos.')
        return
      }
      navigate('/', { replace: true })
    } catch {
      setErro('Não foi possível entrar. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <AuthLayout>
      <form className="login-card" onSubmit={enviar} noValidate>
        <h1>Bem-vindo de volta</h1>
        <p className="sub">Acesse sua conta para continuar</p>

        <label htmlFor="email">E-mail</label>
        <div className="login-input">
          <Svg>
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m3 7 9 6 9-6" />
          </Svg>
          <input
            id="email"
            type="email"
            autoComplete="username"
            autoFocus
            placeholder="Digite seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <label htmlFor="senha">Senha</label>
        <div className="login-input">
          <Svg>
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </Svg>
          <input
            id="senha"
            type={ver ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Digite sua senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          <button
            type="button"
            className="icon-btn login-eye"
            onClick={() => setVer(!ver)}
            title={ver ? 'Ocultar senha' : 'Mostrar senha'}
            aria-label={ver ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {ver ? (
              <Svg>
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                <circle cx="12" cy="12" r="3" />
              </Svg>
            ) : (
              <Svg>
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                <circle cx="12" cy="12" r="3" />
                <path d="M3 3l18 18" />
              </Svg>
            )}
          </button>
        </div>

        <div className="login-row">
          <button type="button" className="link" onClick={() => setAjuda(!ajuda)}>
            Esqueceu sua senha?
          </button>
        </div>
        {ajuda && <div className="login-help">Para redefinir sua senha, fale com o administrador do sistema.</div>}
        {erro && <div className="err" role="alert" style={{ margin: '0 0 14px' }}>{erro}</div>}

        <button type="submit" className="btn login-btn" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
          {!enviando && (
            <Svg>
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </Svg>
          )}
        </button>

        <p className="login-note">Não tem uma conta? <Link to="/cadastro">Solicite acesso</Link></p>
      </form>
    </AuthLayout>
  )
}