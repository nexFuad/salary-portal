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
