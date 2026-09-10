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
  const isOfficer = role === UserRole.OFFICER;

  await prisma.user.upsert({
    where: { employeeId_company: { employeeId, company } },
    update: { passwordHash, role, name: employeeId, accountStatus: "Active" },
    create: {
      name: employeeId,
      email: `${employeeId}@salaryflow.test`,
      phone: "+880 1700 000000",
      employeeId,
      company,
      passwordHash,
      role,
      accountStatus: "Active",
      department: isOfficer ? "Human Resources" : "Operations",
      designation: isOfficer ? "HR Officer" : "Operations Manager",
      employmentType: "Full Time",
      workDaysPerWeek: 5,
      joinDate: new Date("2026-01-01T00:00:00.000Z"),
      employmentStatus: "Active",
      basicSalary: "30000",
      salaryType: "Monthly",
      allowances: "0",
      attendanceBonusThreshold: "90",
      attendanceBonusRate: "5",
      workLocation: "Office",
      country: "Bangladesh",
    },
  });
}

async function main() {
  await seedUser("nexstack1", "nexstack1", "nexstack1", UserRole.OFFICER);
  await seedUser("nexstack2", "nexstack2", "nexstack2", UserRole.OM);
  const employeeAccounts = Array.from(
    { length: 6 },
    (_, index) => `nexstack${index + 7}`,
  );

  // Employees must share the officer's company to appear in that officer's
  // employee list. Move accounts created by an older seed safely if present.
  await prisma.user.updateMany({
    where: {
      employeeId: { in: employeeAccounts },
      company: { in: employeeAccounts },
    },
    data: { company: "nexstack1" },
  });
  await Promise.all(
    employeeAccounts.map((account) =>
      seedUser(account, "nexstack1", account, UserRole.OM),
    ),
  );
  console.log("Seeded nexstack7–12 as employees of company nexstack1");
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
