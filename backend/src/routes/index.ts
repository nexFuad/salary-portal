import { Hono } from "hono";
import authRoutes from "../modules/auth/auth.routes.js";
import leaveRequestRoutes from "../modules/leave-requests/leave-request.routes.js";
import attendanceRoutes from "../modules/attendance/attendance.routes.js";
import salaryAdvanceRoutes from "../modules/salary-advances/salary-advance.routes.js";
import loanRoutes from "../modules/loans/loan.routes.js";
import documentRoutes from "../modules/documents/document.routes.js";
import employeeRoutes from "../modules/employees/employee.routes.js";
import payrollRoutes from "../modules/payroll/payroll.routes.js";
import officerRequestRoutes from "../modules/officer-requests/officer-request.routes.js";
import type { AppEnv } from "../modules/auth/auth.types.js";

const apiRoutes = new Hono<AppEnv>();

apiRoutes.route("/auth", authRoutes);
apiRoutes.route("/leave-requests", leaveRequestRoutes);
apiRoutes.route("/attendance", attendanceRoutes);
apiRoutes.route("/salary-advances", salaryAdvanceRoutes);
apiRoutes.route("/loans", loanRoutes);
apiRoutes.route("/documents", documentRoutes);
apiRoutes.route("/employees", employeeRoutes);
apiRoutes.route("/payroll", payrollRoutes);
apiRoutes.route("/officer-requests", officerRequestRoutes);

export default apiRoutes;
