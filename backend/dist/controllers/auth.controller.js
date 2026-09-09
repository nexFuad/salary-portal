import { getCookie } from "hono/cookie";
import {
  authenticateUser,
  createRefreshSession,
  findPublicUserById,
  revokeRefreshSession,
  rotateRefreshSession,
  toPublicUser,
} from "../services/auth.service.js";
import {
  clearAuthCookies,
  refreshCookieName,
  setAuthCookies,
} from "../lib/auth.js";
function isLoginInput(value) {
  if (!value || typeof value !== "object") return false;
  const input = value;
  return (
    typeof input.employeeId === "string" &&
    typeof input.company === "string" &&
    typeof input.password === "string" &&
    typeof input.rememberMe === "boolean"
  );
}
export async function login(c) {
  const body = await c.req.json().catch(() => null);
  if (!isLoginInput(body)) {
    return c.json(
      {
        message: "Employee ID, company, password, and rememberMe are required",
      },
      400,
    );
  }
  const employeeId = body.employeeId.trim();
  const company = body.company.trim();
  if (!employeeId || !company || !body.password) {
    return c.json(
      { message: "Employee ID, company, and password are required" },
      400,
    );
  }
  const user = await authenticateUser(employeeId, company, body.password);
  if (!user) {
    return c.json(
      { message: "Invalid Employee ID, company, or password" },
      401,
    );
  }
  const refreshToken = await createRefreshSession(user.id, body.rememberMe);
  await setAuthCookies(c, user, refreshToken, body.rememberMe);
  return c.json({ user: toPublicUser(user) });
}
export async function me(c) {
  const authUser = c.get("authUser");
  const user = await findPublicUserById(authUser.sub);
  if (!user) {
    return c.json({ message: "User not found" }, 404);
  }
  return c.json({ user });
}
export async function refresh(c) {
  const refreshToken = getCookie(c, refreshCookieName);
  if (!refreshToken)
    return c.json({ message: "Refresh session is required" }, 401);
  const result = await rotateRefreshSession(refreshToken);
  if (!result) {
    clearAuthCookies(c);
    return c.json(
      { message: "Your session has expired. Please sign in again." },
      401,
    );
  }
  await setAuthCookies(c, result.user, result.refreshToken, result.persistent);
  return c.json({ user: toPublicUser(result.user) });
}
export async function logout(c) {
  const refreshToken = getCookie(c, refreshCookieName);
  if (refreshToken) await revokeRefreshSession(refreshToken);
  clearAuthCookies(c);
  return c.json({ message: "Logged out successfully" });
}
