# DEAR Inventory — Front-end

Protótipo front-end (React + Vite) do DEAR Inventory. Dados de exemplo, salvos no localStorage; ainda sem backend.

## Como rodar
```bash
npm install
npm run dev
```
Abra o endereço mostrado no terminal (normalmente http://localhost:5173).

## Acessos de demonstração (senha 1234)
`dono` · `gerente` · `financeiro`

## Estrutura
```
src/
  main.jsx            entrada + providers
  App.jsx             rotas e proteção por perfil
  styles.css          tema (claro/escuro)
  config/menu.js      menu e permissões por perfil
  data/seed.js        dados de exemplo
  utils/format.js     moeda, datas
  utils/stock.js      saldo, alertas, lucro, regras
  context/StoreContext.jsx   "banco" + ações (vira API depois)
  context/AuthContext.jsx    login/logout
  components/         Layout (topo + menu lateral), Modal (painel lateral), PageHeader, Abas, Paginacao, Icon, Tag
  pages/              Login, Painel, Produtos, Estoque, Financeiro, Relatorios, Usuarios
```

## Quando for ligar o backend
- Cada função em `StoreContext.jsx` vira uma chamada de API.
- Login real (token/sessão) substitui `AuthContext.jsx`; senhas com hash.
- Permissões, bloqueio de saída sem saldo e liberação do gerente devem ser validados no servidor (RF-17, RF-22, RNF-04, RNF-05).
