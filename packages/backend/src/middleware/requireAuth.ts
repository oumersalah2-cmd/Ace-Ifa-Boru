// backend/src/middleware/requireAuth.ts
//
// Guards API routes after the initial /auth/telegram exchange.
// Frontend sends: Authorization: Bearer <jwt>

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export interface AuthedRequest extends Request {
  telegramId?: bigint;
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "missing_token" });
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string };
    req.telegramId = BigInt(payload.sub);
    next();
  } catch {
    return res.status(401).json({ error: "invalid_or_expired_token" });
  }
}
