export type LeaveRequestStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

export type LeaveRequest = {
  id: string;
  leaveType: string;
  reason: string;
  note: string | null;
  startDate: string;
  endDate: string;
  status: LeaveRequestStatus;
  createdAt: string;
  updatedAt: string;
};

export type LeaveRequestInput = {
  leaveType: string;
  reason: string;
  note?: string;
  startDate: string;
  endDate: string;
};
