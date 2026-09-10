import { prisma } from "../../lib/prisma.js";
const payrollStatus = ["Pending approval", "Approved", "Paid"];
function payrollMonthRange(payRunMonth) {
    if (typeof payRunMonth === "string") {
        const match = /^(\d{4})-(\d{2})$/.exec(payRunMonth);
        if (!match)
            return null;
        const year = Number(match[1]);
        const month = Number(match[2]);
        if (!Number.isInteger(year) || month < 1 || month > 12)
            return null;
        const payRun = new Date(Date.UTC(year, month - 1, 1));
        const start = new Date(payRun);
        const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
        return { payRun, start, end };
    }
    // Preserve the original API behavior for callers that do not select a month.
    const now = new Date();
    const payRun = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
    const start = new Date(payRun);
    const end = new Date(Date.UTC(payRun.getUTCFullYear(), payRun.getUTCMonth() + 1, 0, 23, 59, 59, 999));
    return { payRun, start, end };
}
function minutesFromTime(value) {
    const [hours, minutes] = value.split(":").map(Number);
    return Number.isFinite(hours) && Number.isFinite(minutes)
        ? hours * 60 + minutes
        : 0;
}
function scheduledHours(start, end) {
    const minutes = minutesFromTime(end) - minutesFromTime(start);
    return Math.max(minutes > 0 ? minutes / 60 : 8, 1);
}
function round(value) {
    return Math.round(value * 100) / 100;
}
export async function list(c) {
    const payRunMonth = c.req.query("payRunMonth");
    const range = payRunMonth ? payrollMonthRange(payRunMonth) : null;
    if (payRunMonth && !range) {
        return c.json({ message: "Choose a valid payroll month in YYYY-MM format." }, 400);
    }
    const company = c.get("authUser").company;
    const records = await prisma.payrollRecord.findMany({
        where: range
            ? {
                payRunMonth: range.payRun,
                user: {
                    company,
                    basicSalary: { not: null },
                    attendanceRecords: {
                        some: {
                            workDate: { gte: range.start, lte: range.end },
                        },
                    },
                },
            }
            : { user: { company } },
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                    employeeId: true,
                    profilePic: true,
                    department: true,
                    designation: true,
                },
            },
        },
        orderBy: [{ payRunMonth: "desc" }, { createdAt: "desc" }],
    });
    return c.json({ records });
}
export async function generate(c) {
    const body = (await c.req.json().catch(() => ({})));
    const range = payrollMonthRange(body.payRunMonth);
    if (!range)
        return c.json({ message: "Choose a valid payroll month in YYYY-MM format." }, 400);
    const company = c.get("authUser").company;
    const users = await prisma.user.findMany({
        where: {
            company,
            accountStatus: "Active",
            basicSalary: { not: null },
            attendanceRecords: {
                some: {
                    workDate: { gte: range.start, lte: range.end },
                },
            },
        },
        select: {
            id: true,
            basicSalary: true,
            workDaysPerWeek: true,
            attendanceBonusThreshold: true,
            attendanceBonusRate: true,
        },
    });
    const results = await Promise.all(users.map(async (user) => {
        const basicSalary = Number(user.basicSalary ?? 0);
        const expectedWorkDays = Math.max(1, (user.workDaysPerWeek ?? 5) * 4);
        const records = await prisma.attendanceRecord.findMany({
            where: {
                userId: user.id,
                workDate: { gte: range.start, lte: range.end },
            },
            select: {
                workDate: true,
                checkInAt: true,
                checkOutAt: true,
                shiftStartTime: true,
                shiftEndTime: true,
            },
        });
        const attendanceDays = new Set(records.map((record) => record.workDate.toISOString().slice(0, 10))).size;
        const expectedDailyHours = records.length
            ? records.reduce((sum, record) => sum + scheduledHours(record.shiftStartTime, record.shiftEndTime), 0) / records.length
            : 8;
        const expectedWorkHours = expectedWorkDays * expectedDailyHours;
        let workedHours = 0;
        let overtimeHours = 0;
        let shortHours = Math.max(0, expectedWorkDays - attendanceDays) * expectedDailyHours;
        for (const record of records) {
            if (!record.checkOutAt)
                continue;
            const actualHours = Math.max(0, (record.checkOutAt.getTime() - record.checkInAt.getTime()) /
                3_600_000);
            const plannedHours = scheduledHours(record.shiftStartTime, record.shiftEndTime);
            workedHours += actualHours;
            overtimeHours += Math.max(0, actualHours - plannedHours);
            shortHours += Math.max(0, plannedHours - actualHours);
        }
        const hourlyRate = basicSalary / Math.max(expectedWorkHours, 1);
        const attendancePercent = (attendanceDays / expectedWorkDays) * 100;
        const threshold = Number(user.attendanceBonusThreshold ?? 101);
        const bonusRate = Number(user.attendanceBonusRate ?? 5);
        const bonusAmount = attendancePercent >= threshold ? basicSalary * (bonusRate / 100) : 0;
        const overtimeAmount = overtimeHours * hourlyRate;
        const deductionAmount = Math.min(basicSalary, shortHours * hourlyRate);
        const netSalary = Math.max(0, basicSalary + bonusAmount + overtimeAmount - deductionAmount);
        return prisma.payrollRecord.upsert({
            where: {
                userId_payRunMonth: { userId: user.id, payRunMonth: range.payRun },
            },
            create: {
                userId: user.id,
                payRunMonth: range.payRun,
                periodStart: range.start,
                periodEnd: range.end,
                expectedWorkDays,
                attendedDays: attendanceDays,
                basicSalary: String(round(basicSalary)),
                bonusAmount: String(round(bonusAmount)),
                expectedWorkHours: String(round(expectedWorkHours)),
                workedHours: String(round(workedHours)),
                overtimeHours: String(round(overtimeHours)),
                shortHours: String(round(shortHours)),
                overtimeAmount: String(round(overtimeAmount)),
                deductionAmount: String(round(deductionAmount)),
                netSalary: String(round(netSalary)),
            },
            update: {
                periodStart: range.start,
                periodEnd: range.end,
                expectedWorkDays,
                attendedDays: attendanceDays,
                basicSalary: String(round(basicSalary)),
                bonusAmount: String(round(bonusAmount)),
                expectedWorkHours: String(round(expectedWorkHours)),
                workedHours: String(round(workedHours)),
                overtimeHours: String(round(overtimeHours)),
                shortHours: String(round(shortHours)),
                overtimeAmount: String(round(overtimeAmount)),
                deductionAmount: String(round(deductionAmount)),
                netSalary: String(round(netSalary)),
            },
        });
    }));
    return c.json({
        records: results,
        message: `Payroll generated for ${results.length} employees for ${range.payRun.toLocaleDateString("en", { month: "long", year: "numeric", timeZone: "UTC" })}.`,
    }, 201);
}
export async function updateStatus(c) {
    const body = (await c.req.json().catch(() => null));
    const status = typeof body?.status === "string" ? body.status : "";
    if (!payrollStatus.includes(status)) {
        return c.json({ message: "Invalid payroll status." }, 400);
    }
    const result = await prisma.payrollRecord.updateMany({
        where: {
            id: c.req.param("id"),
            user: { company: c.get("authUser").company },
        },
        data: { status },
    });
    return result.count
        ? c.json({ message: "Payroll status updated." })
        : c.json({ message: "Payroll record not found." }, 404);
}
export async function remove(c) {
    const result = await prisma.payrollRecord.deleteMany({
        where: {
            id: c.req.param("id"),
            user: { company: c.get("authUser").company },
        },
    });
    return result.count
        ? c.json({ message: "Payroll record deleted." })
        : c.json({ message: "Payroll record not found." }, 404);
}
