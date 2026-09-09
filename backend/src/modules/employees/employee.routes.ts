import { Hono } from "hono";
import { requireAuth, requireRole } from "../../middleware/auth.middleware.js";
import type { AppEnv } from "../auth/auth.types.js";
import {
  create,
  getById,
  list,
  remove,
  update,
  updateAccountStatus,
} from "./employee.controller.js";

const employeeRoutes = new Hono<AppEnv>();

employeeRoutes.use("*", requireAuth, requireRole("OFFICER"));
employeeRoutes.get("/list", list);
employeeRoutes.patch("/:id/account-status", updateAccountStatus);
employeeRoutes.get("/:id", getById);
employeeRoutes.post("/create", create);
employeeRoutes.patch("/:id", update);
employeeRoutes.delete("/:id", remove);

export default employeeRoutes;
