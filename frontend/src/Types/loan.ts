import type { Loan } from "./om";

export type LoanForm = {
  loanType: string;
  requestedAmount: string;
  purpose: string;
  monthlyInstallment: string;
  preferredStartDate: string;
  note: string;
  requestDate: string;
};

export type LoanDialogProps = {
  editing: Loan | null;
  onClose: () => void;
};
