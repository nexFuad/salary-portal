import type { LeaveRequestStatus } from "@prisma/client";

export type CreateLeaveRequestInput = {
  leaveType: string;
  reason: string;
  note?: string;
  startDate: string;
  endDate: string;
};

export type UpdateLeaveRequestInput = CreateLeaveRequestInput;

export type LeaveRequestResponse = {
  id: string;
  leaveType: string;
  reason: string;
  note: string | null;
  startDate: Date;
  endDate: Date;
  status: LeaveRequestStatus;
  createdAt: Date;
  updatedAt: Date;
};
