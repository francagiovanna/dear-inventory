export const TODOS = ['admin', 'gerente', 'financeiro']

// Quem enxerga o quê (matriz de permissões da seção 4 do documento de requisitos).
// "grupo" é o título da seção no menu lateral.
export const MENU = [
  { to: '/', label: 'Painel', icone: 'home', grupo: 'Principal', perfis: TODOS },
  // Cada perfil só recebe os alertas que lhe dizem respeito (regra em gerarAlertas, utils/stock.js).
  { to: '/alertas', label: 'Alertas', icone: 'bell', grupo: 'Principal', perfis: TODOS },
  { to: '/produtos', label: 'Produtos', icone: 'box', grupo: 'Cadastros', perfis: ['admin', 'gerente'] },
  { to: '/estoque', label: 'Estoque', icone: 'layers', grupo: 'Operação', perfis: TODOS },
  { to: '/financeiro', label: 'Financeiro', icone: 'dollar', grupo: 'Gestão', perfis: ['admin', 'financeiro'] },
  { to: '/relatorios', label: 'Relatórios', icone: 'chart', grupo: 'Gestão', perfis: TODOS },
  { to: '/usuarios', label: 'Usuários', icone: 'users', grupo: 'Administração', perfis: ['admin'] },
]

export const PERFIS = {
  admin: 'Dono (administrador)',
  gerente: 'Gerente',
  financeiro: 'Financeiro',
}

// Quem recebe e aprova pedidos de acesso (RF-02: só o dono cria usuários).
// Para incluir o gerente, ele também precisa estar em "perfis" da rota /usuarios acima.
export const APROVAM_ACESSO = ['admin']