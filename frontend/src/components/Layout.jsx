import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useStore } from '../context/StoreContext'
import { MENU, PERFIS } from '../config/menu'
import { gerarAlertas } from '../utils/stock'
import Icon from './Icon'

export default function Layout() {
  const { user, sair } = useAuth()
  const { db } = useStore()
  const navigate = useNavigate()
  const [mini, setMini] = useState(false)
  const [pop, setPop] = useState(null) // 'avisos' | 'user' | null
  const [tema, setTema] = useState(() => document.documentElement.dataset.theme || 'light')

  useEffect(() => {
    document.documentElement.dataset.theme = tema
    try { localStorage.setItem('dear-tema', tema) } catch { /* ignora */ }
  }, [tema])

  const alertas = gerarAlertas(db, user.perfil)
  const itens = MENU.filter((m) => m.perfis.includes(user.perfil))
  const grupos = [...new Set(itens.map((i) => i.grupo))]

  return (
    <>
      <header className="topbar">
        <button className="icon-btn" onClick={() => setMini(!mini)} title="Menu"><Icon nome="menu" /></button>
        <div className="brand">DEAR <span>Inventory</span></div>
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
              {alertas.slice(0, 8).map((a, i) => (
                <div className="al" key={i}><span className="dot" style={{ background: a.cor }} />{a.texto}</div>
              ))}
            </div>
          )}
        </div>

        <div className="pop-wrap">
          <button className="user" onClick={() => setPop(pop === 'user' ? null : 'user')}>
            <span className="avatar">{user.nome[0]}</span>
            <span className="user-t"><b>{user.nome}</b><small>{PERFIS[user.perfil]}</small></span>
          </button>
          {pop === 'user' && (
            <div className="pop" style={{ width: 200 }}>
              <button className="pop-item" onClick={() => { sair(); navigate('/login') }}>
                <Icon nome="logout" size={16} /> Sair
              </button>
            </div>
          )}
        </div>
      </header>

      {pop && <div className="scrim" onClick={() => setPop(null)} />}

      <aside className={'side' + (mini ? ' mini' : '')}>
        {grupos.map((g) => (
          <div key={g}>
            <div className="grp">{g}</div>
            {itens.filter((i) => i.grupo === g).map((i) => (
              <NavLink key={i.to} to={i.to} end className={({ isActive }) => 'nav' + (isActive ? ' on' : '')} title={i.label}>
                <Icon nome={i.icone} />
                <span className="lbl">{i.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </aside>

      <main className={'content' + (mini ? ' mini' : '')}>
        <Outlet />
      </main>
    </>
  )
}