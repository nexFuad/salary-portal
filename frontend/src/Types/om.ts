export type RequestStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED"
  | "ACTIVE";
export type SalaryAdvance = {
  id: string;
  requestedAmount: string;
  reason: string;
  repaymentMonths: number;
  note: string | null;
  requestDate: string;
  status: RequestStatus;
  approvedAmount: string | null;
  adminNote: string | null;
  updatedAt: string;
};
export type Loan = {
  id: string;
  loanType: string;
  requestedAmount: string;
  purpose: string;
  repaymentMonths: number;
  installments: number;
  monthlyInstallment: string;
  paidAmount: string;
  remainingAmount: string;
  preferredStartDate: string;
  repaymentEndDate: string | null;
  note: string | null;
  requestDate: string;
  status: RequestStatus;
  approvedAmount: string | null;
  adminNote: string | null;
  updatedAt: string;
};
export type UserDocument = {
  id: string;
  title: string;
  documentType: string;
  description: string | null;
  fileUrl: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
};
