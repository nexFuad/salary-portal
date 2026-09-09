import { NextResponse, type NextRequest } from "next/server";
import type { UserRole } from "@/Types/auth";

const apiBaseUrl = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
).replace(/\/$/, "");
const cookieName = "salary_portal_token";
const refreshCookieName = "salary_portal_refresh_token";

type AuthSession = {
  role: UserRole;
  cookies: string[];
};

function dashboardPath(role: UserRole) {
  return role === "OFFICER" ? "/Officer" : "/OM";
}

function getResponseCookies(response: Response) {
  const headers = response.headers as Headers & {
    getSetCookie?: () => string[];
  };
  const cookies = headers.getSetCookie?.();
  if (cookies?.length) return cookies;

  const cookie = headers.get("set-cookie");
  return cookie ? cookie.split(", ") : [];
}

function getRole(data: unknown): UserRole | null {
  const response = data as { user?: { role?: UserRole } };
  return response.user?.role === "OFFICER" || response.user?.role === "OM"
    ? response.user.role
    : null;
}

async function getAuthenticatedSession(
  token: string | undefined,
  cookieHeader: string,
): Promise<AuthSession | null> {
  try {
    if (token) {
      const response = await fetch(`${apiBaseUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      if (response.ok) {
        const role = getRole(await response.json());
        return role ? { role, cookies: [] } : null;
      }
    }

    const refreshResponse = await fetch(`${apiBaseUrl}/api/auth/refresh`, {
      method: "POST",
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    });

    if (!refreshResponse.ok) return null;

    const role = getRole(await refreshResponse.json());
    return role ? { role, cookies: getResponseCookies(refreshResponse) } : null;
  } catch {
    return null;
  }
}

function responseWithCookies(response: NextResponse, cookies: string[]) {
  cookies.forEach((cookie) => response.headers.append("set-cookie", cookie));
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(cookieName)?.value;
  const refreshToken = request.cookies.get(refreshCookieName)?.value;
  const isPublicRoute = pathname === "/" || pathname === "/Login";
  const isOfficerRoute = pathname.startsWith("/Officer");
  const isOmRoute = pathname.startsWith("/OM");

  if (!token && !refreshToken) {
    if (isOfficerRoute || isOmRoute) {
      return NextResponse.redirect(new URL("/Login", request.url));
    }
    return NextResponse.next();
  }

  const session = await getAuthenticatedSession(
    token,
    request.headers.get("cookie") ?? "",
  );
  if (!session) {
    if (!isOfficerRoute && !isOmRoute) return NextResponse.next();

    const response = NextResponse.redirect(new URL("/Login", request.url));
    response.cookies.delete(cookieName);
    return response;
  }

  const targetDashboard = dashboardPath(session.role);
  if (
    isPublicRoute ||
    (isOfficerRoute && session.role !== "OFFICER") ||
    (isOmRoute && session.role !== "OM")
  ) {
    return responseWithCookies(
      NextResponse.redirect(new URL(targetDashboard, request.url)),
      session.cookies,
    );
  }

  return responseWithCookies(NextResponse.next(), session.cookies);
}

export const config = {
  matcher: ["/", "/Login", "/Officer/:path*", "/OM/:path*"],
};
