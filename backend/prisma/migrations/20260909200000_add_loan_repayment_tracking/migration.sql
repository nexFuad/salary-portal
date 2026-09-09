ALTER TABLE "LoanRequest"
ADD COLUMN "monthlyInstallment" DECIMAL(12, 2) NOT NULL DEFAULT 0,
ADD COLUMN "paidAmount" DECIMAL(12, 2) NOT NULL DEFAULT 0,
ADD COLUMN "remainingAmount" DECIMAL(12, 2) NOT NULL DEFAULT 0,
ADD COLUMN "repaymentEndDate" TIMESTAMP(3);

UPDATE "LoanRequest"
SET
  "monthlyInstallment" = ROUND("requestedAmount" / GREATEST("repaymentMonths", 1), 2),
  "remainingAmount" = "requestedAmount",
  "repaymentEndDate" = "preferredStartDate" + (GREATEST("repaymentMonths", 1) - 1) * INTERVAL '1 month'
WHERE "monthlyInstallment" = 0;
