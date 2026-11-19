import { AppError } from '../errors/AppError.js';
import { usuarioRepository } from '../repositories/usuario.repository.js';
import { auditoriaService } from './auditoria.service.js';
import { gerarHash } from '../utils/hash.js';

async function buscarOu404(id) {
  const usuario = await usuarioRepository.buscarPorId(id);
  if (!usuario) throw new AppError('Usuário não encontrado', 404);
  return usuario;
}

export const usuarioService = {
  listar(filtros) {
    return usuarioRepository.listar(filtros);
  },

  buscar(id) {
    return buscarOu404(id);
  },

  // RF-02, RF-03, RN-02, RN-05: só o admin cria, sem login duplicado
  async criar(dados, ator, ip) {
    const login = dados.login.toLowerCase();

    if (await usuarioRepository.buscarPorLogin(login)) {
      throw new AppError('Já existe um usuário com esse login', 409);
    }

    const novo = await usuarioRepository.criar({
      nome: dados.nome,
      cargo: dados.cargo,
      login,
      senhaHash: await gerarHash(dados.senha),
      perfil: dados.perfil,
    });

    await auditoriaService.registrar({
      usuarioId: ator.id,
      acao: 'CRIAR_USUARIO',
      entidade: 'usuario',
      entidadeId: novo.id,
      detalhes: { login: novo.login, perfil: novo.perfil },
      ip,
    });

    return novo;
  },

  // RF-04: editar e desativar (nunca excluir)
  async atualizar(id, dados, ator, ip) {
    const atual = await buscarOu404(id);

    if (dados.login) {
      dados.login = dados.login.toLowerCase();
      if (dados.login !== atual.login) {
        if (await usuarioRepository.buscarPorLogin(dados.login)) {
          throw new AppError('Já existe um usuário com esse login', 409);
        }
      }
    }

    // Protege contra ficar sem nenhum administrador ativo
    const deixaDeSerAdminAtivo =
      atual.perfil === 'ADMIN' &&
      atual.ativo &&
      ((dados.perfil && dados.perfil !== 'ADMIN') || dados.ativo === false);

    if (deixaDeSerAdminAtivo) {
      if (id === ator.id) {
        throw new AppError('Você não pode remover o seu próprio acesso de administrador', 400);
      }
      if ((await usuarioRepository.contarAdminsAtivos()) <= 1) {
        throw new AppError('Deve existir ao menos um administrador ativo', 400);
      }
    }

    const atualizado = await usuarioRepository.atualizar(id, dados);

    await auditoriaService.registrar({
      usuarioId: ator.id,
      acao: dados.ativo === false ? 'DESATIVAR_USUARIO' : 'EDITAR_USUARIO',
      entidade: 'usuario',
      entidadeId: id,
      detalhes: {
        antes: { nome: atual.nome, cargo: atual.cargo, login: atual.login, perfil: atual.perfil, ativo: atual.ativo },
        depois: dados,
      },
      ip,
    });

    return atualizado;
  },

  // RF-04: o admin redefine a senha de qualquer usuário (e desbloqueia a conta)
  async redefinirSenha(id, { novaSenha }, ator, ip) {
    await buscarOu404(id);

    await usuarioRepository.atualizar(id, {
      senhaHash: await gerarHash(novaSenha),
      tentativasLogin: 0,
      bloqueadoAte: null,
    });

    await auditoriaService.registrar({
      usuarioId: ator.id,
      acao: 'REDEFINIR_SENHA',
      entidade: 'usuario',
      entidadeId: id,
      ip,
    });
  },
};
