// Título da página + caminho + botões de ação no canto direito
export default function PageHeader({ titulo, trilha = 'DEAR Inventory', children }) {
  return (
    <div className="ph">
      <div>
        <div className="crumb">{trilha} / {titulo}</div>
        <h1>{titulo}</h1>
      </div>
      <div className="ph-act">{children}</div>
    </div>
  )
}
