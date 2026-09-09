import { getCookie } from "hono/cookie";
import type { Context } from "hono";
import {
  authenticateUser,
  createRefreshSession,
  findPublicUserById,
  revokeRefreshSession,
  rotateRefreshSession,
  toPublicUser,
} from "./auth.service.js";
import {
  clearAuthCookies,
  refreshCookieName,
  setAuthCookies,
} from "../../lib/auth.js";
import type { AppEnv, LoginInput } from "./auth.types.js";

function isLoginInput(value: unknown): value is LoginInput {
  if (!value || typeof value !== "object") return false;

  const input = value as Record<string, unknown>;
  return (
    typeof input.employeeId === "string" &&
    typeof input.company === "string" &&
    typeof input.password === "string" &&
    typeof input.rememberMe === "boolean"
  );
}

export async function login(c: Context<AppEnv>) {
  const body: unknown = await c.req.json().catch(() => null);

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

export async function me(c: Context<AppEnv>) {
  const authUser = c.get("authUser");
  const user = await findPublicUserById(authUser.sub);

  if (!user) {
    return c.json({ message: "User not found" }, 404);
  }

  return c.json({ user });
}

export async function updateProfile(c: Context<AppEnv>) {
  const body = (await c.req.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!body) return c.json({ message: "Profile details are required" }, 400);
  const name = typeof body.name === "string" ? body.name.trim() : undefined;
  const phone = typeof body.phone === "string" ? body.phone.trim() : undefined;
  const profilePic =
    typeof body.profilePic === "string" ? body.profilePic.trim() : undefined;
  if (
    (name !== undefined && !name) ||
    (phone !== undefined && phone.length > 30) ||
    (profilePic !== undefined &&
      profilePic &&
      !profilePic.startsWith("https://"))
  )
    return c.json({ message: "Please provide valid profile details" }, 400);
  const user = await import("../../lib/prisma.js").then(({ prisma }) =>
    prisma.user.update({
      where: { id: c.get("authUser").sub },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(phone !== undefined ? { phone: phone || null } : {}),
        ...(profilePic !== undefined ? { profilePic: profilePic || null } : {}),
      },
    }),
  );
  return c.json({ user: toPublicUser(user) });
}

export async function refresh(c: Context<AppEnv>) {
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

export async function logout(c: Context<AppEnv>) {
  const refreshToken = getCookie(c, refreshCookieName);
  if (refreshToken) await revokeRefreshSession(refreshToken);

  clearAuthCookies(c);
  return c.json({ message: "Logged out successfully" });
}
