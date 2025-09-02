import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.users.findMany();
  for (const u of users) {
    const pwd = u.password;
    if (typeof pwd === 'string' && pwd.startsWith('$2')) continue;

    const hashed = await bcrypt.hash(pwd, 12);
    await prisma.users.update({
      where: { id: u.id },
      data: { password: hashed },
    });
    console.log(`updated #${u.id} (${u.email})`);
  }
  console.log('Done');
}

main().finally(() => prisma.$disconnect());
