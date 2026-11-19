import { AppError } from '../errors/AppError.js';
import { verificarToken } from '../utils/jwt.js';
import { usuarioRepository } from '../repositories/usuario.repository.js';

// Exige token JWT válido e usuário ainda ativo no banco
export async function auth(req, res, next) {
  try {
    const [tipo, token] = (req.headers.authorization || '').split(' ');
    if (tipo !== 'Bearer' || !token) {
      throw new AppError('Token não informado', 401);
    }

    let payload;
    try {
      payload = verificarToken(token);
    } catch {
      throw new AppError('Token inválido ou expirado', 401);
    }

    const usuario = await usuarioRepository.buscarPorId(Number(payload.sub));
    if (!usuario || !usuario.ativo) {
      throw new AppError('Usuário inexistente ou inativo', 401);
    }

    // O perfil vem do banco (não do token), então mudanças de perfil valem na hora
    req.user = { id: usuario.id, nome: usuario.nome, perfil: usuario.perfil };
    next();
  } catch (erro) {
    next(erro);
  }
}
