// backend/src/routes/credential-auth.routes.ts
import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = "12h";

router.post("/auth/credential/login", async (req: Request, res: Response) => {
  const { username, password } = req.body ?? {};

  if (!username || !password) {
    return res.status(400).json({ error: "missing_credentials", message: "Username and password are required." });
  }

  try {
    const credUser = await prisma.credentialUser.findUnique({
      where: { username: username.toLowerCase().trim() },
    });

    if (!credUser) {
      return res.status(401).json({ error: "invalid_credentials", message: "Username ykn password dogoggora." });
    }

    const isMatch = await bcrypt.compare(password, credUser.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "invalid_credentials", message: "Username ykn password dogoggora." });
    }

    const isPremium = credUser.isPremium && (!credUser.premiumUntil || credUser.premiumUntil.getTime() > Date.now());

    // Sign JWT with type: "credential"
    const token = jwt.sign(
      { sub: credUser.id, username: credUser.username, type: "credential" },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({
      token,
      user: {
        id: credUser.id,
        username: credUser.username,
        firstName: credUser.fullName || credUser.username,
        isPremium,
        premiumUntil: credUser.premiumUntil,
      },
    });
  } catch (error) {
    console.error("Credential login error:", error);
    return res.status(500).json({ error: "internal_error" });
  }
});

export default router;
