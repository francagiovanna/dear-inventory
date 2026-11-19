import { prisma } from '../config/prisma.js';

// Campos devolvidos ao cliente. NUNCA inclui senhaHash.
const select = {
  id: true,
  nome: true,
  cargo: true,
  login: true,
  perfil: true,
  ativo: true,
  ultimoLogin: true,
  criadoEm: true,
  atualizadoEm: true,
};

export const usuarioRepository = {
  buscarPorId(id) {
    return prisma.usuario.findUnique({ where: { id }, select });
  },

  // Traz o registro completo (com senhaHash e controle de bloqueio). Uso interno.
  buscarPorIdComSenha(id) {
    return prisma.usuario.findUnique({ where: { id } });
  },

  buscarPorLogin(login) {
    return prisma.usuario.findUnique({ where: { login } });
  },

  // No MySQL o "contains" já ignora maiúsculas/minúsculas pela collation (não usar "mode")
  listar({ busca, perfil, ativo } = {}) {
    return prisma.usuario.findMany({
      where: {
        ...(perfil && { perfil }),
        ...(ativo !== undefined && { ativo }),
        ...(busca && {
          OR: [
            { nome: { contains: busca } },
            { login: { contains: busca } },
            { cargo: { contains: busca } },
          ],
        }),
      },
      select,
      orderBy: { nome: 'asc' },
    });
  },

  criar(data) {
    return prisma.usuario.create({ data, select });
  },

  atualizar(id, data) {
    return prisma.usuario.update({ where: { id }, data, select });
  },

  contarAdminsAtivos() {
    return prisma.usuario.count({ where: { perfil: 'ADMIN', ativo: true } });
  },

  registrarFalhaLogin(id, tentativasLogin, bloqueadoAte) {
    return prisma.usuario.update({
      where: { id },
      data: { tentativasLogin, bloqueadoAte },
    });
  },

  registrarLoginSucesso(id) {
    return prisma.usuario.update({
      where: { id },
      data: { tentativasLogin: 0, bloqueadoAte: null, ultimoLogin: new Date() },
    });
  },
};
