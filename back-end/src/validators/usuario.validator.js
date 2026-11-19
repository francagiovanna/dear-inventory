import { z } from 'zod';
import { senhaForte } from './auth.validator.js';

const PERFIS = ['ADMIN', 'GERENTE', 'FINANCEIRO'];

const nome = z.string().trim().min(2, 'Nome muito curto').max(120, 'Nome muito longo');
const cargo = z.string().trim().min(2, 'Cargo muito curto').max(80, 'Cargo muito longo');
const login = z
  .string()
  .trim()
  .min(3, 'O login deve ter no mínimo 3 caracteres')
  .max(60, 'O login deve ter no máximo 60 caracteres')
  .regex(/^[a-zA-Z0-9._-]+$/, 'Use apenas letras, números, ponto, hífen e sublinhado');
const perfil = z.enum(PERFIS, { message: 'Perfil inválido. Use ADMIN, GERENTE ou FINANCEIRO' });

export const criarUsuarioSchema = z.object({
  nome,
  cargo,
  login,
  senha: senhaForte,
  perfil,
});

// A senha não é alterada aqui (existe rota própria para redefinir)
export const atualizarUsuarioSchema = z
  .object({
    nome,
    cargo,
    login,
    perfil,
    ativo: z.boolean({ message: 'O campo ativo deve ser true ou false' }),
  })
  .partial()
  .refine((obj) => Object.keys(obj).length > 0, {
    message: 'Informe ao menos um campo para atualizar',
  });

export const redefinirSenhaSchema = z.object({
  novaSenha: senhaForte,
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const listarUsuariosQuerySchema = z.object({
  busca: z.string().trim().max(80).optional(),
  perfil: z.enum(PERFIS).optional(),
  ativo: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
});
