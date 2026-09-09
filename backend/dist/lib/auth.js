import { deleteCookie, setCookie } from "hono/cookie";
import { sign } from "hono/jwt";
export const accessCookieName = "salary_portal_token";
export const refreshCookieName = "salary_portal_refresh_token";
export const accessTokenLifetimeInSeconds = 60 * 15;
export const refreshTokenLifetimeInSeconds = 60 * 60 * 24 * 30;
function authCookieOptions() {
    const isProduction = process.env.NODE_ENV === "production";
    return {
        httpOnly: true,
        // The frontend and API use separate Vercel domains in production.
        // Browsers only send an authenticated cross-origin cookie with SameSite=None.
        sameSite: isProduction ? "None" : "Lax",
        secure: isProduction,
        path: "/",
    };
}
export async function createAccessToken(user) {
    const secret = process.env.AUTH_JWT_SECRET;
    if (!secret)
        throw new Error("AUTH_JWT_SECRET is required");
    const payload = {
        sub: user.id,
        employeeId: user.employeeId,
        company: user.company,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + accessTokenLifetimeInSeconds,
    };
    return sign(payload, secret, "HS256");
}
export async function setAuthCookies(c, user, refreshToken, persistent) {
    const accessToken = await createAccessToken(user);
    const options = {
        ...authCookieOptions(),
        ...(persistent ? { maxAge: refreshTokenLifetimeInSeconds } : {}),
    };
    setCookie(c, accessCookieName, accessToken, options);
    setCookie(c, refreshCookieName, refreshToken, options);
}
export function clearAuthCookies(c) {
    const options = authCookieOptions();
    deleteCookie(c, accessCookieName, options);
    deleteCookie(c, refreshCookieName, options);
}
