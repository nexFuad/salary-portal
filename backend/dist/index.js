import "dotenv/config";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { Hono } from "hono";
import apiRoutes from "./routes/index.js";
import { prisma } from "./lib/prisma.js";
if (process.env.NODE_ENV === "production" && !process.env.AUTH_JWT_SECRET) {
    throw new Error("AUTH_JWT_SECRET is required in production");
}
const fallbackOrigin = "http://localhost:3000";
function frontendOrigins() {
    return (process.env.FRONTEND_URL ?? fallbackOrigin)
        .split(",")
        .map((origin) => origin.trim().replace(/\/$/, ""))
        .filter(Boolean);
}
const app = new Hono();
app.use("*", cors({
    origin: (origin) => {
        const origins = frontendOrigins();
        return origin && origins.includes(origin)
            ? origin
            : (origins[0] ?? fallbackOrigin);
    },
    credentials: true,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
}));
app.get("/", (c) => c.json({ message: "Salary Portal API is running" }));
app.get("/health", (c) => c.json({ status: "ok" }));
app.get("/health/database", async (c) => {
    try {
        await prisma.user.count();
        return c.json({ status: "ok" });
    }
    catch (error) {
        console.error("Database health check failed", error);
        return c.json({ status: "unavailable" }, 503);
    }
});
app.route("/api", apiRoutes);
app.onError((error, c) => {
    console.error("Unhandled API error", error);
    return c.json({ message: "An unexpected server error occurred." }, 500);
});
serve({
    fetch: app.fetch,
    port: Number(process.env.PORT ?? 4000),
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
});
