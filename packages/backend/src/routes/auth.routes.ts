// backend/src/routes/auth.routes.ts
//
// POST /auth/telegram
// Body: { initData: string }
// -> validates initData, upserts the user, returns a short-lived JWT the
//    frontend stores in memory (not localStorage, to limit XSS blast radius
//    inside the Telegram in-app browser) and sends as a Bearer token.

import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import {
  verifyTelegramInitData,
  InitDataValidationError,
} from "../lib/verifyInitData";

const prisma = new PrismaClient();
const router = Router();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = "12h";

router.post("/auth/telegram", async (req: Request, res: Response) => {
  const { initData } = req.body ?? {};

  let verified;
  try {
    verified = verifyTelegramInitData(initData, BOT_TOKEN);
  } catch (err) {
    if (err instanceof InitDataValidationError) {
      return res.status(401).json({ error: "invalid_init_data", message: err.message });
    }
    return res.status(500).json({ error: "internal_error" });
  }

  const { user } = verified;
  const telegramId = BigInt(user.id);

  // Upsert user — never trust is_premium/premium_until from the client;
  // those are only ever set by your payment webhook, never here.
  const dbUser = await prisma.user.upsert({
    where: { telegramId },
    update: {
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      languageCode: user.language_code,
      photoUrl: user.photo_url,
    },
    create: {
      telegramId,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      languageCode: user.language_code,
      photoUrl: user.photo_url,
    },
  });

  const token = jwt.sign(
    { sub: dbUser.telegramId.toString(), username: dbUser.username },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return res.json({
    token,
    user: {
      telegramId: dbUser.telegramId.toString(),
      username: dbUser.username,
      firstName: dbUser.firstName,
      isPremium: dbUser.isPremium,
      premiumUntil: dbUser.premiumUntil,
    },
  });
});

export default router;
