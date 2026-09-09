import type { AttendanceRecord } from "./attendance";
import type { LeaveRequest } from "./leave-request";
import type { Loan, SalaryAdvance, UserDocument } from "./om";

export type OfficerRequestUser = {
  name: string | null;
  employeeId: string;
  profilePic: string | null;
  workStartTime: string;
  workEndTime: string;
};

export type OfficerAttendanceRecord = Omit<AttendanceRecord, "user"> & {
  user: OfficerRequestUser;
};

export type OfficerLeaveRequest = LeaveRequest & {
  user: OfficerRequestUser;
};

export type OfficerDocument = UserDocument & {
  user: OfficerRequestUser;
};

export type OfficerSalaryAdvance = SalaryAdvance & {
  user: OfficerRequestUser;
};

export type OfficerLoan = Loan & {
  user: OfficerRequestUser;
};

export type OfficerDocumentInput = {
  title: string;
  documentType: string;
  description: string;
  fileUrl: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
};
