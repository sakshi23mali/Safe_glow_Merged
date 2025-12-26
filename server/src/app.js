import cors from "cors";
import crypto from "crypto";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import { errorHandler, notFoundHandler } from "./middleware/errors.js";
import { requestLogger } from "./middleware/requestLogger.js";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/product.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

if (!process.env.JWT_SECRET && process.env.NODE_ENV !== "production") {
  process.env.JWT_SECRET = crypto.randomBytes(32).toString("hex");
  console.warn("JWT_SECRET not set; generated a temporary one for this session");
}

function parseCookies(header) {
  const raw = String(header || "");
  if (!raw) return {};
  return raw.split(";").reduce((acc, part) => {
    const idx = part.indexOf("=");
    if (idx === -1) return acc;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (!key) return acc;
    acc[key] = decodeURIComponent(val);
    return acc;
  }, {});
}

function csrfProtection(req, res, next) {
  const method = String(req.method || "").toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS")
    return next();

  // Skip CSRF for login and register as they establish the session
  const path = String(req.path || "");
  if (path === "/api/auth/login" || path === "/api/auth/register")
    return next();

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) return next();

  const cookies = parseCookies(req.headers.cookie);
  const tokenCookie = cookies.safeglow_token;
  if (!tokenCookie) return next();

  const csrfCookie = cookies.csrf_token;
  const csrfHeader = req.headers["x-csrf-token"];
  if (csrfCookie && csrfHeader && String(csrfHeader) === String(csrfCookie))
    return next();

  res.status(403).json({ message: "CSRF token missing or invalid" });
}

function buildCorsOptions() {
  const raw = process.env.CLIENT_ORIGINS || "";
  const allowedOrigins = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
  };
}

export async function createApp({ connectDb = true } = {}) {
  const app = express();

  app.use(helmet());
  app.use(cors(buildCorsOptions()));
  app.use(express.json({ limit: "1mb" }));
  app.use(requestLogger);
  app.use(csrfProtection);

  const conn = connectDb ? await connectDB() : {};
  app.locals.dbReady = Boolean(conn);

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.use((req, _res, next) => {
    if (!app.locals.dbReady && String(req.path || "").startsWith("/api/")) {
      const err = new Error("Database unavailable");
      err.statusCode = 503;
      return next(err);
    }
    next();
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/products", productRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
