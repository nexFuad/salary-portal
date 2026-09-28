// Keep browser API calls same-origin in production. Vercel forwards /api/* to
// Railway, so the browser sends authentication cookies with dashboard API calls.
const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

export const apiBaseUrl =
  process.env.NODE_ENV === "production"
    ? ""
    : (configuredApiUrl ?? "http://localhost:4000");
