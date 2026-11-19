import { authService } from '../services/auth.service.js';

export const authController = {
  async login(req, res) {
    const resultado = await authService.login(req.body, req.ip);
    res.json(resultado);
  },

  async me(req, res) {
    res.json(await authService.me(req.user.id));
  },

  async trocarSenha(req, res) {
    await authService.trocarSenha(req.user.id, req.body, req.ip);
    res.status(204).send();
  },
};
