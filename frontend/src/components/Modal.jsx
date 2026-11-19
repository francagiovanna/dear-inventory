import { useEffect } from 'react'
import Icon from './Icon'

// Modal centralizado para formulários. Mantém as mesmas props de antes.
export default function Modal({ titulo, onClose, onSave, salvarLabel = 'Salvar', erro, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const antes = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = antes
    }
  }, [onClose])

  return (
    <div className="scrim dark center" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={titulo}>
        <div className="modal-h">
          <h2>{titulo}</h2>
          <button className="icon-btn dk" onClick={onClose} title="Fechar"><Icon nome="x" /></button>
        </div>
        <div className="modal-b">
          {children}
          {erro && <div className="err">{erro}</div>}
        </div>
        <div className="modal-f">
          <button className="btn sec" onClick={onClose}>Cancelar</button>
          <button className="btn" onClick={onSave}>{salvarLabel}</button>
        </div>
      </div>
    </div>
  )
}