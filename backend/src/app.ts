import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import type { AppEnv } from "./modules/auth/auth.types.js";
import apiRoutes from "./routes/index.js";

const fallbackOrigin = "http://localhost:3000";

function frontendOrigins() {
  return (process.env.FRONTEND_URL ?? fallbackOrigin)
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);
}

const app = new Hono<AppEnv>();

app.use(
  "*",
  cors({
    origin: (origin) => {
      const origins = frontendOrigins();
      return origin && origins.includes(origin)
        ? origin
        : (origins[0] ?? fallbackOrigin);
    },
    credentials: true,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  }),
);

app.get("/", (c) => c.json({ message: "Salary Portal API is running" }));
app.get("/health", (c) => c.json({ status: "ok" }));
// Vercel exposes serverless functions below /api.
app.get("/api/health", (c) => c.json({ status: "ok" }));

app.route("/api", apiRoutes);

export default app;
