import { Hono } from "hono";
import { requireAuth, requireRole } from "../../middleware/auth.middleware.js";
import {
  createDocument,
  deleteDocument,
  getDocuments,
} from "./document.controller.js";
import type { AppEnv } from "../auth/auth.types.js";
const routes = new Hono<AppEnv>();
routes.use("*", requireAuth, requireRole("OM"));
routes.get("/list", getDocuments);
routes.post("/create", createDocument);
routes.delete("/:id", deleteDocument);
export default routes;
