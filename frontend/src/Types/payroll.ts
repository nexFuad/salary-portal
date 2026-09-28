export type PayrollPage = {
  records: PayrollRecord[];
  total: number;
  monthTotal: number;
  page: number;
  pageSize: number;
  departments: string[];
  statuses: string[];
};

export type PayrollGenerationResult = {
  payRunMonth: string;
  generatedCount: number;
  message: string;
};

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
