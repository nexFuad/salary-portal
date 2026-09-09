import { getCookie } from "hono/cookie";
import { verify } from "hono/jwt";
import { accessCookieName } from "../lib/auth.js";
function getToken(authorization, cookieToken) {
    if (authorization?.startsWith("Bearer ")) {
        return authorization.slice(7);
    }
    return cookieToken;
}
export const requireAuth = async (c, next) => {
    const secret = process.env.AUTH_JWT_SECRET;
    const token = getToken(c.req.header("Authorization"), getCookie(c, accessCookieName));
    if (!secret || !token) {
        return c.json({ message: "Authentication is required" }, 401);
    }
    try {
        const payload = (await verify(token, secret, "HS256"));
        c.set("authUser", payload);
        await next();
    }
    catch {
        return c.json({ message: "Your session is invalid or expired" }, 401);
    }
};
export function requireRole(...roles) {
    return async (c, next) => {
        const user = c.get("authUser");
        if (!roles.includes(user.role)) {
            return c.json({ message: "You do not have permission for this action" }, 403);
        }
        await next();
    };
}
