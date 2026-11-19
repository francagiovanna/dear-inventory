import { AppError } from '../errors/AppError.js';

// Valida body, query ou params com um schema Zod.
// - body: substitui req.body pelo objeto validado (campos desconhecidos são descartados)
// - query/params: o resultado fica em req.valid.query / req.valid.params
export const validate =
  (schema, origem = 'body') =>
  (req, res, next) => {
    const resultado = schema.safeParse(req[origem]);

    if (!resultado.success) {
      const detalhes = resultado.error.issues.map((i) => ({
        campo: i.path.join('.'),
        mensagem: i.message,
      }));
      return next(new AppError('Dados inválidos', 400, detalhes));
    }

    if (origem === 'body') {
      req.body = resultado.data;
    } else {
      req.valid = { ...(req.valid || {}), [origem]: resultado.data };
    }
    next();
  };
