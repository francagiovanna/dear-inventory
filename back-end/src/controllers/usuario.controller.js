import { usuarioService } from '../services/usuario.service.js';

export const usuarioController = {
  async listar(req, res) {
    res.json(await usuarioService.listar(req.valid?.query ?? {}));
  },

  async buscar(req, res) {
    res.json(await usuarioService.buscar(req.valid.params.id));
  },

  async criar(req, res) {
    const usuario = await usuarioService.criar(req.body, req.user, req.ip);
    res.status(201).json(usuario);
  },

  async atualizar(req, res) {
    const usuario = await usuarioService.atualizar(req.valid.params.id, req.body, req.user, req.ip);
    res.json(usuario);
  },

  async redefinirSenha(req, res) {
    await usuarioService.redefinirSenha(req.valid.params.id, req.body, req.user, req.ip);
    res.status(204).send();
  },
};
