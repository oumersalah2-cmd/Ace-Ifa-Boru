// backend/src/routes/exam.routes.ts

import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth, AuthedRequest } from "../middleware/requireAuth";

const prisma = new PrismaClient();
const router = Router();

router.use(requireAuth);

/**
 * Returns whether a user currently counts as premium, honoring premium_until
 * even if the is_premium flag hasn't been flipped back by a cron/webhook yet.
 */
function isCurrentlyPremium(user: { isPremium: boolean; premiumUntil: Date | null }) {
  if (!user.isPremium) return false;
  if (user.premiumUntil && user.premiumUntil.getTime() < Date.now()) return false;
  return true;
}

/**
 * GET /questions/:id
 * Blocks access to premium questions server-side. Frontend never receives
 * the question_text/options/correct_option_index for locked content — it
 * gets a paywall marker instead, so answers/explanations can't be scraped
 * from the network tab.
 */
router.get("/questions/:id", async (req: AuthedRequest, res: Response) => {
  const question = await prisma.question.findUnique({ where: { id: req.params.id } });
  if (!question) return res.status(404).json({ error: "not_found" });

  if (!question.isFree) {
    const user = await prisma.user.findUnique({ where: { telegramId: req.telegramId! } });
    if (!user || !isCurrentlyPremium(user)) {
      return res.status(402).json({
        error: "paywall",
        message: "This question requires a premium subscription.",
      });
    }
  }

  return res.json(question);
});

/**
 * POST /exam-sessions
 * Body: { subject, questionIds: string[] }
 * Creates a session. If any requested question is premium and the user
 * isn't, those ids are silently dropped from the session (fail closed).
 */
router.post("/exam-sessions", async (req: AuthedRequest, res: Response) => {
  const { subject, questionIds } = req.body as { subject?: string; questionIds?: string[] };

  const user = await prisma.user.findUnique({ where: { telegramId: req.telegramId! } });
  const premium = user ? isCurrentlyPremium(user) : false;

  let questions;
  if (questionIds && questionIds.length > 0) {
    questions = await prisma.question.findMany({ where: { id: { in: questionIds } } });
  } else {
    // If no specific question IDs are requested, load questions for the given subject
    questions = await prisma.question.findMany({
      where: subject ? { subject } : {},
      take: 10 // Take up to 10 questions for a standard session
    });
  }

  const allowedIds = questions
    .filter((q) => q.isFree || premium)
    .map((q) => q.id);

  if (allowedIds.length === 0) {
    return res.status(402).json({ error: "paywall", message: "No accessible questions in this set." });
  }

  const session = await prisma.examSession.create({
    data: {
      userId: req.telegramId!,
      subject,
      questionIds: allowedIds,
      currentAnswers: {},
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1hr exam window
    },
  });

  return res.status(201).json(session);
});

/**
 * GET /exam-sessions/:id
 * Fetches details of a specific exam session.
 */
router.get("/exam-sessions/:id", async (req: AuthedRequest, res: Response) => {
  const session = await prisma.examSession.findUnique({
    where: { id: req.params.id },
  });

  if (!session || session.userId !== req.telegramId) {
    return res.status(404).json({ error: "not_found" });
  }

  return res.json(session);
});

/**
 * PATCH /exam-sessions/:id/answer
 * Body: { questionId: string, selectedIndex: number }
 * Autosave: called on every answer tap so an app kill mid-exam loses nothing.
 */
router.patch("/exam-sessions/:id/answer", async (req: AuthedRequest, res: Response) => {
  const { questionId, selectedIndex } = req.body as { questionId: string; selectedIndex: number };

  const session = await prisma.examSession.findUnique({ where: { id: req.params.id } });
  if (!session || session.userId !== req.telegramId) {
    return res.status(404).json({ error: "not_found" });
  }
  if (session.isCompleted) {
    return res.status(409).json({ error: "session_already_completed" });
  }

  const currentAnswers = { ...(session.currentAnswers as Record<string, number>) };
  currentAnswers[questionId] = selectedIndex;

  const updated = await prisma.examSession.update({
    where: { id: session.id },
    data: { currentAnswers },
  });

  return res.json({ ok: true, currentAnswers: updated.currentAnswers });
});

/**
 * POST /exam-sessions/:id/submit
 * Scores the session server-side (never trust a client-computed score).
 */
router.post("/exam-sessions/:id/submit", async (req: AuthedRequest, res: Response) => {
  const session = await prisma.examSession.findUnique({ where: { id: req.params.id } });
  if (!session || session.userId !== req.telegramId) {
    return res.status(404).json({ error: "not_found" });
  }

  const questionIds = session.questionIds as string[];
  const answers = session.currentAnswers as Record<string, number>;
  const questions = await prisma.question.findMany({ where: { id: { in: questionIds } } });

  let score = 0;
  for (const q of questions) {
    if (answers[q.id] === q.correctOptionIndex) score += 1;
  }

  const updated = await prisma.examSession.update({
    where: { id: session.id },
    data: { score, isCompleted: true, completedAt: new Date() },
  });

  return res.json(updated);
});

export default router;
