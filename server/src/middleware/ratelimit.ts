import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import type { Request } from "express";

const userOrIp = (req: Request) =>
  (req as any).user?.id ?? ipKeyGenerator(req.ip ?? "");

export const apiLimiter = rateLimit({
  windowMs: 60_000,
  limit: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip: (req) => req.path === "/health",
  message: { error: "Too many requests, slow down." },
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many login attempts. Try again in 15 minutes." },
});

export const aiLimiter = rateLimit({
  windowMs: 60_000,
  limit: 30,
  keyGenerator: userOrIp,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "AI endpoints are rate limited. Try again shortly." },
});