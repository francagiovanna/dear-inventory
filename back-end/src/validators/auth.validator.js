import { z } from 'zod';

// bcrypt só considera os primeiros 72 bytes, por isso o limite máximo
export const senhaForte = z
  .string()
  .min(8, 'A senha deve ter no mínimo 8 caracteres')
  .max(72, 'A senha deve ter no máximo 72 caracteres')
  .regex(/[A-Za-z]/, 'A senha deve conter ao menos uma letra')
  .regex(/\d/, 'A senha deve conter ao menos um número');

export const loginSchema = z.object({
  login: z.string().trim().min(1, 'Informe o login'),
  senha: z.string().min(1, 'Informe a senha'),
});

export const trocarSenhaSchema = z.object({
  senhaAtual: z.string().min(1, 'Informe a senha atual'),
  novaSenha: senhaForte,
});
