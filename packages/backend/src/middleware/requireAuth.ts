// backend/src/middleware/requireAuth.ts
//
// Guards API routes after the initial /auth exchange.
// Supports both Telegram (BigInt ID) and Credential-based (UUID String) authentication.

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export interface AuthedRequest extends Request {
  telegramId?: bigint;
  credentialUserId?: string;
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "missing_token" });
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string; type?: "telegram" | "credential" };
    
    if (payload.type === "credential") {
      req.credentialUserId = payload.sub;
    } else {
      req.telegramId = BigInt(payload.sub);
    }
    
    next();
  } catch {
    return res.status(401).json({ error: "invalid_or_expired_token" });
  }
}
