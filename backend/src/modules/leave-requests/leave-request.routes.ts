import { Hono } from "hono";
import { requireAuth, requireRole } from "../../middleware/auth.middleware.js";
import type { AppEnv } from "../auth/auth.types.js";
import {
  create,
  getById,
  list,
  remove,
  update,
} from "./leave-request.controller.js";

const leaveRequestRoutes = new Hono<AppEnv>();

leaveRequestRoutes.use("*", requireAuth, requireRole("OM"));
leaveRequestRoutes.get("/", list);
leaveRequestRoutes.get("/list", list);
leaveRequestRoutes.get("/:id", getById);
leaveRequestRoutes.post("/", create);
leaveRequestRoutes.post("/create", create);
leaveRequestRoutes.patch("/:id", update);
leaveRequestRoutes.delete("/:id", remove);

export default leaveRequestRoutes;
