import type { UserRole } from "./auth";
import type { ReactNode } from "react";

export type EmployeeFormSectionProps = {
  title: string;
  children: ReactNode;
};

export type EmployeeFormFieldProps = {
  label: string;
  children: ReactNode;
  required?: boolean;
  className?: string;
};

export type EmployeePage = {
  employees: EmployeeRecord[];
  total: number;
  page: number;
  pageSize: number;
  departments: string[];
};

export type EmployeeRecord = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  profilePic: string | null;
  employeeId: string;
  company: string;
  role: UserRole;
  dateOfBirth: string | null;
  gender: string | null;
  accountStatus: string | null;
  department: string | null;
  designation: string | null;
  employmentType: string | null;
  workDaysPerWeek: number | null;
  workStartTime: string;
  workEndTime: string;
  joinDate: string | null;
  employmentStatus: string | null;
  basicSalary: string | null;
  salaryType: string | null;
  allowances: string | null;
  attendanceBonusThreshold: string | null;
  attendanceBonusRate: string | null;
  effectiveSalaryDate: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  manager: string | null;
  workLocation: string | null;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
};

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
  workDaysPerWeek?: string;
  workStartTime?: string;
  workEndTime?: string;
  joinDate?: string;
  employmentStatus?: string;
  basicSalary?: string;
  salaryType?: string;
  allowances?: string;
  attendanceBonusThreshold?: string;
  attendanceBonusRate?: string;
  effectiveSalaryDate?: string;
  address?: string;
  city?: string;
  country?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  manager?: string;
  workLocation?: string;
};

export const emptyForm: EmployeeInput = {
  name: "",
  email: "",
  password: "",
  phone: "",
  profilePic: "",
  dateOfBirth: "",
  gender: "",
  role: "OM",
  accountStatus: "Active",
  employeeId: "",
  department: "",
  designation: "",
  employmentType: "Full Time",
  workDaysPerWeek: "5",
  workStartTime: "09:00",
  workEndTime: "15:00",
  joinDate: "",
  employmentStatus: "Active",
  basicSalary: "",
  salaryType: "Monthly",
  allowances: "",
  attendanceBonusThreshold: "",
  attendanceBonusRate: "5",
  effectiveSalaryDate: "",
  address: "",
  city: "",
  country: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  manager: "",
  workLocation: "Office",
};

export function dateValue(value: string | null) {
  return value?.slice(0, 10) ?? "";
}

export function toForm(employee: EmployeeRecord): EmployeeInput {
  return {
    ...emptyForm,
    name: employee.name ?? "",
    email: employee.email ?? "",
    phone: employee.phone ?? "",
    profilePic: employee.profilePic ?? "",
    gender: employee.gender ?? "",
    role: employee.role,
    accountStatus: employee.accountStatus ?? "Active",
    employeeId: employee.employeeId,
    department: employee.department ?? "",
    designation: employee.designation ?? "",
    employmentType: employee.employmentType ?? "Full Time",
    workDaysPerWeek: employee.workDaysPerWeek?.toString() ?? "5",
    workStartTime: employee.workStartTime ?? "09:00",
    workEndTime: employee.workEndTime ?? "15:00",
    employmentStatus: employee.employmentStatus ?? "Active",
    salaryType: employee.salaryType ?? "Monthly",
    address: employee.address ?? "",
    city: employee.city ?? "",
    country: employee.country ?? "",
    emergencyContactName: employee.emergencyContactName ?? "",
    emergencyContactPhone: employee.emergencyContactPhone ?? "",
    manager: employee.manager ?? "",
    workLocation: employee.workLocation ?? "Office",
    password: "",
    dateOfBirth: dateValue(employee.dateOfBirth),
    joinDate: dateValue(employee.joinDate),
    effectiveSalaryDate: dateValue(employee.effectiveSalaryDate),
    basicSalary: employee.basicSalary ?? "",
    allowances: employee.allowances ?? "",
    attendanceBonusThreshold: employee.attendanceBonusThreshold ?? "",
    attendanceBonusRate: employee.attendanceBonusRate ?? "5",
  };
}
