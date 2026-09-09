import { Hono } from "hono";
import { login, logout, me, refresh } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
const authRoutes = new Hono();
authRoutes.post("/login", login);
authRoutes.post("/refresh", refresh);
authRoutes.get("/me", requireAuth, me);
authRoutes.post("/logout", requireAuth, logout);
export default authRoutes;
