import { RequestStatus, type Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";

const activityUser = {
  select: { name: true, employeeId: true },
} satisfies Prisma.UserDefaultArgs;

function monthStart(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function monthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function displayName(user: { name: string | null; employeeId: string }) {
  return user.name?.trim() || user.employeeId;
}

export async function getOfficerDashboard(company: string) {
  const now = new Date();
  const thisMonth = monthStart(now);
  const sixMonthStart = new Date(thisMonth);
  sixMonthStart.setUTCMonth(sixMonthStart.getUTCMonth() - 5);

  const [
    totalEmployees,
    activeEmployees,
    payrollRecords,
    pendingLeave,
    pendingAdvances,
    pendingLoans,
    recentLeaves,
    recentAdvances,
    recentLoans,
    recentPayroll,
  ] = await Promise.all([
    prisma.user.count({ where: { company } }),
    prisma.user.count({ where: { company, accountStatus: "Active" } }),
    prisma.payrollRecord.findMany({
      where: { user: { company }, payRunMonth: { gte: sixMonthStart } },
      select: {
        payRunMonth: true,
        netSalary: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        user: activityUser,
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.leaveRequest.count({
      where: { status: "PENDING", user: { company } },
    }),
    prisma.salaryAdvanceRequest.count({
      where: { status: RequestStatus.PENDING, user: { company } },
    }),
    prisma.loanRequest.count({
      where: { status: RequestStatus.PENDING, user: { company } },
    }),
    prisma.leaveRequest.findMany({
      where: { user: { company } },
      include: { user: activityUser },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.salaryAdvanceRequest.findMany({
      where: { user: { company } },
      include: { user: activityUser },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.loanRequest.findMany({
      where: { user: { company } },
      include: { user: activityUser },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.payrollRecord.findMany({
      where: { user: { company } },
      include: { user: activityUser },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
  ]);

  const monthlySalary = payrollRecords
    .filter((record) => monthKey(record.payRunMonth) === monthKey(thisMonth))
    .reduce((total, record) => total + Number(record.netSalary), 0);
  const currentMonthPayroll = payrollRecords.filter(
    (record) => monthKey(record.payRunMonth) === monthKey(thisMonth),
  );
  const payrollStatus = currentMonthPayroll.reduce(
    (summary, record) => {
      const status = record.status.toLowerCase();
      if (status.includes("paid")) summary.paid += 1;
      else if (status.includes("approved")) summary.approved += 1;
      else if (status.includes("draft")) summary.draft += 1;
      else summary.pending += 1;
      return summary;
    },
    { paid: 0, pending: 0, approved: 0, draft: 0 },
  );

  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(sixMonthStart);
    date.setUTCMonth(date.getUTCMonth() + index);
    const total = payrollRecords
      .filter((record) => monthKey(record.payRunMonth) === monthKey(date))
      .reduce((sum, record) => sum + Number(record.netSalary), 0);
    return { month: monthKey(date), total };
  });

  const activities = [
    ...recentLeaves.map((request) => ({
      title: `${displayName(request.user)} — ${request.status.toLowerCase()} leave request`,
      detail: request.leaveType,
      occurredAt: request.updatedAt,
    })),
    ...recentAdvances.map((request) => ({
      title: `${displayName(request.user)} — ${request.status.toLowerCase()} salary advance`,
      detail: `Requested ৳${Number(request.requestedAmount).toLocaleString()}`,
      occurredAt: request.updatedAt,
    })),
    ...recentLoans.map((request) => ({
      title: `${displayName(request.user)} — ${request.status.toLowerCase()} loan request`,
      detail: `${request.loanType} · ৳${Number(request.requestedAmount).toLocaleString()}`,
      occurredAt: request.updatedAt,
    })),
    ...recentPayroll.map((record) => ({
      title: `${displayName(record.user)} — payroll ${record.status.toLowerCase()}`,
      detail: `Net salary ৳${Number(record.netSalary).toLocaleString()}`,
      occurredAt: record.updatedAt,
    })),
  ]
    .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
    .slice(0, 6);

  return {
    overview: {
      totalEmployees,
      activeEmployees,
      inactiveEmployees: totalEmployees - activeEmployees,
      monthlySalary,
      pendingPayroll: payrollStatus.pending,
      paidPayroll: payrollStatus.paid,
      pendingLeave,
      pendingAdvances,
      pendingLoans,
    },
    monthlySalaryExpenses: months,
    payrollStatus,
    activities,
  };
}
