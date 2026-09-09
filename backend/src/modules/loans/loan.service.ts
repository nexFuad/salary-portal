import { RequestStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";

const amount = (value: unknown) => Math.max(0, Number(value) || 0);

function paymentCountDue(startDate: Date, now: Date) {
  if (now < startDate) return 0;

  const months =
    (now.getUTCFullYear() - startDate.getUTCFullYear()) * 12 +
    now.getUTCMonth() -
    startDate.getUTCMonth();

  return Math.max(
    0,
    months + (now.getUTCDate() >= startDate.getUTCDate() ? 1 : 0),
  );
}

/** Updates approved loans when their repayment date arrives and persists paid/due values. */
export async function refreshLoanRepaymentProgress(userId?: string) {
  const loans = await prisma.loanRequest.findMany({
    where: {
      ...(userId ? { userId } : {}),
      status: { in: [RequestStatus.APPROVED, RequestStatus.ACTIVE] },
    },
  });
  const now = new Date();

  await Promise.all(
    loans.map(async (loan) => {
      const total = amount(loan.approvedAmount ?? loan.requestedAmount);
      const monthly =
        amount(loan.monthlyInstallment) ||
        Math.ceil((total / Math.max(loan.repaymentMonths, 1)) * 100) / 100;
      const paid = Math.min(
        total,
        Math.round(
          monthly * paymentCountDue(loan.preferredStartDate, now) * 100,
        ) / 100,
      );
      const remaining = Math.max(0, Math.round((total - paid) * 100) / 100);
      const status =
        remaining === 0 && paymentCountDue(loan.preferredStartDate, now) > 0
          ? RequestStatus.COMPLETED
          : now >= loan.preferredStartDate
            ? RequestStatus.ACTIVE
            : RequestStatus.APPROVED;

      await prisma.loanRequest.update({
        where: { id: loan.id },
        data: {
          monthlyInstallment: String(monthly),
          paidAmount: String(paid),
          remainingAmount: String(remaining),
          status,
        },
      });
    }),
  );
}
