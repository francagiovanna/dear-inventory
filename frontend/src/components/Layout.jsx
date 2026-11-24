import { useEffect, useState } from 'react'
import { Link, NavLink, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useStore } from '../context/StoreContext'
import { MENU, PERFIS } from '../config/menu'
import { gerarAlertas } from '../utils/stock'
import Icon from './Icon'
import AvisoItem from './AvisoItem'
import { DearMark } from './DearLogo'

export default function Layout() {
  const { user, sair } = useAuth()
  const { db } = useStore()
  const [mini, setMini] = useState(false)
  const [pop, setPop] = useState(null) // 'avisos' | 'user' | null
  const [tema, setTema] = useState(() => document.documentElement.dataset.theme || 'light')

  useEffect(() => {
    document.documentElement.dataset.theme = tema
    try { localStorage.setItem('dear-tema', tema) } catch { /* ignora */ }
  }, [tema])

  // Esc fecha o popup aberto
  useEffect(() => {
    if (!pop) return
    const fechar = (e) => { if (e.key === 'Escape') setPop(null) }
    window.addEventListener('keydown', fechar)
    return () => window.removeEventListener('keydown', fechar)
  }, [pop])

  // Sem usuário (logo após sair), volta para o login antes de ler user.perfil.
  if (!user) return <Navigate to="/login" replace />

  const alertas = gerarAlertas(db, user.perfil)
  const itens = MENU.filter((m) => m.perfis.includes(user.perfil))
  const grupos = [...new Set(itens.map((i) => i.grupo))]

  return (
    <>
      <aside className={'side' + (mini ? ' mini' : '')}>
        <div className="side-head">
          <DearMark size={34} cor="#DCE7FF" className="side-logo" />
          <div className="brand lbl">DEAR <span>Inventory</span></div>
        </div>
        {grupos.map((g) => (
          <div key={g}>
            <div className="grp">{g}</div>
            {itens.filter((i) => i.grupo === g).map((i) => (
              <NavLink key={i.to} to={i.to} end className={({ isActive }) => 'nav' + (isActive ? ' on' : '')} title={i.label}>
                <Icon nome={i.icone} />
                <span className="lbl">{i.label}</span>
                {i.to === '/alertas' && alertas.length > 0 && <span className="nav-n lbl">{alertas.length}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </aside>

      <header className={'topbar' + (mini ? ' mini' : '')}>
        <button className="icon-btn" onClick={() => setMini(!mini)} title="Menu"><Icon nome="menu" /></button>
        <div className="spacer" />

        <button
          className="icon-btn"
          onClick={() => setTema(tema === 'light' ? 'dark' : 'light')}
          title={tema === 'light' ? 'Modo escuro' : 'Modo claro'}
        >
          <Icon nome={tema === 'light' ? 'moon' : 'sun'} />
        </button>

        <div className="pop-wrap">
          <button className="icon-btn" onClick={() => setPop(pop === 'avisos' ? null : 'avisos')} title="Avisos">
            <Icon nome="bell" />
            {alertas.length > 0 && <span className="badge">{alertas.length}</span>}
          </button>
          {pop === 'avisos' && (
            <div className="pop">
              <b>Avisos</b>
              {alertas.length === 0 && <p className="mut">Tudo em ordem.</p>}
              <div className="av-list">
                {alertas.slice(0, 6).map((a, i) => <AvisoItem key={i} a={a} onClick={() => setPop(null)} />)}
              </div>
              <Link className="pop-link" to="/alertas" onClick={() => setPop(null)}>Ver todos os alertas</Link>
            </div>
          )}
        </div>

        <div className="pop-wrap">
          <button className={'user' + (pop === 'user' ? ' open' : '')} onClick={() => setPop(pop === 'user' ? null : 'user')}>
            <span className="avatar">{user.nome[0]}</span>
            <span className="user-t"><b>{user.nome}</b><small>{PERFIS[user.perfil]}</small></span>
            <svg className="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          {pop === 'user' && (
            <div className="pop user-pop">
              <div className="up-head">
                <span className="avatar">{user.nome[0]}</span>
                <div>
                  <b>{user.nome}</b>
                  <small>{PERFIS[user.perfil]}</small>
                  <small>{user.login}</small>
                </div>
              </div>
              <div className="up-sep" />
              <button className="pop-item danger" onClick={sair}>
                <Icon nome="logout" size={16} /> Sair
              </button>
            </div>
          )}
        </div>
      </header>

      {pop && <div className="scrim" onClick={() => setPop(null)} />}

      <main className={'content' + (mini ? ' mini' : '')}>
        <div className="wrap">
          <Outlet />
        </div>
      </main>
    </>
  )
}