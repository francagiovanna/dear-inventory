import 'dotenv/config';

const obrigatorias = ['DATABASE_URL', 'JWT_SECRET'];
for (const nome of obrigatorias) {
  if (!process.env[nome]) {
    throw new Error(`Variável de ambiente ausente no .env: ${nome}`);
  }
}

const nodeEnv = process.env.NODE_ENV || 'development';

if (nodeEnv === 'production' && process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET deve ter ao menos 32 caracteres em produção');
}

export const env = {
  nodeEnv,
  port: Number(process.env.PORT) || 3333,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS) || 12,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  // Bloqueio de login (RNF-04)
  maxTentativasLogin: 5,
  bloqueioMinutos: 15,
};
