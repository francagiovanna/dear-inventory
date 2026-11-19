// Repassa erros de funções async para o errorHandler (funciona no Express 4 e 5)
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
