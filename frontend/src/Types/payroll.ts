export type PayrollRecord = {
  id: string;
  payRunMonth: string;
  periodStart: string;
  periodEnd: string;
  expectedWorkDays: number;
  attendedDays: number;
  basicSalary: string;
  bonusAmount: string;
  expectedWorkHours: string;
  workedHours: string;
  overtimeHours: string;
  shortHours: string;
  overtimeAmount: string;
  deductionAmount: string;
  netSalary: string;
  status: string;
  user: {
    name: string | null;
    email: string | null;
    employeeId: string;
    profilePic: string | null;
    department: string | null;
    designation: string | null;
  };
};
