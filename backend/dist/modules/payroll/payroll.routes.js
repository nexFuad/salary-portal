import { Hono } from "hono";
import { requireAuth, requireRole } from "../../middleware/auth.middleware.js";
import { generate, list } from "./payroll.controller.js";
const payrollRoutes = new Hono();
payrollRoutes.use("*", requireAuth, requireRole("OFFICER"));
payrollRoutes.get("/list", list);
payrollRoutes.post("/generate", generate);
export default payrollRoutes;
