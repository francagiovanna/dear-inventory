import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { useStore } from '../context/StoreContext'

const Svg = ({ children }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
)

export default function Cadastro() {
  const { solicitarAcesso } = useStore()

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [cargo, setCargo] = useState('')
  const [erro, setErro] = useState('')
  const [enviado, setEnviado] = useState(false)

  function enviar(e) {
    e.preventDefault()
    setErro('')

    // O StoreContext valida e grava em db.solicitacoes (a mesma fonte que o admin lê).
    const e2 = solicitarAcesso({ nome, email, cargo })

    if (e2) {
      setErro(e2)
      return
    }

    setEnviado(true)
  }

  if (enviado) {
    return (
      <AuthLayout>
        <div className="login-card" style={{ textAlign: 'center' }}>
          <div className="login-ok">
            <Svg>
              <path d="m5 12 5 5 9-10" />
            </Svg>
          </div>

          <h1>Solicitação enviada</h1>

          <p className="sub" style={{ marginBottom: 28 }}>
            O administrador vai analisar seu pedido, definir seu perfil de acesso e criar sua conta com o e-mail informado.
          </p>

          <Link to="/login" className="btn login-btn">
            Voltar para o login
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <form className="login-card" onSubmit={enviar} noValidate>
        <h1>Solicite seu acesso</h1>
        <p className="sub">
          Preencha seus dados e o administrador libera sua conta
        </p>

        <label htmlFor="nome">Nome completo</label>

        <div className="login-input">
          <Svg>
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21a8 8 0 0 1 16 0" />
          </Svg>

          <input
            id="nome"
            maxLength={120}
            autoComplete="name"
            autoFocus
            placeholder="Digite seu nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>

        <label htmlFor="email">E-mail</label>

        <div className="login-input">
          <Svg>
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m3 7 9 6 9-6" />
          </Svg>

          <input
            id="email"
            type="email"
            maxLength={254}
            autoComplete="email"
            placeholder="Digite seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <label htmlFor="cargo">
          Cargo ou setor{' '}
          <span className="mut" style={{ fontWeight: 500 }}>
            (opcional)
          </span>
        </label>

        <div className="login-input">
          <Svg>
            <rect x="3" y="7" width="18" height="13" rx="2" />
            <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
          </Svg>

          <input
            id="cargo"
            maxLength={80}
            placeholder="Ex.: estoquista, financeiro"
            value={cargo}
            onChange={(e) => setCargo(e.target.value)}
          />
        </div>

        {erro && (
          <div
            className="err"
            role="alert"
            style={{ margin: '14px 0 0' }}
          >
            {erro}
          </div>
        )}

        <button
          type="submit"
          className="btn login-btn"
          style={{ marginTop: 24 }}
        >
          Enviar solicitação

          <Svg>
            <path d="M5 12h14" />
            <path d="m13 6 6 6-6 6" />
          </Svg>
        </button>

        <p className="login-note">
          Já tem uma conta? <Link to="/login">Entrar</Link>
        </p>
      </form>
    </AuthLayout>
  )
}