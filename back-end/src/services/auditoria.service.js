import { auditoriaRepository } from '../repositories/auditoria.repository.js';

export const auditoriaService = {
  // Exemplo: registrar({ usuarioId, acao: 'CRIAR_USUARIO', entidade: 'usuario', entidadeId: 5, detalhes: {...}, ip })
  // Passe "tx" quando estiver dentro de prisma.$transaction para gravar na mesma transação.
  registrar({ usuarioId = null, acao, entidade, entidadeId = null, detalhes = null, ip = null }, tx) {
    return auditoriaRepository.criar(
      { usuarioId, acao, entidade, entidadeId, detalhes, ip },
      tx
    );
  },
};
