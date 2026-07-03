// backend/src/routes/paywall.routes.ts
import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth, AuthedRequest } from "../middleware/requireAuth";

const prisma = new PrismaClient();
const router = Router();

router.use(requireAuth);

/**
 * GET /paywall/check
 * Returns the current premium status of the logged-in user.
 */
router.get("/paywall/check", async (req: AuthedRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { telegramId: req.telegramId! },
    });

    if (!user) {
      return res.status(404).json({ error: "user_not_found" });
    }

    const isPremium = user.isPremium && (!user.premiumUntil || user.premiumUntil.getTime() > Date.now());

    return res.json({
      isPremium,
      premiumUntil: user.premiumUntil,
    });
  } catch (error) {
    console.error("Error checking paywall status:", error);
    return res.status(500).json({ error: "internal_error" });
  }
});

/**
 * POST /paywall/upgrade
 * Mocks a premium upgrade. Grants 30 days of premium access.
 */
router.post("/paywall/upgrade", async (req: AuthedRequest, res: Response) => {
  try {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const updatedUser = await prisma.user.update({
      where: { telegramId: req.telegramId! },
      data: {
        isPremium: true,
        premiumUntil: thirtyDaysFromNow,
      },
    });

    return res.json({
      success: true,
      message: "Premium access granted for 30 days!",
      user: {
        telegramId: updatedUser.telegramId.toString(),
        isPremium: updatedUser.isPremium,
        premiumUntil: updatedUser.premiumUntil,
      },
    });
  } catch (error) {
    console.error("Error executing paywall upgrade:", error);
    return res.status(500).json({ error: "internal_error" });
  }
});

export default router;
