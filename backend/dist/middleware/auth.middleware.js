import { getCookie } from "hono/cookie";
import { verify } from "hono/jwt";
import { accessCookieName } from "../lib/auth.js";
import { prisma } from "../lib/prisma.js";
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
    let payload;
    try {
        payload = (await verify(token, secret, "HS256"));
    }
    catch {
        return c.json({ message: "Your session is invalid or expired" }, 401);
    }
    const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: { employeeId: true, company: true, role: true, accountStatus: true },
    });
    if (!user || user.accountStatus === "Suspended") {
        return c.json({ message: "Your account is unavailable" }, 401);
    }
    c.set("authUser", {
        ...payload,
        employeeId: user.employeeId,
        company: user.company,
        role: user.role,
    });
    await next();
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
