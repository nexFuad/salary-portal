import "dotenv/config";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { prisma } from "../src/lib/prisma.js";

async function seedUser(
  employeeId: string,
  company: string,
  password: string,
  role: UserRole,
) {
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { employeeId_company: { employeeId, company } },
    update: { passwordHash, role },
    create: { employeeId, company, passwordHash, role },
  });
}

async function main() {
  await seedUser("nexstack1", "nexstack1", "nexstack1", UserRole.OFFICER);
  await seedUser("nexstack2", "nexstack2", "nexstack2", UserRole.OM);
  console.log("Seeded officer and OM users");
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
