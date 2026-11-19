import { env } from '../config/env.js';
import { AppError } from '../errors/AppError.js';
import { usuarioRepository } from '../repositories/usuario.repository.js';
import { auditoriaService } from './auditoria.service.js';
import { compararSenha, gerarHash, HASH_FALSO } from '../utils/hash.js';
import { gerarToken } from '../utils/jwt.js';

// Mesma mensagem para "usuário não existe" e "senha errada"
const MSG_CREDENCIAIS = 'Login ou senha inválidos';

export const authService = {
  async login({ login, senha }, ip) {
    const usuario = await usuarioRepository.buscarPorLogin(login.trim().toLowerCase());

    if (!usuario || !usuario.ativo) {
      await compararSenha(senha, HASH_FALSO); // iguala o tempo de resposta
      throw new AppError(MSG_CREDENCIAIS, 401);
    }

    const agora = new Date();
    if (usuario.bloqueadoAte && usuario.bloqueadoAte > agora) {
      const minutos = Math.ceil((usuario.bloqueadoAte - agora) / 60000);
      throw new AppError(
        `Acesso bloqueado temporariamente por excesso de tentativas. Tente novamente em ${minutos} minuto(s).`,
        423
      );
    }

    const senhaCorreta = await compararSenha(senha, usuario.senhaHash);

    if (!senhaCorreta) {
      const tentativas = usuario.tentativasLogin + 1;
      const bloquear = tentativas >= env.maxTentativasLogin;

      await usuarioRepository.registrarFalhaLogin(
        usuario.id,
        bloquear ? 0 : tentativas,
        bloquear ? new Date(Date.now() + env.bloqueioMinutos * 60000) : null
      );
      await auditoriaService.registrar({
        usuarioId: usuario.id,
        acao: bloquear ? 'LOGIN_BLOQUEADO' : 'LOGIN_FALHA',
        entidade: 'usuario',
        entidadeId: usuario.id,
        ip,
      });

      throw new AppError(MSG_CREDENCIAIS, 401);
    }

    await usuarioRepository.registrarLoginSucesso(usuario.id);
    await auditoriaService.registrar({
      usuarioId: usuario.id,
      acao: 'LOGIN',
      entidade: 'usuario',
      entidadeId: usuario.id,
      ip,
    });

    const token = gerarToken({ sub: String(usuario.id), perfil: usuario.perfil });

    return {
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        cargo: usuario.cargo,
        login: usuario.login,
        perfil: usuario.perfil,
      },
    };
  },

  async me(usuarioId) {
    const usuario = await usuarioRepository.buscarPorId(usuarioId);
    if (!usuario) throw new AppError('Usuário não encontrado', 404);
    return usuario;
  },

  async trocarSenha(usuarioId, { senhaAtual, novaSenha }, ip) {
    const usuario = await usuarioRepository.buscarPorIdComSenha(usuarioId);
    if (!usuario) throw new AppError('Usuário não encontrado', 404);

    // 400 (e não 401) para o front não confundir com sessão expirada e deslogar
    if (!(await compararSenha(senhaAtual, usuario.senhaHash))) {
      throw new AppError('Senha atual incorreta', 400);
    }
    if (senhaAtual === novaSenha) {
      throw new AppError('A nova senha deve ser diferente da atual', 400);
    }

    await usuarioRepository.atualizar(usuarioId, { senhaHash: await gerarHash(novaSenha) });
    await auditoriaService.registrar({
      usuarioId,
      acao: 'TROCAR_SENHA',
      entidade: 'usuario',
      entidadeId: usuarioId,
      ip,
    });
  },
};
