import type { Context } from "hono";
import { RequestStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import type { AppEnv } from "../auth/auth.types.js";
import { refreshLoanRepaymentProgress } from "./loan.service.js";
const loanTypes = [
  "Personal Loan",
  "Emergency Loan",
  "Medical/Family Support",
  "Other",
];
const valid = (v: unknown) => {
  const x = v as Record<string, unknown>;
  const requestedAmount = Number(x?.requestedAmount);
  const monthlyInstallment = Number(x?.monthlyInstallment);
  const repaymentMonths = Math.ceil(requestedAmount / monthlyInstallment);

  return (
    x &&
    loanTypes.includes(String(x.loanType)) &&
    Number.isFinite(requestedAmount) &&
    requestedAmount > 0 &&
    typeof x.purpose === "string" &&
    x.purpose.trim() &&
    Number.isFinite(monthlyInstallment) &&
    monthlyInstallment > 0 &&
    repaymentMonths > 0 &&
    repaymentMonths <= 60 &&
    typeof x.preferredStartDate === "string" &&
    !Number.isNaN(new Date(x.preferredStartDate).getTime())
  );
};

function requestData(body: Record<string, unknown>) {
  const requestedAmount = Number(body.requestedAmount);
  const monthlyInstallment = Number(body.monthlyInstallment);
  const repaymentMonths = Math.ceil(requestedAmount / monthlyInstallment);
  const preferredStartDate = new Date(String(body.preferredStartDate));
  const repaymentEndDate = new Date(preferredStartDate);
  repaymentEndDate.setUTCMonth(
    repaymentEndDate.getUTCMonth() + repaymentMonths - 1,
  );

  return {
    loanType: String(body.loanType),
    requestedAmount: String(requestedAmount),
    purpose: String(body.purpose).trim(),
    repaymentMonths,
    installments: repaymentMonths,
    monthlyInstallment: String(monthlyInstallment),
    paidAmount: "0",
    remainingAmount: String(requestedAmount),
    preferredStartDate,
    repaymentEndDate,
    note: typeof body.note === "string" ? body.note.trim() || null : null,
    requestDate:
      typeof body.requestDate === "string" &&
      !Number.isNaN(new Date(body.requestDate).getTime())
        ? new Date(body.requestDate)
        : new Date(),
  };
}
export async function getLoans(c: Context<AppEnv>) {
  await refreshLoanRepaymentProgress(c.get("authUser").sub);
  const requests = await prisma.loanRequest.findMany({
    where: { userId: c.get("authUser").sub },
    orderBy: { createdAt: "desc" },
  });
  return c.json({ requests });
}
export async function getLoan(c: Context<AppEnv>) {
  await refreshLoanRepaymentProgress(c.get("authUser").sub);
  const request = await prisma.loanRequest.findFirst({
    where: { id: c.req.param("id")!, userId: c.get("authUser").sub },
  });
  if (!request) return c.json({ message: "Loan request not found" }, 404);
  return c.json({ request });
}
export async function createLoan(c: Context<AppEnv>) {
  const body: unknown = await c.req.json().catch(() => null);
  if (!valid(body))
    return c.json({ message: "Please provide valid loan details" }, 400);
  const x = requestData(body as Record<string, unknown>);
  const request = await prisma.loanRequest.create({
    data: {
      userId: c.get("authUser").sub,
      loanType: x.loanType,
      requestedAmount: x.requestedAmount,
      purpose: x.purpose,
      repaymentMonths: x.repaymentMonths,
      installments: x.installments,
      preferredStartDate: x.preferredStartDate,
      note: x.note,
      requestDate: x.requestDate,
    },
  });
  return c.json({ request }, 201);
}

export async function updateLoan(c: Context<AppEnv>) {
  const body: unknown = await c.req.json().catch(() => null);
  if (!valid(body)) {
    return c.json({ message: "Please provide valid loan details" }, 400);
  }

  const result = await prisma.loanRequest.updateMany({
    where: {
      id: c.req.param("id")!,
      userId: c.get("authUser").sub,
      status: RequestStatus.PENDING,
    },
    data: requestData(body as Record<string, unknown>),
  });
  if (!result.count) {
    return c.json(
      { message: "Only your pending loan request can be updated" },
      404,
    );
  }

  const request = await prisma.loanRequest.findUnique({
    where: { id: c.req.param("id")! },
  });
  return c.json({ request });
}

export async function deleteLoan(c: Context<AppEnv>) {
  const result = await prisma.loanRequest.deleteMany({
    where: {
      id: c.req.param("id")!,
      userId: c.get("authUser").sub,
      status: RequestStatus.PENDING,
    },
  });
  if (!result.count) {
    return c.json(
      { message: "Only your pending loan request can be deleted" },
      404,
    );
  }

  return c.json({ message: "Loan request deleted" });
}
