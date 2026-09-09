import { Hono } from "hono";
import { requireAuth, requireRole } from "../../middleware/auth.middleware.js";
import {
  createLoan,
  deleteLoan,
  getLoan,
  getLoans,
  updateLoan,
} from "./loan.controller.js";
import type { AppEnv } from "../auth/auth.types.js";
const routes = new Hono<AppEnv>();
routes.use("*", requireAuth, requireRole("OM"));
routes.get("/list", getLoans);
routes.get("/:id", getLoan);
routes.post("/create", createLoan);
routes.patch("/:id", updateLoan);
routes.delete("/:id", deleteLoan);
export default routes;
