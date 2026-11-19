import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import authRoutes from './auth.routes.js';
import usuariosRoutes from './usuarios.routes.js';

const router = Router();

// Verifica se a API e o banco estão respondendo
router.get(
  '/health',
  asyncHandler(async (req, res) => {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok' });
  })
);

router.use('/auth', authRoutes);
router.use('/usuarios', usuariosRoutes);

// Próximas etapas: /categorias, /produtos, /estoque, /financeiro, /relatorios, /alertas

export default router;
