import Icon from './Icon'

// Painel lateral (drawer) para formulários. Mantém as mesmas props do antigo Modal.
export default function Modal({ titulo, onClose, onSave, salvarLabel = 'Salvar', erro, children }) {
  return (
    <div className="scrim dark" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <aside className="drawer">
        <div className="drawer-h">
          <h2>{titulo}</h2>
          <button className="icon-btn dk" onClick={onClose} title="Fechar"><Icon nome="x" /></button>
        </div>
        <div className="drawer-b">
          {children}
          {erro && <div className="err">{erro}</div>}
        </div>
        <div className="drawer-f">
          <button className="btn sec" onClick={onClose}>Cancelar</button>
          <button className="btn" onClick={onSave}>{salvarLabel}</button>
        </div>
      </aside>
    </div>
  )
}
