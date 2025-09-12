// script.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.users.create({
    data: {
      username: "admin",
      email: "admin@gmail.com",
      password: await bcrypt.hash("123123", 10),
      role: "admin",
    },
  });

  const user = await prisma.users.create({
    data: {
      username: "budi",
      email: "budi@gmail.com",
      password: await bcrypt.hash("123123", 10),
      role: "user",
    },
  });

  console.log("✅ User berhasil dibuat:", { admin, user });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
