// abas: [{ id, label, n }]  (n = contador opcional)
export default function Abas({ abas, atual, onChange }) {
  return (
    <div className="abas">
      {abas.map((a) => (
        <button key={a.id} className={'aba' + (atual === a.id ? ' on' : '')} onClick={() => onChange(a.id)}>
          {a.label}
          {a.n !== undefined && <span className="cnt">{a.n}</span>}
        </button>
      ))}
    </div>
  )
}
