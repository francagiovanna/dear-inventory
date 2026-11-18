import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Abas from '../components/Abas'
import Paginacao, { usePaginacao } from '../components/Paginacao'
import Icon from '../components/Icon'
import { useStore } from '../context/StoreContext'
import Modal from '../components/Modal'
import Tag from '../components/Tag'
import { brl, fd } from '../utils/format'

function ProdutoModal({ produto, onClose }) {
  const { db, salvarProduto } = useStore()
  const [f, setF] = useState(
    produto || { codigo: '', nome: '', cat: db.cats[0], un: 'un', custo: '', preco: '', min: 10, val: '' }
  )
  const [erro, setErro] = useState('')
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  function salvar() {
    const e = salvarProduto(f, produto?.id)
    if (e) setErro(e)
    else onClose()
  }

  return (
    <Modal titulo={produto ? 'Editar produto' : 'Novo produto'} onClose={onClose} onSave={salvar} erro={erro}>
      <div className="row">
        <div><label>Código</label><input value={f.codigo} onChange={set('codigo')} /></div>
        <div><label>Unidade</label><input value={f.un} onChange={set('un')} /></div>
      </div>
      <label>Nome</label><input value={f.nome} onChange={set('nome')} />
      <label>Categoria</label>
      <select value={f.cat} onChange={set('cat')}>{db.cats.map((c) => <option key={c}>{c}</option>)}</select>
      <div className="row">
        <div><label>Preço de custo</label><input type="number" step="0.01" value={f.custo} onChange={set('custo')} /></div>
        <div><label>Preço de venda</label><input type="number" step="0.01" value={f.preco} onChange={set('preco')} /></div>
      </div>
      <div className="row">
        <div><label>Estoque mínimo</label><input type="number" value={f.min} onChange={set('min')} /></div>
        <div><label>Validade (opcional)</label><input type="date" value={f.val || ''} onChange={set('val')} /></div>
      </div>
    </Modal>
  )
}

function CategoriaModal({ onClose }) {
  const { db, addCategoria } = useStore()
  const [nome, setNome] = useState('')
  const [erro, setErro] = useState('')

  function salvar() {
    const e = addCategoria(nome)
    if (e) setErro(e)
    else setNome('')
  }

  return (
    <Modal titulo="Categorias" onClose={onClose} onSave={salvar} salvarLabel="Adicionar" erro={erro}>
      <p>{db.cats.map((c) => <span key={c} className="tag" style={{ marginRight: 4 }}>{c}</span>)}</p>
      <label>Nova categoria</label>
      <input value={nome} onChange={(e) => setNome(e.target.value)} />
    </Modal>
  )
}

export default function Produtos() {
  const { db, alternarProduto } = useStore()
  const [sp] = useSearchParams()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('')
  const [aba, setAba] = useState('todos')
  const [modal, setModal] = useState(sp.get('novo') ? { tipo: 'produto' } : null)

  const base = db.produtos.filter((p) => (p.nome + p.codigo).toLowerCase().includes(q.toLowerCase()) && (!cat || p.cat === cat))
  const grupos = { todos: base, ativos: base.filter((p) => p.ativo), inativos: base.filter((p) => !p.ativo) }
  const pg = usePaginacao(grupos[aba])
  const abas = [
    { id: 'todos', label: 'Todos', n: grupos.todos.length },
    { id: 'ativos', label: 'Ativos', n: grupos.ativos.length },
    { id: 'inativos', label: 'Inativos', n: grupos.inativos.length },
  ]

  return (
    <>
      <PageHeader titulo="Produtos" trilha="Cadastros">
        <button className="btn sec" onClick={() => setModal({ tipo: 'cat' })}>Categorias</button>
        <button className="btn" onClick={() => setModal({ tipo: 'produto' })}><Icon nome="plus" size={16} /> Incluir produto</button>
      </PageHeader>

      <div className="filtros card">
        <div><label>Buscar</label><input placeholder="Nome ou código" value={q} onChange={(e) => { setQ(e.target.value); pg.ir(1) }} /></div>
        <div>
          <label>Categoria</label>
          <select value={cat} onChange={(e) => { setCat(e.target.value); pg.ir(1) }}>
            <option value="">Todas</option>
            {db.cats.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <button className="btn sec" onClick={() => { setQ(''); setCat('') }}>Limpar</button>
      </div>

      <div className="panel">
        <Abas abas={abas} atual={aba} onChange={(a) => { setAba(a); pg.ir(1) }} />
        <div className="tw">
          <table>
            <thead>
              <tr><th>Código</th><th>Produto</th><th>Categoria</th><th>Custo</th><th>Venda</th><th>Mín.</th><th>Validade</th><th>Situação</th><th></th></tr>
            </thead>
            <tbody>
              {pg.itens.map((p) => (
                <tr key={p.id} style={{ opacity: p.ativo ? 1 : 0.55 }}>
                  <td>{p.codigo}</td><td><b>{p.nome}</b></td><td>{p.cat}</td>
                  <td>{brl(p.custo)}</td><td>{brl(p.preco)}</td><td>{p.min}</td><td>{fd(p.val)}</td>
                  <td><Tag tipo={p.ativo ? 'ok' : 'bad'}>{p.ativo ? 'Ativo' : 'Inativo'}</Tag></td>
                  <td className="acoes">
                    <button className="icon-btn dk" title="Editar" onClick={() => setModal({ tipo: 'produto', produto: p })}><Icon nome="edit" size={16} /></button>
                    <button className="icon-btn dk" title={p.ativo ? 'Desativar' : 'Ativar'} onClick={() => alternarProduto(p.id)}><Icon nome="power" size={16} /></button>
                  </td>
                </tr>
              ))}
              {pg.total === 0 && <tr><td colSpan={9} className="mut">Nenhum produto encontrado.</td></tr>}
            </tbody>
          </table>
        </div>
        <Paginacao pg={pg} />
      </div>
      <p className="mut">Produtos com histórico não são excluídos, apenas desativados.</p>

      {modal?.tipo === 'produto' && <ProdutoModal produto={modal.produto} onClose={() => setModal(null)} />}
      {modal?.tipo === 'cat' && <CategoriaModal onClose={() => setModal(null)} />}
    </>
  )
}
