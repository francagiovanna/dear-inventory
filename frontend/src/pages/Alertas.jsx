import { useSearchParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import AvisoItem from '../components/AvisoItem'
import { useStore } from '../context/StoreContext'
import { useAuth } from '../context/AuthContext'
import { gerarAlertas } from '../utils/stock'

const CATEGORIAS = [
  { id: 'todos', label: 'Todos' },
  { id: 'acesso', label: 'Acessos' },
  { id: 'estoque', label: 'Estoque e validade' },
  { id: 'contas', label: 'Contas' },
]

// Agrupa os tipos de aviso nas abas da página.
const categoria = (a) =>
  a.tipo === 'acesso' ? 'acesso'
  : a.tipo === 'conta' ? 'contas'
  : 'estoque' // vencido, vencendo e estoque

export default function Alertas() {
  const { db } = useStore()
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()

  const alertas = gerarAlertas(db, user.perfil)
  const conta = (id) => (id === 'todos' ? alertas.length : alertas.filter((a) => categoria(a) === id).length)

  // mostra só as abas que têm itens (o gerente, por exemplo, não vê Acessos nem Contas)
  const abas = CATEGORIAS.filter((c) => c.id === 'todos' || conta(c.id) > 0)
  const pedida = params.get('aba') || 'todos'
  const aba = abas.some((c) => c.id === pedida) ? pedida : 'todos'
  const lista = aba === 'todos' ? alertas : alertas.filter((a) => categoria(a) === aba)

  return (
    <>
      <PageHeader titulo="Alertas" trilha="Principal" />

      <div className="panel av-panel">
        <div className="abas">
          {abas.map((c) => (
            <button
              key={c.id}
              className={'aba' + (aba === c.id ? ' on' : '')}
              onClick={() => setParams(c.id === 'todos' ? {} : { aba: c.id })}
            >
              {c.label} <span className="cnt">{conta(c.id)}</span>
            </button>
          ))}
        </div>

        <div className="av-list av-page">
          {lista.length === 0 && <p className="mut">Nenhum alerta no momento.</p>}
          {lista.map((a, i) => <AvisoItem key={i} a={a} />)}
        </div>
      </div>
    </>
  )
}