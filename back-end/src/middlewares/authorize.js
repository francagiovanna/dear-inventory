import { AppError } from '../errors/AppError.js';

// Uso: authorize('ADMIN', 'GERENTE'). Deve vir depois do middleware auth.
export const authorize =
  (...perfisPermitidos) =>
  (req, res, next) => {
    if (!req.user) return next(new AppError('Não autenticado', 401));
    if (!perfisPermitidos.includes(req.user.perfil)) {
      return next(new AppError('Você não tem permissão para esta ação', 403));
    }
    next();
  };
