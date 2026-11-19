import { AppError } from '../errors/AppError.js';

export function notFound(req, res, next) {
  next(new AppError(`Rota não encontrada: ${req.method} ${req.originalUrl}`, 404));
}

// Formato padrão de erro: { erro: "mensagem", detalhes?: [...] }
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      erro: err.message,
      ...(err.details && { detalhes: err.details }),
    });
  }

  // JSON malformado no body
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'JSON inválido no corpo da requisição' });
  }

  // Erros conhecidos do Prisma
  if (err?.code === 'P2002') {
    return res.status(409).json({ erro: 'Já existe um registro com esses dados', campos: err.meta?.target });
  }
  if (err?.code === 'P2025') {
    return res.status(404).json({ erro: 'Registro não encontrado' });
  }
  if (err?.code === 'P2003') {
    return res.status(409).json({ erro: 'Operação inválida: o registro possui vínculos com outros dados' });
  }

  console.error(err);
  return res.status(500).json({ erro: 'Erro interno do servidor' });
}
