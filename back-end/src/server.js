import app from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/prisma.js';

const server = app.listen(env.port, () => {
  console.log(`API DEAR Inventory rodando em http://localhost:${env.port}/api`);
});

// Encerramento limpo: fecha o servidor e a conexão com o banco
async function encerrar(sinal) {
  console.log(`${sinal} recebido, encerrando...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => encerrar('SIGINT'));
process.on('SIGTERM', () => encerrar('SIGTERM'));