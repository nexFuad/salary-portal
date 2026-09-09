import "dotenv/config";
import { Hono, type Context } from "hono";
import { cors } from "hono/cors";
import type { AppEnv } from "./modules/auth/auth.types.js";
import apiRoutes from "./routes/index.js";

const defaultFrontendOrigin = "http://localhost:3000";

function allowedOrigins() {
  return (process.env.FRONTEND_URL ?? defaultFrontendOrigin)
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);
}

const app = new Hono<AppEnv>();

app.use(
  "*",
  cors({
    origin: (origin) => {
      const origins = allowedOrigins();
      return origin && origins.includes(origin) ? origin : origins[0] ?? defaultFrontendOrigin;
    },
    credentials: true,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  }),
);

app.get("/", (c) => c.json({ message: "Salary Portal API is running" }));

const healthResponse = (c: Context<AppEnv>) => c.json({ status: "ok" });

app.get("/health", healthResponse);
// Vercel only exposes files under /api, so keep an API health endpoint too.
app.get("/api/health", healthResponse);

app.route("/api", apiRoutes);

export default app;
