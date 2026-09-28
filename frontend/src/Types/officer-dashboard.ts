import type { ComponentType } from "react";

export type IconProps = { size?: number; strokeWidth?: number; className?: string };

export type StatCard = {
  label: string;
  value: string;
  note?: string;
  noteTone?: "success" | "warning";
  icon: ComponentType<IconProps>;
};

export type OfficerDashboard = {
  overview: {
    totalEmployees: number;
    activeEmployees: number;
    inactiveEmployees: number;
    monthlySalary: number;
    pendingPayroll: number;
    paidPayroll: number;
    pendingLeave: number;
    pendingAdvances: number;
    pendingLoans: number;
  };
  monthlySalaryExpenses: { month: string; total: number }[];
  payrollStatus: {
    paid: number;
    pending: number;
    approved: number;
    draft: number;
  };
  activities: {
    title: string;
    detail: string;
    occurredAt: string;
  }[];
};
