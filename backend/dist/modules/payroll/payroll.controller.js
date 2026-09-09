import { prisma } from "../../lib/prisma.js";
function monthRange(payRunMonth) {
    const match = /^(\d{4})-(\d{2})$/.exec(payRunMonth);
    if (!match)
        return null;
    const year = Number(match[1]);
    const month = Number(match[2]) - 1;
    const payRun = new Date(Date.UTC(year, month, 1));
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
    return { payRun, start, end };
}
export async function list(c) {
    const records = await prisma.payrollRecord.findMany({
        where: { user: { company: c.get("authUser").company } },
        include: { user: { select: { name: true, email: true, employeeId: true, profilePic: true, department: true, designation: true } } },
        orderBy: [{ payRunMonth: "desc" }, { createdAt: "desc" }],
    });
    return c.json({ records });
}
export async function generate(c) {
    const body = (await c.req.json().catch(() => null));
    const range = typeof body?.payRunMonth === "string" ? monthRange(body.payRunMonth) : null;
    if (!range)
        return c.json({ message: "A valid pay-run month is required." }, 400);
    const users = await prisma.user.findMany({
        where: { company: c.get("authUser").company, accountStatus: "Active" },
        select: { id: true, basicSalary: true, workDaysPerWeek: true, attendanceBonusThreshold: true },
    });
    const results = await Promise.all(users.map(async (user) => {
        const basic = Number(user.basicSalary ?? 0);
        const expected = (user.workDaysPerWeek ?? 5) * 4;
        const attended = await prisma.attendanceRecord.count({ where: { userId: user.id, workDate: { gte: range.start, lte: range.end }, checkOutAt: { not: null } } });
        const basePay = Math.min(attended / expected, 1) * basic;
        const threshold = Number(user.attendanceBonusThreshold ?? 101);
        const attendancePercent = expected ? (attended / expected) * 100 : 0;
        const bonus = attendancePercent >= threshold ? basePay * 0.05 : 0;
        return prisma.payrollRecord.upsert({
            where: { userId_payRunMonth: { userId: user.id, payRunMonth: range.payRun } },
            create: { userId: user.id, payRunMonth: range.payRun, periodStart: range.start, periodEnd: range.end, expectedWorkDays: expected, attendedDays: attended, basicSalary: basic, bonusAmount: bonus, netSalary: basePay + bonus },
            update: { periodStart: range.start, periodEnd: range.end, expectedWorkDays: expected, attendedDays: attended, basicSalary: basic, bonusAmount: bonus, netSalary: basePay + bonus },
        });
    }));
    return c.json({ records: results, message: `Payroll generated for ${results.length} employees.` }, 201);
}
