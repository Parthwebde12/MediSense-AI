import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/auth";
import type { UserRole } from "../models/User";

export interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const [scheme, token] = (req.headers.authorization ?? "").split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    req.user = verifyToken(token);
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
  next();
};

export const requireRole = (role: UserRole) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== role) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
};