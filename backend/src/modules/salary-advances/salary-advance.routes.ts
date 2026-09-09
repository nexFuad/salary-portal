import { Hono } from "hono";
import { requireAuth, requireRole } from "../../middleware/auth.middleware.js";
import {
  cancelSalaryAdvance,
  createSalaryAdvance,
  deleteSalaryAdvance,
  getSalaryAdvances,
  updateSalaryAdvance,
} from "./salary-advance.controller.js";
import type { AppEnv } from "../auth/auth.types.js";
const routes = new Hono<AppEnv>();
routes.use("*", requireAuth, requireRole("OM"));
routes.get("/list", getSalaryAdvances);
routes.post("/create", createSalaryAdvance);
routes.patch("/:id", updateSalaryAdvance);
routes.patch("/:id/cancel", cancelSalaryAdvance);
routes.delete("/:id", deleteSalaryAdvance);
export default routes;
