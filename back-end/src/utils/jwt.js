import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const gerarToken = (payload) =>
  jwt.sign(payload, env.jwtSecret, {
    algorithm: 'HS256',
    expiresIn: env.jwtExpiresIn,
  });

export const verificarToken = (token) =>
  jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] });
