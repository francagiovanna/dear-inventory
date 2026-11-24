import logo from '../assets/logo-dear.png'
import armazem from '../assets/login-armazem.png'

// Moldura das telas de acesso (login e cadastro): painel azul à esquerda, conteúdo à direita.
export default function AuthLayout({ children }) {
  return (
    <div className="login">
      <section className="login-l">
        <img className="login-logo" src={logo} alt="DEAR Inventory" />
        <div className="login-copy">
          <h2>Controle seu estoque <span>em um só lugar.</span></h2>
          <i className="login-bar" />
        </div>
        <img className="login-ilus" src={armazem} alt="" />
      </section>
      <section className="login-r">{children}</section>
    </div>
  )
}
