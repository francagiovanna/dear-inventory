import { prisma } from '../config/prisma.js';

export const auditoriaRepository = {
  // "db" pode ser uma transação (tx) para gravar a auditoria junto com a operação
  criar(data, db = prisma) {
    return db.auditoria.create({ data });
  },
};
