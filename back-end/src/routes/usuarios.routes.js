import { Router } from 'express';
import { usuarioController } from '../controllers/usuario.controller.js';
import { auth } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  atualizarUsuarioSchema,
  criarUsuarioSchema,
  idParamSchema,
  listarUsuariosQuerySchema,
  redefinirSenhaSchema,
} from '../validators/usuario.validator.js';

const router = Router();

// Todas as rotas de usuários são exclusivas do administrador
router.use(auth, authorize('ADMIN'));

router.get('/', validate(listarUsuariosQuerySchema, 'query'), asyncHandler(usuarioController.listar));
router.post('/', validate(criarUsuarioSchema), asyncHandler(usuarioController.criar));
router.get('/:id', validate(idParamSchema, 'params'), asyncHandler(usuarioController.buscar));
router.patch(
  '/:id',
  validate(idParamSchema, 'params'),
  validate(atualizarUsuarioSchema),
  asyncHandler(usuarioController.atualizar)
);
router.patch(
  '/:id/senha',
  validate(idParamSchema, 'params'),
  validate(redefinirSenhaSchema),
  asyncHandler(usuarioController.redefinirSenha)
);

export default router;
