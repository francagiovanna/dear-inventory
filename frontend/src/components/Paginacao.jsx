import { useState } from 'react'

export function usePaginacao(lista, porPagina = 10) {
  const [pagina, setPagina] = useState(1)
  const paginas = Math.max(1, Math.ceil(lista.length / porPagina))
  const atual = Math.min(pagina, paginas)
  const itens = lista.slice((atual - 1) * porPagina, atual * porPagina)
  return { itens, atual, paginas, total: lista.length, porPagina, ir: setPagina }
}

export default function Paginacao({ pg }) {
  const de = pg.total ? (pg.atual - 1) * pg.porPagina + 1 : 0
  const ate = Math.min(pg.total, pg.atual * pg.porPagina)
  return (
    <div className="pag">
      <span>Exibindo {de}–{ate} de {pg.total}</span>
      <div>
        <button className="btn sec sm" disabled={pg.atual <= 1} onClick={() => pg.ir(pg.atual - 1)}>Anterior</button>
        <span style={{ margin: '0 10px' }}>{pg.atual} / {pg.paginas}</span>
        <button className="btn sec sm" disabled={pg.atual >= pg.paginas} onClick={() => pg.ir(pg.atual + 1)}>Próxima</button>
      </div>
    </div>
  )
}
