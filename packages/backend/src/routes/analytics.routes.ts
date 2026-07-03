// backend/src/routes/analytics.routes.ts
import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth, AuthedRequest } from "../middleware/requireAuth";

const prisma = new PrismaClient();
const router = Router();

router.use(requireAuth);

/**
 * GET /analytics/overview
 * Fetches user analytics overview: completed count, average score, subject stats, and recent activity.
 */
router.get("/analytics/overview", async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.telegramId!;

    // Fetch all completed exam sessions for user
    const sessions = await prisma.examSession.findMany({
      where: { userId, isCompleted: true },
      orderBy: { completedAt: "desc" },
    });

    if (sessions.length === 0) {
      return res.json({
        totalExams: 0,
        averageScorePct: 0,
        streakDays: 0,
        subjectBreakdown: {},
        history: [],
      });
    }

    let totalScore = 0;
    let totalQuestions = 0;
    const subjectStats: Record<string, { totalScore: number; totalQuestions: number; sessionsCount: number }> = {};

    for (const session of sessions) {
      const qIds = (session.questionIds as string[]) || [];
      const sessionQuestionsCount = qIds.length;
      totalScore += session.score;
      totalQuestions += sessionQuestionsCount;

      const sub = session.subject || "General";
      if (!subjectStats[sub]) {
        subjectStats[sub] = { totalScore: 0, totalQuestions: 0, sessionsCount: 0 };
      }
      subjectStats[sub].totalScore += session.score;
      subjectStats[sub].totalQuestions += sessionQuestionsCount;
      subjectStats[sub].sessionsCount += 1;
    }

    const averageScorePct = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;

    const subjectBreakdown: Record<string, { averagePct: number; examsTaken: number }> = {};
    for (const [sub, stats] of Object.entries(subjectStats)) {
      subjectBreakdown[sub] = {
        averagePct: stats.totalQuestions > 0 ? Math.round((stats.totalScore / stats.totalQuestions) * 100) : 0,
        examsTaken: stats.sessionsCount,
      };
    }

    // Streak calculation (simple active days logic)
    const uniqueDays = new Set(
      sessions.map((s) => s.completedAt ? new Date(s.completedAt).toDateString() : "")
    );
    uniqueDays.delete("");
    const streakDays = uniqueDays.size;

    return res.json({
      totalExams: sessions.length,
      averageScorePct,
      streakDays,
      subjectBreakdown,
      history: sessions.slice(0, 10).map((s) => ({
        id: s.id,
        subject: s.subject,
        score: s.score,
        totalQuestions: ((s.questionIds as string[]) || []).length,
        completedAt: s.completedAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching overview analytics:", error);
    return res.status(500).json({ error: "internal_error" });
  }
});

/**
 * GET /analytics/subject/:subject
 * Detailed performance for a single subject.
 */
router.get("/analytics/subject/:subject", async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.telegramId!;
    const { subject } = req.params;

    const sessions = await prisma.examSession.findMany({
      where: {
        userId,
        subject,
        isCompleted: true,
      },
      orderBy: { completedAt: "desc" },
    });

    if (sessions.length === 0) {
      return res.status(404).json({ error: "no_data_for_subject" });
    }

    const history = sessions.map((s) => ({
      id: s.id,
      score: s.score,
      totalQuestions: ((s.questionIds as string[]) || []).length,
      completedAt: s.completedAt,
    }));

    const totalScore = sessions.reduce((acc, s) => acc + s.score, 0);
    const totalQuestions = sessions.reduce((acc, s) => acc + ((s.questionIds as string[]) || []).length, 0);
    const averageScorePct = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;

    return res.json({
      subject,
      examsCount: sessions.length,
      averageScorePct,
      history,
    });
  } catch (error) {
    console.error("Error fetching subject analytics:", error);
    return res.status(500).json({ error: "internal_error" });
  }
});

export default router;
