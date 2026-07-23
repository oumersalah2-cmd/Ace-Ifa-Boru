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
    if (req.credentialUserId) {
      const user = await prisma.credentialUser.findUnique({
        where: { id: req.credentialUserId },
      });

      if (!user) {
        return res.status(404).json({ error: "user_not_found" });
      }

      const isPremium = user.isPremium && (!user.premiumUntil || user.premiumUntil.getTime() > Date.now());

      return res.json({
        isPremium,
        premiumUntil: user.premiumUntil,
      });
    }

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
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);

    if (req.credentialUserId) {
      const updatedUser = await prisma.credentialUser.update({
        where: { id: req.credentialUserId },
        data: {
          isPremium: true,
          premiumUntil: ninetyDaysFromNow,
        },
      });

      return res.json({
        success: true,
        message: "Premium access granted for 90 days!",
        user: {
          id: updatedUser.id,
          isPremium: updatedUser.isPremium,
          premiumUntil: updatedUser.premiumUntil,
        },
      });
    }

    const updatedUser = await prisma.user.update({
      where: { telegramId: req.telegramId! },
      data: {
        isPremium: true,
        premiumUntil: ninetyDaysFromNow,
      },
    });

    return res.json({
      success: true,
      message: "Premium access granted for 90 days!",
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
