import { Hono } from "hono";
import {
  login,
  logout,
  me,
  refresh,
  updateProfile,
} from "./auth.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import type { AppEnv } from "./auth.types.js";

const authRoutes = new Hono<AppEnv>();

authRoutes.post("/login", login);
authRoutes.post("/refresh", refresh);
authRoutes.get("/me", requireAuth, me);
authRoutes.patch("/profile", requireAuth, updateProfile);
authRoutes.post("/logout", requireAuth, logout);

export default authRoutes;
