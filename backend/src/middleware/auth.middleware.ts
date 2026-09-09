import { getCookie } from "hono/cookie";
import { verify } from "hono/jwt";
import type { MiddlewareHandler } from "hono";
import { accessCookieName } from "../lib/auth.js";
import type { AppEnv, JwtPayload } from "../modules/auth/auth.types.js";

function getToken(
  authorization: string | undefined,
  cookieToken: string | undefined,
) {
  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice(7);
  }

  return cookieToken;
}

export const requireAuth: MiddlewareHandler<AppEnv> = async (c, next) => {
  const secret = process.env.AUTH_JWT_SECRET;
  const token = getToken(
    c.req.header("Authorization"),
    getCookie(c, accessCookieName),
  );

  if (!secret || !token) {
    return c.json({ message: "Authentication is required" }, 401);
  }

  try {
    const payload = (await verify(token, secret, "HS256")) as JwtPayload;
    c.set("authUser", payload);
    await next();
  } catch {
    return c.json({ message: "Your session is invalid or expired" }, 401);
  }
};

export function requireRole(
  ...roles: JwtPayload["role"][]
): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const user = c.get("authUser");

    if (!roles.includes(user.role)) {
      return c.json(
        { message: "You do not have permission for this action" },
        403,
      );
    }

    await next();
  };
}
