// backend/src/bot.ts
import { Bot, InlineKeyboard } from "grammy";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const botToken = process.env.TELEGRAM_BOT_TOKEN;

export const bot = botToken ? new Bot(botToken) : null;

if (bot) {
  // Handler for /start command
  bot.command("start", async (ctx) => {
    const telegramId = BigInt(ctx.from?.id || 0);
    const firstName = ctx.from?.first_name || "there";
    const username = ctx.from?.username;

    // Deep linking parameter (e.g. /start?startapp=subject_math)
    const startPayload = ctx.match;

    // Upsert user inside Telegram flow too
    try {
      await prisma.user.upsert({
        where: { telegramId },
        update: { username, firstName },
        create: { telegramId, username, firstName },
      });
    } catch (err) {
      console.error("Bot failed to register/update user:", err);
    }

    let welcomeText = `👋 Hello, *${firstName}*!\n\nWelcome to *Ace-Ifa-Boru* — the ultimate premium exam preparation platform! 🚀\n\nPrepare for your tests, track your analytics, and master subjects with real-time feedback.`;

    if (startPayload) {
      welcomeText += `\n\n🎯 Ready to start with subject: *${startPayload}*? Open the app below to launch directly!`;
    } else {
      welcomeText += `\n\nClick the button below to start your exam practice session!`;
    }

    const appUrl = process.env.FRONTEND_ORIGIN || "http://localhost:3000";

    const keyboard = new InlineKeyboard().webApp("🚀 Launch Exam Platform", appUrl);

    await ctx.reply(welcomeText, {
      parse_mode: "Markdown",
      reply_markup: keyboard,
    });
  });

  // Handler for /stats command
  bot.command("stats", async (ctx) => {
    const telegramId = BigInt(ctx.from?.id || 0);

    try {
      const user = await prisma.user.findUnique({
        where: { telegramId },
        include: { examSessions: { where: { isCompleted: true } } },
      });

      if (!user || user.examSessions.length === 0) {
        return ctx.reply(
          "📊 You haven't taken any exams yet! Launch the app and complete a quiz to see your statistics here."
        );
      }

      const sessions = user.examSessions;
      const totalExams = sessions.length;
      const totalScore = sessions.reduce((acc, s) => acc + s.score, 0);
      const totalQuestions = sessions.reduce((acc, s) => acc + ((s.questionIds as string[]) || []).length, 0);
      const avgScore = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;

      const premiumStatus = user.isPremium && (!user.premiumUntil || user.premiumUntil.getTime() > Date.now())
        ? "👑 Premium (Unlimited Access)"
        : "🆓 Free Plan";

      const statsText = `📊 *Your Performance Summary*:\n\n` +
        `👤 *User*: ${user.firstName} ${user.lastName || ""}\n` +
        `⭐ *Status*: ${premiumStatus}\n` +
        `📝 *Completed Exams*: ${totalExams}\n` +
        `🎯 *Average Score*: ${avgScore}%\n\n` +
        `Launch the app to see detailed subject-specific analytics!`;

      await ctx.reply(statsText, { parse_mode: "Markdown" });
    } catch (err) {
      console.error("Bot failed to fetch stats:", err);
      await ctx.reply("❌ Unable to fetch statistics at the moment. Please try again later.");
    }
  });

  // Handler for /premium command
  bot.command("premium", async (ctx) => {
    const text = `👑 *Go Premium with Ace-Ifa-Boru!*\n\n` +
      `Unlock full access to the platform and accelerate your learning:\n\n` +
      `✅ *Unlimited Timed Mock Exams* in all categories\n` +
      `✅ *Detailed Explanations* for every correct and incorrect answer\n` +
      `✅ *Advanced Analytics Dashboard* tracking subject mastery & performance trends\n` +
      `✅ *Ad-Free experience* with priority server load\n\n` +
      `Open the app and navigate to the upgrade screen to activate premium instantly!`;

    await ctx.reply(text, { parse_mode: "Markdown" });
  });

  // Catch-all help
  bot.on("message", async (ctx) => {
    const text = `🤖 *Ace-Ifa-Boru Bot Commands*:\n\n` +
      `/start - Launch the Exam platform\n` +
      `/stats - View your quiz performance statistics\n` +
      `/premium - Learn about premium membership benefits\n\n` +
      `Launch the platform to start practice exams!`;
    await ctx.reply(text, { parse_mode: "Markdown" });
  });

  console.log("Telegram Bot client configured.");
} else {
  console.log("TELEGRAM_BOT_TOKEN not provided. Bot skipped.");
}
