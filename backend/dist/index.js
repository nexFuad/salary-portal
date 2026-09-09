import "dotenv/config";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { Hono } from "hono";
import apiRoutes from "./routes/index.js";
const app = new Hono();
app.use("*", cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
    credentials: true,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
}));
app.get("/", (c) => {
    return c.json({ message: "Salary Portal API is running" });
});
app.get("/health", (c) => {
    return c.json({ status: "ok" });
});
app.route("/api", apiRoutes);
serve({
    fetch: app.fetch,
    port: Number(process.env.PORT ?? 4000),
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
});
