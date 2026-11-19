// prisma/seed.js - dados iniciais (admin, categorias e configurações)
// Rodar com: npx prisma db seed
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const senhaInicial = process.env.SEED_ADMIN_SENHA || 'Admin@123';
  const senhaHash = await bcrypt.hash(senhaInicial, 12);

  await prisma.usuario.upsert({
    where: { login: 'admin' },
    update: {},
    create: {
      nome: 'Administrador',
      cargo: 'Administrador / dono',
      login: 'admin',
      senhaHash,
      perfil: 'ADMIN',
    },
  });

  for (const nome of ['Alimentos', 'Bebidas', 'Limpeza', 'Higiene', 'Outros']) {
    await prisma.categoria.upsert({
      where: { nome },
      update: {},
      create: { nome },
    });
  }

  await prisma.configuracao.upsert({
    where: { chave: 'DIAS_ALERTA_VENCIMENTO' },
    update: {},
    create: { chave: 'DIAS_ALERTA_VENCIMENTO', valor: '30' },
  });

  console.log('Seed concluído. Login: admin | Troque a senha no primeiro acesso.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

