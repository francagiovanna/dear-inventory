import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authController } from '../controllers/auth.controller.js';
import { auth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { loginSchema, trocarSenhaSchema } from '../validators/auth.validator.js';

const router = Router();

// Limite por IP, além do bloqueio por usuário feito no auth.service
const limiteLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: 'Muitas tentativas de login. Tente novamente em alguns minutos.' },
});

router.post('/login', limiteLogin, validate(loginSchema), asyncHandler(authController.login));
router.get('/me', auth, asyncHandler(authController.me));
router.patch('/senha', auth, validate(trocarSenhaSchema), asyncHandler(authController.trocarSenha));

export default router;
