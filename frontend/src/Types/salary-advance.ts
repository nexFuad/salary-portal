import type { SalaryAdvance } from "./om";

export type SalaryAdvanceForm = {
  requestedAmount: string;
  repaymentMonths: string;
  reason: string;
  note: string;
  requestDate: string;
};

export type SalaryAdvanceDialogProps = {
  editing: SalaryAdvance | null;
  onClose: () => void;
};
