import { hoje } from '../utils/format'

// Dados de exemplo. Quando o backend existir, isto some e entra a API.
export function seed() {
  const cats = ['Laticínios', 'Grãos', 'Mercearia', 'Bebidas']

  // [código, nome, categoria, unidade, custo, venda, mínimo, validade (dias a partir de hoje), saldo final]
  const base = [
    ['LEI001', 'Leite integral 1L', 'Laticínios', 'un', 4.2, 5.9, 20, 60, 8],
    ['IOG001', 'Iogurte natural', 'Laticínios', 'un', 2.1, 3.9, 10, 3, 30],
    ['ARR001', 'Arroz 5kg', 'Grãos', 'pct', 22, 29.9, 15, 300, 60],
    ['FEI001', 'Feijão 1kg', 'Grãos', 'pct', 6.5, 9.5, 15, 280, 50],
    ['OLE001', 'Óleo de soja 900ml', 'Mercearia', 'un', 5.8, 8.2, 12, 200, 40],
    ['CAF001', 'Café 500g', 'Bebidas', 'pct', 12, 18.5, 10, 150, 35],
    ['ACU001', 'Açúcar 1kg', 'Mercearia', 'pct', 3.4, 5.2, 15, 18, 9],
  ]
  const saidas = [[-6, 6], [-4, 9], [-2, 14], [-1, 5]]
  const totalSaidas = saidas.reduce((a, s) => a + s[1], 0)

  const produtos = []
  const movs = []
  let mid = 1
  base.forEach(([codigo, nome, cat, un, custo, preco, min, validade, alvo], i) => {
    const id = i + 1
    const extra = i % 2 === 0 ? 10 : 0
    produtos.push({ id, codigo, nome, cat, un, custo, preco, min, val: hoje(validade), ativo: true })
    movs.push({ id: mid++, tipo: 'E', pid: id, qtd: alvo + totalSaidas - extra, valor: custo, data: hoje(-20), user: 'Ana Gerente', aut: '' })
    saidas.forEach(([off, q]) =>
      movs.push({ id: mid++, tipo: 'S', pid: id, qtd: q, valor: preco, data: hoje(off), user: 'Ana Gerente', aut: '' })
    )
    if (extra) movs.push({ id: mid++, tipo: 'E', pid: id, qtd: extra, valor: custo, data: hoje(-3), user: 'Ana Gerente', aut: '' })
  })

  return {
    cats,
    produtos,
    movs,
    users: [
      // Senhas em texto puro SÓ porque é protótipo. No backend: hash (RNF-04).
      { id: 1, nome: 'Carlos Souza', cargo: 'Proprietário', login: 'dono', senha: '1234', perfil: 'admin', ativo: true },
      { id: 2, nome: 'Ana Gerente', cargo: 'Gerente de loja', login: 'gerente', senha: '1234', perfil: 'gerente', ativo: true },
      { id: 3, nome: 'Bruno Lima', cargo: 'Analista financeiro', login: 'financeiro', senha: '1234', perfil: 'financeiro', ativo: true },
    ],
    desp: [
      { id: 1, desc: 'Conta de luz', valor: 480, venc: hoje(1), pago: false, cat: 'Contas' },
      { id: 2, desc: 'Aluguel', valor: 2800, venc: hoje(9), pago: false, cat: 'Aluguel' },
      { id: 3, desc: 'Frete fornecedor', valor: 350, venc: hoje(-5), pago: true, cat: 'Fornecedores' },
    ],
  }
}
