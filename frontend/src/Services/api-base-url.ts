// Keep browser API calls same-origin in production. Vercel forwards /api/* to
// Railway, so authentication cookies remain available to Next middleware.
const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

export const apiBaseUrl =
  process.env.NODE_ENV === "production"
    ? ""
    : (configuredApiUrl ?? "http://localhost:4000");
