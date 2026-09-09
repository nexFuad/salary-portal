import type { UserRole } from "@prisma/client";

export type EmployeeInput = {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  profilePic?: string;
  dateOfBirth?: string;
  gender?: string;
  role: UserRole;
  accountStatus?: string;
  employeeId?: string;
  department?: string;
  designation?: string;
  employmentType?: string;
  workDaysPerWeek?: string | number;
  workStartTime?: string;
  workEndTime?: string;
  joinDate?: string;
  employmentStatus?: string;
  basicSalary?: string | number;
  salaryType?: string;
  allowances?: string | number;
  attendanceBonusThreshold?: string | number;
  attendanceBonusRate?: string | number;
  effectiveSalaryDate?: string;
  address?: string;
  city?: string;
  country?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  manager?: string;
  workLocation?: string;
};

export type UpdateEmployeeInput = Omit<EmployeeInput, "password"> & {
  password?: string;
};
