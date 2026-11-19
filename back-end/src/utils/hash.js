// Se o pacote "bcrypt" não compilar no Windows, instale "bcryptjs" e troque a linha abaixo por:
// import bcrypt from 'bcryptjs';
import bcrypt from 'bcrypt';
import { env } from '../config/env.js';

export const gerarHash = (senha) => bcrypt.hash(senha, env.bcryptRounds);

export const compararSenha = (senha, hash) => bcrypt.compare(senha, hash);

// Hash falso usado quando o login não existe, para que o tempo de resposta
// seja parecido com o de um login existente (evita descobrir usuários pelo tempo).
export const HASH_FALSO = bcrypt.hashSync('senha-falsa-para-timing', env.bcryptRounds);
